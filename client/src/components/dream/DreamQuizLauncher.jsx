import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiSend } from "react-icons/fi";
import { useDreamQuiz } from "../../context/DreamQuizContext";

/**
 * Floating "Dream Quiz" launcher pinned directly ABOVE the FlyBot robot
 * (bottom-right corner). Pulses gently to invite clicks, and steps aside
 * while the quiz overlay or any FlyBot panel is open.
 */
const DreamQuizLauncher = () => {
  const { isOpen, openQuiz } = useDreamQuiz();
  // The FlyBot chooser/chat sets body.chat-open — mirror it so the launcher
  // steps aside instead of overlapping the FlyBot panels.
  const [chatOpen, setChatOpen] = useState(false);
  useEffect(() => {
    const update = () => setChatOpen(document.body.classList.contains("chat-open"));
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  const hidden = isOpen || chatOpen;

  return (
    <motion.button
      type="button"
      onClick={() => openQuiz()}
      aria-label="FREE Dream Country Quiz"
      aria-haspopup="dialog"
      initial={{ opacity: 0, y: 24, scale: 0.6 }}
      animate={
        hidden
          ? { opacity: 0, y: 20, scale: 0.7, pointerEvents: "none" }
          : { opacity: 1, y: 0, scale: 1, pointerEvents: "auto" }
      }
      transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.15 }}
      className="group fixed bottom-[138px] right-3 z-[65] focus:outline-none focus-visible:ring-4 focus-visible:ring-gold/60 rounded-full transition-all duration-300 sm:bottom-[148px] sm:right-4"
    >
      {/* pulse ring */}
      {!hidden && (
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-gold/40 animate-ping [animation-duration:2.4s]"
        />
      )}

      <span
        className="relative flex h-14 w-14 items-center justify-center rounded-full shadow-[0_14px_36px_-8px_rgba(245,184,61,0.75)] ring-2 ring-white/70 transition-transform duration-200 group-hover:scale-110"
        style={{ background: "linear-gradient(140deg, #F5B83D 0%, #FF7A3D 100%)" }}
      >
        <FiSend size={24} className="text-navy -rotate-12" aria-hidden="true" />
        {/* FREE badge */}
        <span className="absolute -left-1 -top-1 rounded-full bg-navy px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wider text-gold ring-1 ring-gold/60">
          Free
        </span>
      </span>

      {/* Label pill — reveals to the left of the button on hover/focus */}
      <span
        className="pointer-events-none absolute right-[68px] top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-bold text-navy opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 sm:block"
        style={{ background: "linear-gradient(135deg, #F5B83D, #FFD97A)" }}
      >
        Dream Country Quiz ✨
      </span>
    </motion.button>
  );
};

export default DreamQuizLauncher;
