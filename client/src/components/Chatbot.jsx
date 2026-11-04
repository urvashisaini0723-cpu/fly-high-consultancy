import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSend,
  FiX,
  FiMaximize2,
  FiMinimize2,
  FiRefreshCw,
  FiUser,
  FiMessageSquare,
  FiHelpCircle,
  FiInfo,
  FiMail,
  FiCompass
} from "react-icons/fi";
import RobotCanvas from "./robot/RobotCanvas";
import { apiUrl } from "../lib/api";

// Guided website tour. Kept local (no AI call) so it always works instantly,
// even while the free backend is waking up, and never describes a page wrongly.
// Order matters: Home -> Owner -> Courses -> Gallery -> Contact.
const TOUR_STEPS = [
  {
    path: "/",
    label: "Home",
    text: `This is where every journey starts. At the top, use "Get Free Consultation" to send an enquiry or "Explore Courses" to see our programmes.

Scroll down for our stats, six core services, the countries we handle, why families choose Fly High, and the leadership team.`,
  },
  {
    path: "/owner",
    label: "Owner",
    text: `Meet the people behind Fly High: Founder and Director Ankit Kumar, Co-Founder Tarsem Verma, Director Rajan Sharma, and our counselors Kajal and Nisha.

You can also read the founder's story and our mission.`,
  },
  {
    path: "/courses",
    label: "Courses",
    text: `Here you can see every service in detail: study visas for Canada, Australia, UK, USA, New Zealand and Europe, tourist visas, spouse and dependent visas, PTE coaching, interview preparation and career counseling.

The FAQ section at the bottom answers common questions about eligibility, documents and fees.`,
  },
  {
    path: "/gallery",
    label: "Gallery",
    text: `See real moments from our Pehowa office: team photos, client success stories and our 2nd anniversary celebration. The anniversary poster is pinned first.

Tap any photo to open it full size.`,
  },
  {
    path: "/contact",
    label: "Contact",
    text: `Use the enquiry form to share your name, phone, email and interest. Our team replies with a free profile assessment.

You can also call or WhatsApp +91-93061-42129, visit us near New PNB Bank in Pehowa, or come by Monday to Saturday, 10:00 AM to 7:00 PM.`,
  },
];

