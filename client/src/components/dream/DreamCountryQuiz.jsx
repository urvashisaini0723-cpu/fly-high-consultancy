import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiGlobe,
  FiSend,
  FiChevronLeft,
  FiChevronRight,
  FiRotateCcw,
  FiCopy,
  FiCheck,
  FiShare2,
  FiAlertTriangle,
  FiCheckCircle,
  FiHome,
  FiMap,
  FiArrowRight,
} from "react-icons/fi";
import { useDreamQuiz } from "../../context/DreamQuizContext";
import { QUIZ_QUESTIONS, COUNTRIES, COUNTRY_MAP, EMPTY_ANSWERS, labelFor } from "../../data/dreamCountries";
import { getRecommendations, buildResultsSummary } from "../../lib/dreamRecommendation";
import QuizProgress from "./QuizProgress";
import QuizQuestion from "./QuizQuestion";
import CountryResultCard from "./CountryResultCard";
import CounsellingCTA from "./CounsellingCTA";
import CounsellingForm from "./CounsellingForm";

const TOTAL = QUIZ_QUESTIONS.length;

/**
 * Full "Find Your Dream Country" experience rendered as a modal overlay:
 * intro → 6 questions → analyzing → results → counselling form → confirmation.
 * Mounted once at app level; opened via useDreamQuiz().openQuiz().
 */
