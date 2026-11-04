import { motion } from "framer-motion";

/**
 * Animated progress indicator: "Question X of 6" + gradient bar + step dots.
 */
const QuizProgress = ({ current, total }) => {
  const pct = Math.round(((current + 1) / total) * 100);

  return (
    <div className="w-full" aria-hidden="true">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky/90">
          Question <span className="text-gold">{current + 1}</span> of {total}
        </p>
        <p className="text-[11px] font-semibold text-white/60">{pct}% complete</p>
      </div>

      <div
        className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Question ${current + 1} of ${total}`}
      >
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-sky via-teal to-gold"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 160, damping: 24 }}
        />
      </div>

      <div className="mt-2 flex items-center justify-center gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <motion.span
            key={i}
            initial={false}
            animate={{
              scale: i === current ? 1 : 0.72,
              opacity: i <= current ? 1 : 0.35,
            }}
            className={`h-1.5 rounded-full transition-colors duration-300 ${
              i === current ? "w-6 bg-gold" : i < current ? "w-1.5 bg-sky" : "w-1.5 bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default QuizProgress;