const Chatbot = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  // first popover shown when the robot launcher is clicked
  const [showChoice, setShowChoice] = useState(false);
  // -1 = tour not running, otherwise index inside TOUR_STEPS
  const [tourStep, setTourStep] = useState(-1);
  // paused when the visitor scrolls/touches during the auto tour
  const [tourPaused, setTourPaused] = useState(false);
  // bumping this replays the current page after Resume
  const [tourRunId, setTourRunId] = useState(0);
  const tourStepRef = useRef(-1);
  const [showScrollbar, setShowScrollbar] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm FlyBot from Fly High Consultancy, Pehowa.\n\nStudy visas (Canada, Australia, UK, USA, New Zealand, Europe), tourist and spouse visas, PTE coaching and interview preparation — all under one roof.\n\nCall or WhatsApp +91-93061-42129 for a free profile assessment. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isAvatarHovered, setIsAvatarHovered] = useState(false);
  // "checking" | "online" | "offline" - reflects the real backend, not a guess
  const [serviceStatus, setServiceStatus] = useState("checking");
  // true when a reply is taking unusually long (Render free tier wakes up slowly)
  const [slowNotice, setSlowNotice] = useState(false);
  // holds the last message that could not be delivered, so Retry can resend it
  const [failedMessage, setFailedMessage] = useState(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const inFlightRef = useRef(false);
  const autoRetriedRef = useRef(null);

  // Check mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Let the page know an overlay is open so small floating elements can step
  // aside (the mobile social rail would otherwise peek past the card edge).
  // Covers both the chat window and the chat/tour chooser card.
  useEffect(() => {
    document.body.classList.toggle("chat-open", isOpen || showChoice);
    return () => document.body.classList.remove("chat-open");
  }, [isOpen, showChoice]);

  // On iOS the keyboard does not resize the layout viewport. Track the visual
  // viewport so the card (and the send button) move above the keyboard instead
  // of hiding behind it.
  useEffect(() => {
    if (!isOpen || !isMobile) return undefined;
    const vv = window.visualViewport;
    if (!vv) return undefined;
    const update = () => {
      const keyboard = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      document.documentElement.style.setProperty("--chat-kb", `${Math.round(keyboard)}px`);
    };
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      document.documentElement.style.removeProperty("--chat-kb");
    };
  }, [isOpen, isMobile]);

  // Grow the message box with the text, up to 140px, then let it scroll.
  const resizeInput = (el) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(Math.max(el.scrollHeight, 44), 140)}px`;
  };

  // Scroll the conversation area itself (never the page) to the newest message
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return undefined;
    const id = requestAnimationFrame(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    });
    return () => cancelAnimationFrame(id);
  }, [messages, isLoading, failedMessage]);

  // Check scrollbar visibility
  useEffect(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const hasOverflow = container.scrollHeight > container.clientHeight;
      setShowScrollbar(hasOverflow);
    }
  }, [messages]);

  // Format timestamp
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", { 
      hour: "2-digit", 
      minute: "2-digit",
      hour12: true 
    });
  };

  // Ping the real backend so the UI shows an honest status instead of guessing.
  // silent = keep the current badge while re-checking (no "Connecting..." flicker).
  const checkService = useCallback(async (silent = false) => {
    if (!silent) setServiceStatus("checking");
    const controller = new AbortController();
    // generous: the Render free tier can take a while to wake up
    const timer = setTimeout(() => controller.abort(), 12000);

    try {
      // /api/health is instant and only proves the API server itself is up.
      // (The chat still answers from the local knowledge base if the AI provider is down.)
      const response = await fetch(apiUrl("/api/health"), {
        signal: controller.signal,
        cache: "no-store",
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (!data || data.success !== true) throw new Error("bad payload");
      setServiceStatus("online");
      return true;
    } catch {
      setServiceStatus("offline");
      return false;
    } finally {
      clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    checkService();
  }, [checkService]);

  // Coming back to the tab must not leave a stale "Offline" badge:
  // re-check quietly whenever the page becomes visible again.
  useEffect(() => {
    const recheck = () => {
      if (document.visibilityState === "visible") checkService(true);
    };
    document.addEventListener("visibilitychange", recheck);
    window.addEventListener("focus", recheck);
    return () => {
      document.removeEventListener("visibilitychange", recheck);
      window.removeEventListener("focus", recheck);
    };
  }, [checkService]);

  // Hint when the first reply is slow (Render free tier cold start)
  useEffect(() => {
    if (!isLoading) {
      setSlowNotice(false);
      return undefined;
    }
    const timer = setTimeout(() => setSlowNotice(true), 6000);
    return () => clearTimeout(timer);
  }, [isLoading]);

  // Ask the backend once. Errors are tagged so the UI can decide what to do:
  // - friendly: the server already explained the problem (rate limit, validation)
  // - backendDown/network/timeout: infrastructure problem, safe to retry
  const requestReply = async (userMessage, history) => {
    const controller = new AbortController();
    // 60s: covers a sleeping Render instance plus the AI reply
    const timer = setTimeout(() => controller.abort(), 60000);

    try {
      let response;
      try {
        response = await fetch(apiUrl("/api/chatbot/chat"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMessage, history }),
          signal: controller.signal,
        });
      } catch (error) {
        if (error?.name === "AbortError") {
          const timedOut = new Error("The assistant took too long to respond.");
          timedOut.timeout = true;
          timedOut.retryable = true;
          throw timedOut;
        }
        const offline = new Error("Could not reach the FlyBot server.");
        offline.network = true;
        offline.retryable = true;
        throw offline;
      }

      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      const reply = data && typeof data.reply === "string" ? data.reply.trim() : "";

      if (response.ok && reply) return reply;

      if (data && data.backendDown) {
        const down = new Error("The FlyBot server is not running.");
        down.backendDown = true;
        down.retryable = true;
        throw down;
      }

      // server replied with a useful, user-facing message (rate limit, validation)
      if (reply) {
        const friendly = new Error(reply);
        friendly.friendly = reply;
        friendly.retryable = false;
        throw friendly;
      }

      const badResponse = new Error(
        `The server replied with an unexpected response (HTTP ${response.status}).`
      );
      badResponse.retryable = response.status >= 500;
      throw badResponse;
    } finally {
      clearTimeout(timer);
    }
  };

  // One request at a time: never append a fake assistant reply when the call failed.
  const deliver = async (text, history, appendUser) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setIsLoading(true);
    setFailedMessage(null);

    if (appendUser) {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: text, timestamp: new Date() },
      ]);
    }

    // If the API is already known to be down, re-check once instead of firing a
    // request that is guaranteed to fail (keeps the console clean).
    if (serviceStatus === "offline") {
      const checkStarted = Date.now();
      const backOnline = await checkService();
      // Fast failure = the API is really down. A slow one usually means a
      // sleeping Render instance is waking up, so let the real request through.
      const reallyDown = !backOnline && Date.now() - checkStarted < 3000;
      if (reallyDown) {
        setFailedMessage({
          text,
          history,
          reason:
            "The FlyBot service is offline. Start the backend with npm run dev from the project root, then press Retry.",
        });
        setIsLoading(false);
        inFlightRef.current = false;
        return;
      }
    }

    let reply = null;
    let lastError = null;

    for (let attempt = 1; attempt <= 2 && !reply; attempt += 1) {
      try {
        reply = await requestReply(text, history);
      } catch (error) {
        lastError = error;
        if (!error?.retryable || attempt === 2) break;
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    }

    if (reply) {
      setServiceStatus("online");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply, timestamp: new Date() },
      ]);
    } else {
      if (lastError?.backendDown || lastError?.network || lastError?.timeout) {
        setServiceStatus("offline");
      }

      let reason = lastError?.friendly;
      if (!reason) {
        if (lastError?.timeout) {
          reason = "The server took too long to respond. Please try again.";
        } else if (lastError?.backendDown || lastError?.network) {
          reason =
            "Could not reach the FlyBot server. Make sure the backend is running, then press Retry.";
        } else {
          reason = lastError?.message || "Something went wrong. Please try again.";
        }
      }

      setFailedMessage({ text, history, reason });
    }

    setIsLoading(false);
    inFlightRef.current = false;
  };

  const sendMessage = (overrideText) => {
    const text = (typeof overrideText === "string" ? overrideText : input).trim();
    if (!text || isLoading || inFlightRef.current) return;

    // a typed question switches from the guided tour to normal Q&A
    if (tourStepRef.current >= 0) {
      tourStepRef.current = -1;
      setTourStep(-1);
    }

    autoRetriedRef.current = null;
    // history is captured before the new message is appended
    const history = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .slice(-6)
      .map((m) => ({ role: m.role, content: m.content }));

    setInput("");
    if (inputRef.current) {
      inputRef.current.style.height = "44px";
    }
    deliver(text, history, true);
  };

  // Resend the exact message that failed - without duplicating the user bubble.
  const retryFailed = () => {
    if (!failedMessage || isLoading || inFlightRef.current) return;
    deliver(failedMessage.text, failedMessage.history, false);
  };

  /* ------------------------- Website tour ------------------------- */
  // Fully automatic tour: Home -> Owner -> Courses -> Gallery -> Contact.
  // Each page scrolls itself and then moves on; no card sits over the page.
  const startTour = () => {
    setShowChoice(false);
    setIsOpen(false);
    setTourPaused(false);
    tourStepRef.current = 0;
    setTourStep(0);
  };

  const openChatFromChoice = () => {
    setShowChoice(false);
    setIsOpen(true);
  };

  const endTour = () => {
    tourStepRef.current = -1;
    setTourStep(-1);
    setTourPaused(false);
  };

  const resumeTour = () => {
    setTourPaused(false);
    setTourRunId((n) => n + 1);
  };

  const nextTourStep = () => {
    const current = tourStepRef.current;
    if (current < 0) return;
    if (current >= TOUR_STEPS.length - 1) {
      endTour();
      return;
    }
    const next = current + 1;
    tourStepRef.current = next;
    setTourStep(next);
  };

  // Move to the current page, scroll through it, then move to the next page on
  // its own. Any wheel/touch pauses the tour until Resume or End.
  useEffect(() => {
    if (tourStep < 0) return undefined;
    const step = TOUR_STEPS[tourStep];
    if (!step?.path) return undefined;

    setTourPaused(false);
    if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
    navigate(step.path);

    let cancelled = false;
    let timer = null;
    let stepDelay = 0;

    const pause = (event) => {
      if (cancelled) return;
      cancelled = true;
      clearTimeout(timer);
      window.removeEventListener("wheel", pause);
      window.removeEventListener("touchstart", pause);
      window.removeEventListener("click", pause, true);
      // a wheel already replaces our animation with the visitor's own scroll;
      // a touch needs the running animation stopped before they can drag
      if (event.type === "touchstart" && window.__lenis) {
        window.__lenis.scrollTo(window.scrollY, { immediate: true });
      }
      setTourPaused(true);
    };
    window.addEventListener("wheel", pause, { passive: true });
    window.addEventListener("touchstart", pause, { passive: true });
    window.addEventListener("click", pause, true);

    const goToNextPage = () => {
      if (cancelled) return;
      nextTourStep();
    };

    // scroll roughly one screen at a time so lazy images keep loading and the
    // page grows while we move down it
    const scrollDown = () => {
      if (cancelled) return;
      const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const currentY = window.scrollY;
      if (maxY - currentY < 80) {
        // page finished - give the visitor a moment, then move on automatically
        timer = setTimeout(goToNextPage, 1600);
        return;
      }
      // pace the scroll by page length: long pages scroll faster, short pages
      // slower, but the whole page takes roughly 6-18 seconds either way
      if (!stepDelay) {
        const viewportStep = Math.max(240, Math.round(window.innerHeight * 0.85));
        const steps = Math.max(1, Math.ceil(maxY / viewportStep));
        const totalMs = Math.min(18000, Math.max(6000, (maxY / 400) * 1000));
        stepDelay = Math.max(1100, Math.round(totalMs / steps));
      }
      const target = Math.min(currentY + Math.round(window.innerHeight * 0.85), maxY);
      if (window.__lenis) window.__lenis.scrollTo(target, { duration: 1.05 });
      else window.scrollTo({ top: target, behavior: "smooth" });
      timer = setTimeout(scrollDown, stepDelay);
    };

    timer = setTimeout(scrollDown, 1200);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      window.removeEventListener("wheel", pause);
      window.removeEventListener("touchstart", pause);
      window.removeEventListener("click", pause, true);
      if (window.__lenis) window.__lenis.scrollTo(window.scrollY, { immediate: true });
    };
  }, [tourStep, tourRunId, navigate]);

  // If the backend comes back while a message is waiting, resend it once
  // automatically so the visitor never has to press Retry.
  useEffect(() => {
    if (
      serviceStatus === "online" &&
      failedMessage &&
      !isLoading &&
      autoRetriedRef.current !== failedMessage.text
    ) {
      autoRetriedRef.current = failedMessage.text;
      deliver(failedMessage.text, failedMessage.history, false);
    }
  }, [serviceStatus, failedMessage, isLoading]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      { role: "assistant", content: "Chat cleared! How can I help you with Fly High Consultancy services today? ✈️", timestamp: new Date() }
    ]);
    setFailedMessage(null);
    setInput("");
    if (inputRef.current) {
      inputRef.current.style.height = "44px";
    }
    tourStepRef.current = -1;
    setTourStep(-1);
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const toggleChat = () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (nextOpen) {
      setIsMaximized(false);
      // backend may have been restarted since the last check
      checkService();
    }
  };

  // Quick reply questions
  const quickReplies = [
    { text: "What services do you offer?", icon: FiHelpCircle },
    { text: "Tell me about PTE coaching", icon: FiInfo },
    { text: "How can I contact you?", icon: FiMail },
    { text: "I need help with something else", icon: FiHelpCircle },
  ];

  const handleQuickReply = (text) => {
    // pass the text directly - state updates are async, so the old
    // setInput + sendMessage() pair always sent an empty message
    sendMessage(text);
  };

  // Mobile styles – a floating card, not a full-screen takeover. The page
  // stays visible above it and the input row never sits under the keyboard.
  const mobileStyles = {
    width: isMobile ? "calc(100vw - 1rem)" : isMaximized ? "500px" : "380px",
    height: isMobile ? "78dvh" : isMaximized ? "680px" : "560px",
    maxWidth: isMobile ? "calc(100vw - 1rem)" : "90vw",
    maxHeight: isMobile ? "min(640px, calc(100dvh - 4.5rem - var(--chat-kb, 0px)))" : "85vh",
    borderRadius: isMobile ? "1rem" : "1.5rem",
    bottom: isMobile ? "calc(0.5rem + var(--chat-kb, 0px))" : "1.25rem",
    right: isMobile ? "0.5rem" : "1.25rem",
  };

  return (
    <>
      {/* Floating 3D Robot Launcher */}
      <div
        className={`group fixed bottom-4 right-3 z-[60] flex flex-col items-center transition-all duration-300 ${
          isOpen || tourStep >= 0
            ? "pointer-events-none translate-y-4 scale-90 opacity-0"
            : "pointer-events-auto translate-y-0 scale-100 opacity-100"
        }`}
        style={{ width: 96, height: 104 }}
      >
        {/* soft ground glow */}
        <span
          className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full"
          style={{
            width: 64,
            height: 12,
            background: "radial-gradient(closest-side, rgba(139,92,246,0.55), rgba(139,92,246,0))",
            filter: "blur(2px)",
          }}
        />

        <motion.button
          type="button"
          onClick={() => setShowChoice(true)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onFocus={() => setIsHovered(true)}
          onBlur={() => setIsHovered(false)}
          onTouchStart={() => setIsHovered(true)}
          aria-label="Open FlyBot chat assistant"
          aria-expanded={isOpen}
          className="group relative flex h-full w-full cursor-pointer items-end justify-center rounded-3xl focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-400/50"
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.6 }}
          whileTap={{ scale: 0.93 }}
        >
          {/* breathing float */}
          <motion.span
            className="relative block h-[96px] w-[92px]"
            style={{
              WebkitMaskImage:
                "linear-gradient(to bottom, #000 84%, rgba(0,0,0,0.45) 95%, transparent 100%)",
              maskImage:
                "linear-gradient(to bottom, #000 84%, rgba(0,0,0,0.45) 95%, transparent 100%)",
            }}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
          >
            {!isOpen && (
              <RobotCanvas
                hovered={isHovered}
                framing="bust"
                quality={isMobile ? "low" : "medium"}
                className="h-full w-full [&>canvas]:!pointer-events-none"
                fallbackClassName="h-full w-full"
              />
            )}
          </motion.span>

          {/* online indicator - reflects the real backend status */}
          <span
            className="absolute bottom-[8px] right-[8px] flex h-4 w-4 items-center justify-center"
            aria-hidden="true"
            title={
              serviceStatus === "online"
                ? "FlyBot is online"
                : serviceStatus === "checking"
                ? "Checking connection"
                : "FlyBot offline"
            }
          >
            {serviceStatus === "online" ? (
              <>
                <span className="absolute inline-flex h-4 w-4 animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400 shadow-md" />
              </>
            ) : (
              <span
                className={`relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white shadow-md ${
                  serviceStatus === "checking" ? "bg-amber-400" : "bg-rose-500"
                }`}
              />
            )}
          </span>
        </motion.button>

        {/* tooltip */}
        <div
          className="pointer-events-none absolute right-[92px] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-semibold text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 sm:opacity-0"
          style={{
            background: "linear-gradient(135deg, #6d28d9, #4c1d95)",
            boxShadow: "0 8px 24px rgba(76,29,149,0.35)",
          }}
        >
          Chat with FlyBot
        </div>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatContainerRef}
            key="chat-window"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed flex flex-col overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 z-50"
            style={{
              ...mobileStyles,
              background: "linear-gradient(180deg, #ffffff 0%, #fafafa 100%)",
              border: "1px solid rgba(168, 111, 247, 0.15)",
              boxShadow: "0 25px 80px rgba(102, 126, 234, 0.15), 0 0 0 1px rgba(255,255,255,0.5)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
              <div className="absolute inset-0 opacity-10">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 50 Q25 30 50 50 Q75 70 90 50" stroke="white" strokeWidth="2" strokeDasharray="10 5" opacity="0.5"/>
                </svg>
              </div>
              <div className="flex items-center gap-3 relative z-10">
                <div
                  className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-full"
                  style={{
                    background: "radial-gradient(circle at 50% 35%, rgba(196,181,253,0.55), rgba(76,29,149,0.45))",
                    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.35), 0 4px 14px rgba(30,16,70,0.35)",
                  }}
                  onMouseEnter={() => setIsAvatarHovered(true)}
                  onMouseLeave={() => setIsAvatarHovered(false)}
                >
                  <RobotCanvas
                    hovered={isAvatarHovered}
                    framing="avatar"
                    quality="low"
                    className="absolute inset-0 h-full w-full [&>canvas]:!pointer-events-none"
                    fallbackClassName="h-full w-full scale-[0.95]"
                  />
                  <span
                    className={`absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${
                      serviceStatus === "online"
                        ? "bg-emerald-400"
                        : serviceStatus === "checking"
                        ? "bg-amber-400"
                        : "bg-rose-500"
                    }`}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-white font-semibold text-sm truncate">FlyBot</p>
                  <p className="text-purple-100 text-xs truncate">
                    Fly High Consultancy •{" "}
                    {serviceStatus === "online"
                      ? "Online"
                      : serviceStatus === "checking"
                      ? "Connecting…"
                      : "Offline"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 relative z-10">
                <button
                  type="button"
                  onClick={startTour}
                  className="flex h-8 items-center gap-1 rounded-lg px-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Start the website tour"
                  title="Website tour"
                >
                  <FiCompass size={16} />
                  <span className="hidden text-[11px] font-semibold sm:inline">Tour</span>
                </button>
                {!isMobile && (
                  <button
                    type="button"
                    onClick={toggleMaximize}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                    aria-label={isMaximized ? "Restore chat size" : "Expand chat"}
                  >
                    {isMaximized ? <FiMinimize2 size={16} /> : <FiMaximize2 size={16} />}
                  </button>
                )}
                <button
                  onClick={toggleChat}
                  className="w-8 h-8 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center"
                  aria-label="Close chat"
                >
                  <FiX size={16} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div 
              ref={messagesContainerRef}
              className="min-h-0 flex-1 overflow-y-auto p-4 space-y-3.5" 
              style={{ 
                overscrollBehavior: 'contain',
                overflowY: showScrollbar ? 'auto' : 'hidden',
                scrollbarWidth: 'thin',
                scrollbarColor: '#a855f7 transparent'
              }}
            >
              <AnimatePresence mode="popLayout">
                {messages.map((msg, idx) => (
                  <motion.div
                    key={`${idx}-${msg.role}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm ${
                      msg.role === "user"
                        ? "rounded-br-md"
                        : "rounded-bl-md"
                    }`} 
                      style={{
                        background: msg.role === "user" 
                          ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                          : "#f3f4f6",
                        color: msg.role === "user" ? "white" : "#1f2937",
                        boxShadow: msg.role === "user" 
                          ? "0 4px 15px rgba(102, 126, 234, 0.3)" 
                          : "0 2px 8px rgba(15, 23, 42, 0.08)"
                      }}
                    >
                      <div className="flex items-start gap-2">
                        {msg.role === "assistant" && (
                          <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
                            <FiMessageSquare size={12} className="text-white" />
                          </div>
                        )}
                        <div>
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                          <p className="text-xs mt-1 opacity-60 text-right">{formatTime(msg.timestamp)}</p>
                        </div>
                      </div>
                    </div>
                    {msg.role === "user" && (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ml-2"
                        style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)" }}>
                        <FiUser size={12} className="text-white" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
              
              {/* Typing indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 rounded-2xl rounded-bl-md shadow-sm">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
                      <FiMessageSquare size={12} className="text-white" />
                    </div>
                    <div className="flex gap-1">
                      <motion.div className="w-2 h-2 rounded-full bg-purple-400" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                      <motion.div className="w-2 h-2 rounded-full bg-purple-400" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }} />
                      <motion.div className="w-2 h-2 rounded-full bg-purple-400" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }} />
                    </div>
                  </div>
                </motion.div>
              )}

              {isLoading && slowNotice && (
                <p className="pl-1 text-[11px] leading-snug text-purple-500">
                  Waking up the assistant — this can take up to a minute on the free server.
                </p>
              )}

              {/* Delivery failure - real error state with a working Retry */}
              {failedMessage && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-rose-200 bg-rose-50 px-3.5 py-2.5 shadow-sm">
                    <p className="text-[12px] font-semibold text-rose-700">Message not sent</p>
                    <p className="mt-0.5 text-[11px] leading-snug text-rose-600">
                      {failedMessage.reason}
                    </p>
                    <button
                      type="button"
                      onClick={retryFailed}
                      className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-2.5 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                    >
                      <FiRefreshCw size={12} />
                      Retry
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Quick Reply Buttons - Only show on first message */}
            {messages.length === 1 && !isLoading && (
              <div className="flex-shrink-0 border-t border-purple-100 px-3 py-2.5" style={{ background: "rgba(250,247,255,0.9)" }}>
                <motion.button
                  type="button"
                  onClick={startTour}
                  className="mb-2 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[11px] font-semibold text-white shadow-md"
                  style={{ background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)" }}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FiCompass size={14} />
                  Take a website tour
                </motion.button>
                <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-wide text-purple-500">
                  Quick questions
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {quickReplies.map((q, i) => (
                    <motion.button
                      key={i}
                      type="button"
                      onClick={() => handleQuickReply(q.text)}
                      className="flex items-center gap-1.5 rounded-xl border border-purple-200/80 bg-white px-2.5 py-2 text-left text-[11px] font-medium leading-tight text-purple-700 shadow-sm transition-colors hover:border-purple-300 hover:bg-purple-50"
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <q.icon size={12} className="flex-shrink-0 text-purple-500" />
                      <span className="line-clamp-2">{q.text}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Backend offline banner - only shown when the status check really failed */}
            {serviceStatus === "offline" && (
              <div className="flex flex-shrink-0 items-center justify-between gap-2 border-t border-amber-200 bg-amber-50 px-3 py-2">
                <p className="text-[11px] leading-snug text-amber-800">
                  FlyBot service is offline. Start the backend with{" "}
                  <span className="font-semibold">npm run dev</span> from the project root.
                </p>
                <button
                  type="button"
                  onClick={checkService}
                  className="inline-flex flex-shrink-0 items-center gap-1 rounded-lg bg-amber-500 px-2.5 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-amber-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  <FiRefreshCw size={12} />
                  Retry
                </button>
              </div>
            )}

            {/* Input Area */}
            <div
              className="flex-shrink-0 border-t border-purple-100 p-3"
              style={{
                background: "rgba(255,255,255,0.95)",
                paddingBottom: isMobile ? "calc(0.75rem + env(safe-area-inset-bottom))" : undefined,
              }}
            >
              <div className="flex items-end gap-2">
                <div className="relative min-w-0 flex-1">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      resizeInput(e.target);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about visas, PTE..."
                    aria-label="Ask FlyBot a question"
                    rows={1}
                    disabled={isLoading}
                    className="w-full min-w-0 px-4 py-2.5 pr-12 text-base bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/30 focus:border-purple-400 resize-none transition-all sm:text-sm"
                    style={{ 
                      minHeight: "44px",
                      maxHeight: "140px",
                      fontFamily: "inherit",
                      fontSize: isMobile ? "16px" : undefined
                    }}
                  />
                  <button
                    onClick={clearChat}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg text-slate-400 hover:text-purple-500 hover:bg-purple-50 transition-colors flex items-center justify-center"
                    aria-label="Clear chat"
                  >
                    <FiRefreshCw size={16} />
                  </button>
                </div>
                <motion.button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    background: input.trim() && !isLoading
                      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                      : "linear-gradient(135deg, #94a3b8 0%, #64748b 100%)",
                    boxShadow: input.trim() && !isLoading 
                      ? "0 4px 15px rgba(102, 126, 234, 0.4)" 
                      : "none"
                  }}
                  aria-label="Send message"
                >
                  <FiSend size={18} className="text-white" />
                </motion.button>
              </div>
              <p className="text-xs text-slate-400 text-center mt-2">
                FlyBot only answers Fly High Consultancy related queries ✈️
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat or Tour chooser - opens when the robot launcher is clicked */}
      <AnimatePresence>
        {showChoice && !isOpen && tourStep < 0 && (
          <>
            <motion.div
              key="choice-backdrop"
              className="fixed inset-0 z-[64] bg-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowChoice(false)}
            />
            <motion.div
              key="choice-card"
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
              className="fixed bottom-[128px] left-3 right-3 z-[65] rounded-2xl border border-purple-200 bg-white p-4 shadow-2xl sm:left-auto sm:right-6 sm:w-[320px]"
              role="dialog"
              aria-label="Choose chat or website tour"
            >
              <button
                type="button"
                onClick={() => setShowChoice(false)}
                aria-label="Close"
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <FiX size={14} />
              </button>
              <p className="pr-6 text-sm font-semibold text-navy">Hi, I'm FlyBot</p>
              <p className="mt-0.5 text-xs text-slate-500">What would you like to do?</p>
              <div className="mt-3 space-y-2">
                <button
                  type="button"
                  onClick={openChatFromChoice}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold text-white shadow-md transition-transform hover:scale-[1.01]"
                  style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
                >
                  <FiMessageSquare size={16} />
                  Chat with FlyBot
                </button>
                <button
                  type="button"
                  onClick={startTour}
                  className="flex w-full items-center gap-2.5 rounded-xl border border-purple-200 bg-purple-50 px-3 py-2.5 text-left text-[13px] font-semibold text-purple-700 transition-colors hover:bg-purple-100"
                >
                  <FiCompass size={16} />
                  Take a website tour
                </button>
              </div>
              <p className="mt-2 text-center text-[10px] text-slate-400">
                Each page opens automatically during the tour
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Minimal tour control - no side card, just progress plus pause/end */}
      <AnimatePresence>
        {tourStep >= 0 && (
          <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[70] flex justify-center sm:bottom-6">
          <motion.div
            key="tour-pill"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            aria-label="Website tour controls"
            className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-white/15 bg-[#1e1b4b]/95 px-3 py-1.5 text-white shadow-xl backdrop-blur"
          >
            <FiCompass size={13} className="text-purple-300" />
            <span className="whitespace-nowrap text-[11px] font-semibold">
              {tourPaused ? "Tour paused" : `${TOUR_STEPS[tourStep].label} page`}
            </span>
            <span className="text-[10px] text-purple-300">
              {tourStep + 1}/{TOUR_STEPS.length}
            </span>
            {tourPaused && (
              <button
                type="button"
                onClick={resumeTour}
                className="rounded-full bg-purple-600 px-2.5 py-1 text-[10px] font-semibold text-white transition-colors hover:bg-purple-500"
              >
                Resume
              </button>
            )}
            <button
              type="button"
              onClick={endTour}
              className="rounded-full px-2 py-1 text-[10px] font-semibold text-purple-200 transition-colors hover:bg-white/10 hover:text-white"
            >
              End
            </button>
          </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;