const DreamCountryQuiz = () => {
  const { isOpen, closeQuiz, focusCountry } = useDreamQuiz();
  const navigate = useNavigate();

  const [view, setView] = useState("intro"); // intro | quiz | analyzing | results | form | done
  const [qIndex, setQIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState(EMPTY_ANSWERS);
  const [recommendation, setRecommendation] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [copyState, setCopyState] = useState("idle"); // idle | copied
  const [interestedCountry, setInterestedCountry] = useState(null);
  const [submissionSummary, setSubmissionSummary] = useState(null);

  const contentRef = useRef(null);
  const dialogRef = useRef(null);
  const analysisTimer = useRef(null);

  const currentQuestion = QUIZ_QUESTIONS[qIndex];

  /* ------- open/close lifecycle: scroll lock, escape, focus ------- */
  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (window.__lenis) window.__lenis.stop();
    const onKey = (e) => {
      if (e.key === "Escape") closeQuiz();
    };
    window.addEventListener("keydown", onKey);
    // move focus into the dialog for screen readers
    const t = setTimeout(() => dialogRef.current?.focus(), 40);
    return () => {
      document.body.style.overflow = previousOverflow;
      if (window.__lenis) window.__lenis.start();
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [isOpen, closeQuiz]);

  // Lock the modal scroll (not the page) when moving between views
  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTo({ top: 0 });
    setShowHint(false);
  }, [view, qIndex]);

  // Fresh quiz every time the modal is opened from a CTA with a focus country
  useEffect(() => {
    if (isOpen && focusCountry) {
      setInterestedCountry(focusCountry);
    }
  }, [isOpen, focusCountry]);

  useEffect(() => () => clearTimeout(analysisTimer.current), []);

  /* ------- simple focus trap inside the dialog ------- */
  const trapTab = (e) => {
    if (e.key !== "Tab" || !dialogRef.current) return;
    const focusables = dialogRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const visible = [...focusables].filter((el) => el.offsetParent !== null);
    if (!visible.length) return;
    const first = visible[0];
    const last = visible[visible.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  /* ------- answers ------- */
  const setSingle = useCallback((id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setShowHint(false);
  }, []);

  const toggleMulti = useCallback((id, optionId, exclusiveNone) => {
    setAnswers((prev) => {
      const current = Array.isArray(prev[id]) ? prev[id] : [];
      let next;
      if (optionId === exclusiveNone) {
        next = current.includes(optionId) ? [] : [optionId];
      } else {
        const kept = current.filter((x) => x !== exclusiveNone);
        next = kept.includes(optionId) ? kept.filter((x) => x !== optionId) : [...kept, optionId];
      }
      return { ...prev, [id]: next };
    });
    setShowHint(false);
  }, []);

  const canProceed = currentQuestion?.type === "multi"
    ? (answers.preferredCountries?.length ?? 0) > 0
    : Boolean(answers[currentQuestion?.id]);

  const startAnalyzing = () => {
    setView("analyzing");
    const result = getRecommendations(answers);
    clearTimeout(analysisTimer.current);
    analysisTimer.current = setTimeout(() => {
      setRecommendation(result);
      setView("results");
    }, 2100);
  };

  const goNext = () => {
    if (!canProceed) {
      setShowHint(true);
      return;
    }
    if (qIndex < TOTAL - 1) {
      setDirection(1);
      setQIndex((i) => i + 1);
    } else {
      startAnalyzing();
    }
  };

  const goBack = () => {
    if (view === "form") {
      setView("results");
      return;
    }
    if (qIndex > 0) {
      setDirection(-1);
      setQIndex((i) => i - 1);
    } else {
      setView("intro");
    }
  };

  const restartQuiz = () => {
    setAnswers(EMPTY_ANSWERS);
    setRecommendation(null);
    setInterestedCountry(null);
    setSubmissionSummary(null);
    setQIndex(0);
    setDirection(-1);
    setView("quiz");
  };

  /* ------- results actions ------- */
  const resultsText = useMemo(
    () => (recommendation ? buildResultsSummary(answers, recommendation) : ""),
    [answers, recommendation]
  );

  const copyResults = async () => {
    try {
      await navigator.clipboard.writeText(resultsText);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 2200);
    } catch {
      // legacy fallback
      const ta = document.createElement("textarea");
      ta.value = resultsText;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopyState("copied");
        setTimeout(() => setCopyState("idle"), 2200);
      } catch {
        setCopyState("idle");
      }
      document.body.removeChild(ta);
    }
  };

  const shareResults = async () => {
    const shareData = {
      title: "My dream study countries — Fly High Consultancy",
      text: resultsText,
      url: window.location.origin,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err?.name !== "AbortError") copyResults();
      }
    } else {
      copyResults();
    }
  };

  const openCounselling = (countryId = null) => {
    setInterestedCountry(countryId ?? null);
    setView("form");
  };

  const onEnquirySuccess = (_data, payload) => {
    setSubmissionSummary(payload);
    setView("done");
  };

  const exploreOtherCountries = () => {
    closeQuiz();
    navigate("/");
    // popular countries section id lives on the Home page
    setTimeout(() => {
      const el = document.getElementById("popular-countries");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      else if (window.__lenis) window.__lenis.scrollTo(0);
    }, 350);
  };

  const backToHome = () => {
    closeQuiz();
    navigate("/");
    setTimeout(() => {
      if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true });
      else window.scrollTo(0, 0);
    }, 120);
  };

  const otherCountries = useMemo(() => {
    const shown = new Set((recommendation?.top || []).map((r) => r.country.id));
    return COUNTRIES.filter((c) => !shown.has(c.id));
  }, [recommendation]);

  /* ================= render ================= */
  const questionSlide = {
    initial: (dir) => ({ opacity: 0, x: dir * 64 }),
    animate: { opacity: 1, x: 0 },
    exit: (dir) => ({ opacity: 0, x: dir * -64 }),
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="dream-quiz"
          className="fixed inset-0 z-[75] flex items-end justify-center sm:items-center sm:p-4 md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close the Dream Country quiz"
            onClick={closeQuiz}
            className="absolute inset-0 cursor-default bg-[#050d1d]/80 backdrop-blur-sm"
          />

          {/* Dialog */}
          <motion.div
            ref={dialogRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Find Your Dream Country — interactive quiz"
            onKeyDown={trapTab}
            initial={{ opacity: 0, y: 80, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 80, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative flex h-[100dvh] w-full flex-col overflow-hidden outline-none sm:h-auto sm:max-h-[94vh] sm:max-w-2xl sm:rounded-3xl sm:border sm:border-white/10 md:max-w-4xl lg:max-w-5xl"
            style={{
              background:
                "radial-gradient(1100px 700px at 85% -10%, rgba(56,189,248,0.28), transparent 60%), radial-gradient(900px 650px at -15% 110%, rgba(255,122,61,0.22), transparent 60%), linear-gradient(160deg, #0d2440 0%, #0B1F3A 55%, #081726 100%)",
              boxShadow: "0 40px 120px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)",
            }}
          >
            {/* Decorative orbs */}
            <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-24 h-64 w-64 rounded-full bg-sky/10 blur-3xl" />
            <div aria-hidden="true" className="pointer-events-none absolute -left-24 bottom-24 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />

            {/* Modal header */}
            <div className="relative flex flex-shrink-0 items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky to-teal text-navy shadow-lg">
                  <FiGlobe size={18} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-display text-sm font-extrabold leading-tight text-white sm:text-[15px]">
                    Find Your Dream Country
                  </p>
                  <p className="truncate text-[9px] font-medium uppercase tracking-[0.18em] text-sky/80">
                    Fly High Consultancy
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeQuiz}
                aria-label="Close quiz"
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-white/70 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky"
              >
                <FiX size={18} aria-hidden="true" />
              </button>
            </div>

            {/* Scrollable body */}
            <div ref={contentRef} className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6 sm:py-6">
              <AnimatePresence mode="wait" custom={direction}>
                {/* ============ INTRO ============ */}
                {view === "intro" && (
                  <motion.div
                    key="intro"
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -18 }}
                    className="mx-auto flex max-w-2xl flex-col items-center py-2 text-center sm:py-6"
                  >
                    <motion.div
                      animate={{ y: [0, -10, 0], rotate: [0, 2, 0, -2, 0] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                      className="relative flex h-24 w-24 items-center justify-center sm:h-28 sm:w-28"
                    >
                      <span className="absolute inset-0 rounded-full border border-sky/30" />
                      <span className="absolute inset-3 rounded-full border border-dashed border-sky/40" />
                      <FiSend size={52} className="relative text-gold drop-shadow-[0_0_18px_rgba(245,184,61,0.4)]" aria-hidden="true" />
                    </motion.div>
                    <h2 className="mt-6 font-display text-3xl font-extrabold leading-[1.15] text-white sm:text-4xl">
                      Your Dreams Have <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky via-teal to-gold">No Borders.</span>
                    </h2>
                    <p className="mt-3 max-w-md text-sm leading-relaxed text-white/70 sm:text-[15px]">
                      Answer a few simple questions and discover study destinations that match your goals,
                      education and budget.
                    </p>
                    <button
                      type="button"
                      onClick={() => { setDirection(1); setView("quiz"); setQIndex(0); }}
                      className="group mt-7 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange to-gold px-8 py-4 font-display text-base font-bold text-navy shadow-[0_18px_44px_-14px_rgba(255,122,61,0.6)] transition-transform hover:scale-[1.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                    >
                      Find My Dream Country
                      <FiArrowRight className="transition-transform group-hover:translate-x-1" size={18} aria-hidden="true" />
                    </button>
                    <p className="mt-4 text-[11px] font-medium text-white/45">
                      6 quick questions · Free · Takes about 60 seconds · No sign-up
                    </p>
                  </motion.div>
                )}

                {/* ============ QUIZ QUESTIONS ============ */}
                {view === "quiz" && currentQuestion && (
                  <motion.div
                    key={`q-${qIndex}`}
                    custom={direction}
                    variants={questionSlide}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ type: "spring", stiffness: 320, damping: 30 }}
                    className="mx-auto w-full max-w-3xl"
                  >
                    <QuizProgress current={qIndex} total={TOTAL} />
                    <h2 className="mt-4 font-display text-xl font-extrabold leading-snug text-white sm:text-2xl">
                      {currentQuestion.question}
                    </h2>
                    <p className="mt-1 text-[11px] text-white/50 sm:text-xs">{currentQuestion.hint}</p>

                    <div className="mt-4">
                      <QuizQuestion
                        question={currentQuestion}
                        answers={answers}
                        onSet={setSingle}
                        onToggle={toggleMulti}
                      />
                    </div>

                    {showHint && !canProceed && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-amber-300"
                        role="status"
                      >
                        <FiAlertTriangle size={12} aria-hidden="true" /> Please {currentQuestion.type === "multi" ? "choose at least one option" : "select an option"} to continue.
                      </motion.p>
                    )}

                    {/* Nav buttons */}
                    <div className="mt-5 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={goBack}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 px-4 py-2.5 text-[13px] font-semibold text-white/80 transition-colors hover:border-sky/50 hover:text-sky focus:outline-none focus-visible:ring-2 focus-visible:ring-sky"
                      >
                        <FiChevronLeft size={16} aria-hidden="true" />
                        {qIndex === 0 ? "Back" : "Previous"}
                      </button>
                      <button
                        type="button"
                        onClick={goNext}
                        aria-disabled={!canProceed}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-6 py-2.5 font-display text-[13px] font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                          canProceed
                            ? "bg-gradient-to-r from-orange to-gold text-navy shadow-[0_10px_28px_-10px_rgba(255,122,61,0.65)] hover:scale-[1.03]"
                            : "cursor-not-allowed bg-white/10 text-white/40"
                        }`}
                      >
                        {qIndex === TOTAL - 1 ? "See My Results" : "Next"}
                        <FiChevronRight size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ============ ANALYZING ============ */}
                {view === "analyzing" && (
                  <motion.div
                    key="analyzing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-14 text-center sm:py-20"
                    role="status"
                    aria-live="polite"
                  >
                    <div className="relative flex h-32 w-32 items-center justify-center">
                      <motion.span
                        className="absolute inset-0 rounded-full border-2 border-sky/25"
                        animate={{ scale: [1, 1.35], opacity: [0.8, 0] }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                      />
                      <motion.span
                        className="absolute inset-0 rounded-full border-2 border-teal/25"
                        animate={{ scale: [1, 1.35], opacity: [0.8, 0] }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut", delay: 0.55 }}
                      />
                      <motion.div
                        className="flex h-24 w-24 items-center justify-center rounded-full bg-white/5 ring-1 ring-sky/30"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
                      >
                        <FiGlobe size={44} className="text-sky" aria-hidden="true" />
                      </motion.div>
                    </div>
                    <p className="mt-6 font-display text-lg font-bold text-white sm:text-xl">
                      Finding your dream destinations
                      <motion.span aria-hidden="true" animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.1, repeat: Infinity }}>…</motion.span>
                    </p>
                    <p className="mt-1.5 max-w-xs text-[11px] text-white/50">
                      Comparing your goals, budget, field and timeline across our destination desk.
                    </p>
                  </motion.div>
                )}

                {/* ============ RESULTS ============ */}
                {view === "results" && recommendation && (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, y: 26 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -18 }}
                    className="mx-auto w-full max-w-5xl"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="font-display text-2xl font-extrabold leading-tight text-white sm:text-3xl">
                          Your Dream <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky to-gold">Destinations</span>
                        </h2>
                        <p className="mt-1 text-[12px] text-white/60 sm:text-[13px]">
                          Here are some destinations worth exploring based on your answers.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={restartQuiz}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 px-3.5 py-2 text-[11px] font-semibold text-white/75 transition-colors hover:border-sky/50 hover:text-sky focus:outline-none focus-visible:ring-2 focus-visible:ring-sky"
                      >
                        <FiRotateCcw size={13} aria-hidden="true" /> Restart Quiz
                      </button>
                    </div>

                    {/* Preliminary disclaimer */}
                    <p className="mt-3 flex items-start gap-2 rounded-2xl border border-sky/20 bg-sky/5 px-3.5 py-2.5 text-[10px] leading-snug text-sky/90 sm:text-[11px]">
                      <FiAlertTriangle className="mt-0.5 flex-shrink-0" size={13} aria-hidden="true" />
                      These recommendations are preliminary suggestions based on your answers — they are not an
                      eligibility check, admission offer, employment promise or visa guarantee. Budget figures are
                      indicative and vary by university, course and location.
                    </p>

                    {recommendation.noStrongMatches ? (
                      /* ---- Friendly empty state ---- */
                      <div className="mt-5 rounded-3xl border border-white/12 bg-white/[0.05] p-6 text-center sm:p-10">
                        <FiGlobe size={40} className="mx-auto text-sky/70" aria-hidden="true" />
                        <h3 className="mt-4 font-display text-xl font-bold text-white">
                          We couldn't find a strong automatic match.
                        </h3>
                        <p className="mx-auto mt-2 max-w-md text-[12px] leading-relaxed text-white/65">
                          This usually means your budget or timeline needs a personal look — not every good option fits
                          a generic formula. Our counsellors regularly build affordable study plans with scholarships,
                          part-time earnings and phased fees.
                        </p>
                        <button
                          type="button"
                          onClick={() => openCounselling(null)}
                          className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange to-gold px-7 py-3.5 font-display text-sm font-bold text-navy shadow-lg transition-transform hover:scale-[1.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                        >
                          Talk to a Counsellor <FiArrowRight size={15} aria-hidden="true" />
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* ---- Recommendation cards ---- */}
                        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {recommendation.top.map((match, i) => (
                            <CountryResultCard key={match.country.id} match={match} index={i} onExplore={openCounselling} />
                          ))}
                        </div>
                        {recommendation.top.length < 3 && (
                          <p className="mt-3 text-center text-[11px] text-white/50">
                            Only {recommendation.top.length === 1 ? "one" : "a couple of"} strong {recommendation.top.length === 1 ? "match" : "matches"} surfaced —
                            a counsellor can widen the options for your profile.
                          </p>
                        )}

                        {/* ---- Actions: copy / share ---- */}
                        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={copyResults}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-[11px] font-semibold text-white/80 transition-colors hover:border-sky/50 hover:text-sky focus:outline-none focus-visible:ring-2 focus-visible:ring-sky"
                          >
                            {copyState === "copied" ? <FiCheck size={13} className="text-emerald-400" /> : <FiCopy size={13} />}
                            {copyState === "copied" ? "Copied to clipboard!" : "Copy Results"}
                          </button>
                          <button
                            type="button"
                            onClick={shareResults}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-[11px] font-semibold text-white/80 transition-colors hover:border-sky/50 hover:text-sky focus:outline-none focus-visible:ring-2 focus-visible:ring-sky"
                          >
                            <FiShare2 size={13} aria-hidden="true" /> Share Results
                          </button>
                        </div>
                      </>
                    )}

                    {/* ---- Explore more countries ---- */}
                    {otherCountries.length > 0 && (
                      <div className="mt-6">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
                          Explore more destinations
                        </p>
                        <div className="mt-2 flex gap-2 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]">
                          {otherCountries.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => openCounselling(c.id)}
                              className="group flex flex-shrink-0 items-center gap-2 rounded-2xl border border-white/12 bg-white/[0.05] py-2 pl-2 pr-3 transition-all hover:border-sky/40 hover:bg-white/[0.09] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky"
                              title={`Ask our counsellor about ${c.name}`}
                            >
                              <span className="flex h-7 w-9 items-center justify-center overflow-hidden rounded border border-white/15">
                                <img
                                  src={c.flagImg}
                                  alt=""
                                  width="36"
                                  height="28"
                                  loading="lazy"
                                  decoding="async"
                                  className="h-full w-full object-cover"
                                  onError={(e) => { e.currentTarget.style.display = "none"; const s = e.currentTarget.nextSibling; if (s) s.style.display = "flex"; }}
                                />
                                <span className="hidden text-base">{c.flagEmoji}</span>
                              </span>
                              <span className="text-[11px] font-semibold text-white/80 group-hover:text-white">{c.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ---- Counselling CTA ---- */}
                    <div className="mt-6">
                      <CounsellingCTA onBook={() => openCounselling(null)} />
                    </div>
                  </motion.div>
                )}

                {/* ============ COUNSELLING FORM ============ */}
                {view === "form" && (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, y: 26 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -18 }}
                    className="mx-auto w-full max-w-3xl"
                  >
                    <h2 className="font-display text-2xl font-extrabold leading-tight text-white">
                      Book Your <span className="text-gold">Free Counselling</span>
                    </h2>
                    <p className="mt-1 text-[12px] text-white/60">
                      We pre-filled everything from your quiz — just add your details so our counsellor can reach you.
                    </p>
                    <div className="mt-5">
                      <CounsellingForm
                        answers={answers}
                        recommendation={recommendation}
                        focusCountry={interestedCountry}
                        onSuccess={onEnquirySuccess}
                        onBack={() => setView(recommendation ? "results" : "quiz")}
                      />
                    </div>
                  </motion.div>
                )}

                {/* ============ CONFIRMATION ============ */}
                {view === "done" && submissionSummary && (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 22 }}
                    className="mx-auto flex max-w-lg flex-col items-center py-4 text-center sm:py-8"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 240, damping: 16, delay: 0.1 }}
                      className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-teal to-emerald-500 text-white shadow-[0_0_50px_rgba(20,184,166,0.45)]"
                    >
                      <FiCheckCircle size={44} aria-hidden="true" />
                    </motion.div>
                    <h2 className="mt-5 font-display text-2xl font-extrabold text-white sm:text-3xl">
                      Thank You for Your Enquiry!
                    </h2>
                    <p className="mt-2 max-w-md text-[13px] leading-relaxed text-white/70">
                      Your study abroad counselling request has been received successfully. Our team will review your
                      details and contact you soon.
                    </p>

                    {/* Summary of the enquiry */}
                    <div className="mt-6 w-full rounded-2xl border border-white/12 bg-white/[0.06] p-4 text-left">
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-sky/80">Enquiry summary</p>
                      <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
                        <div><dt className="text-white/45">Name</dt><dd className="font-semibold text-white/90">{submissionSummary.name}</dd></div>
                        <div><dt className="text-white/45">Reach you on</dt><dd className="font-semibold text-white/90">{submissionSummary.contactMethod}</dd></div>
                        <div><dt className="text-white/45">Budget</dt><dd className="font-semibold text-white/90">{submissionSummary.quiz?.budget}</dd></div>
                        <div><dt className="text-white/45">Timeline</dt><dd className="font-semibold text-white/90">{submissionSummary.quiz?.timeline}</dd></div>
                      </dl>
                      {submissionSummary.interestedCountry && (
                        <p className="mt-2 text-[11px] font-semibold text-gold">
                          Interested in: {COUNTRY_MAP[submissionSummary.interestedCountry]?.name ?? submissionSummary.interestedCountry}
                        </p>
                      )}
                      {submissionSummary.quiz?.recommendations?.length > 0 && (
                        <div className="mt-2 border-t border-white/10 pt-2">
                          <p className="text-white/45 text-[10px]">Recommended</p>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {submissionSummary.quiz.recommendations.map((r) => (
                              <span key={r.country} className="rounded-full bg-sky/15 px-2.5 py-1 text-[10px] font-semibold text-sky ring-1 ring-sky/30">
                                {r.country} · {r.category}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={backToHome}
                        className="inline-flex items-center gap-2 rounded-2xl border border-white/20 px-6 py-3 font-display text-[13px] font-bold text-white transition-colors hover:border-sky/50 hover:text-sky focus:outline-none focus-visible:ring-2 focus-visible:ring-sky"
                      >
                        <FiHome size={15} aria-hidden="true" /> Back to Home
                      </button>
                      <button
                        type="button"
                        onClick={exploreOtherCountries}
                        className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange to-gold px-6 py-3 font-display text-[13px] font-bold text-navy shadow-lg transition-transform hover:scale-[1.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                      >
                        <FiMap size={15} aria-hidden="true" /> Explore Other Countries
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quiz footer bar with exit hint */}
            {(view === "quiz" || view === "results") && (
              <div className="relative flex flex-shrink-0 items-center justify-center border-t border-white/8 px-4 py-2">
                <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/30">
                  Free · No sign-up · Your answers stay on this page
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DreamCountryQuiz;
