import { useState, useRef, useEffect } from "react";
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
  FiMail
} from "react-icons/fi";
import RobotCanvas from "./robot/RobotCanvas";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showScrollbar, setShowScrollbar] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: "assistant", 
      content: "Hi! I'm FlyBot, the Fly High Consultancy assistant. Ask me about study visas, PTE coaching, interview prep or tourist visas.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isAvatarHovered, setIsAvatarHovered] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Check mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Scroll the conversation area itself (never the page) to the newest message
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return undefined;
    const id = requestAnimationFrame(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    });
    return () => cancelAnimationFrame(id);
  }, [messages, isLoading]);

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

  // Ask the backend once (with a hard timeout so it can never hang forever)
  const requestReply = async (userMessage, history) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 45000);

    try {
      const response = await fetch("/api/chatbot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, history }),
        signal: controller.signal,
      });

      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (response.ok && data && typeof data.reply === "string" && data.reply.trim()) {
        return data.reply.trim();
      }

      // server replied with a useful message (rate limit, validation, etc.)
      if (data && typeof data.reply === "string" && data.reply.trim()) return data.reply.trim();
      if (data && typeof data.message === "string" && data.message.trim()) return data.message.trim();

      throw new Error(`HTTP ${response.status}`);
    } finally {
      clearTimeout(timer);
    }
  };

  // Send message to backend (one silent retry, then a friendly fallback)
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    const userMsg = { role: "user", content: userMessage, timestamp: new Date() };

    // history is captured before the new message is appended
    const history = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .slice(-6)
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    let reply = null;

    for (let attempt = 1; attempt <= 2 && !reply; attempt += 1) {
      try {
        reply = await requestReply(userMessage, history);
      } catch (error) {
        if (attempt === 2) {
          console.error("[FlyBot] request failed:", error?.message || error);
        } else {
          await new Promise((r) => setTimeout(r, 700));
        }
      }
    }

    if (!reply) {
      reply =
        "I could not reach the office network just now. Please try once more in a few seconds, or call and WhatsApp us directly at +91-93061-42129 - our team replies quickly.";
    }

    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: reply, timestamp: new Date() },
    ]);
    setIsLoading(false);
  };

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
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setIsMaximized(false);
  };

  // Quick reply questions
  const quickReplies = [
    { text: "What services do you offer?", icon: FiHelpCircle },
    { text: "Tell me about PTE coaching", icon: FiInfo },
    { text: "How can I contact you?", icon: FiMail },
    { text: "I need help with something else", icon: FiHelpCircle },
  ];

  const handleQuickReply = (text) => {
    setInput(text);
    sendMessage();
  };

  // Mobile styles
  const mobileStyles = {
    width: isMobile ? "100vw" : isMaximized ? "500px" : "380px",
    height: isMobile ? "100dvh" : isMaximized ? "680px" : "560px",
    maxWidth: isMobile ? "100vw" : "90vw",
    maxHeight: isMobile ? "100vh" : "85vh",
    borderRadius: isMobile ? "0" : "1.5rem",
    bottom: isMobile ? "0" : "1.25rem",
    right: isMobile ? "0" : "1.25rem",
  };

  return (
    <>
      {/* Floating 3D Robot Launcher */}
      <div
        className={`group fixed bottom-4 right-3 z-[60] flex flex-col items-center transition-all duration-300 ${
          isOpen
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
          onClick={toggleChat}
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

          {/* online indicator */}
          <span
            className="absolute bottom-[8px] right-[8px] flex h-4 w-4 items-center justify-center"
            aria-hidden="true"
          >
            <span className="absolute inline-flex h-4 w-4 animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400 shadow-md" />
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
                  <span className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-white font-semibold text-sm truncate">FlyBot</p>
                  <p className="text-purple-100 text-xs truncate">Fly High Consultancy • Online</p>
                </div>
              </div>
              <div className="flex items-center gap-1 relative z-10">
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
            </div>

            {/* Quick Reply Buttons - Only show on first message */}
            {messages.length === 1 && !isLoading && (
              <div className="flex-shrink-0 border-t border-purple-100 px-3 py-2.5" style={{ background: "rgba(250,247,255,0.9)" }}>
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

            {/* Input Area */}
            <div
              className="flex-shrink-0 border-t border-purple-100 p-3"
              style={{
                background: "rgba(255,255,255,0.95)",
                paddingBottom: isMobile ? "calc(0.75rem + env(safe-area-inset-bottom))" : undefined,
              }}
            >
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about visas, PTE, interviews..."
                    rows={1}
                    disabled={isLoading}
                    className="w-full px-4 py-2.5 pr-12 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/30 focus:border-purple-400 resize-none transition-all"
                    style={{ 
                      minHeight: "44px",
                      maxHeight: "140px",
                      fontFamily: "inherit"
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
    </>
  );
};

export default Chatbot;