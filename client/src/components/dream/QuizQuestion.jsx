import { motion } from "framer-motion";
import * as Fi from "react-icons/fi";

/**
 * Selectable answer cards. Single-select uses role="radio",
 * multi-select uses role="checkbox" — both fully keyboard operable.
 */
const QuizQuestion = ({ question, answers, onToggle, onSet }) => {
  const isMulti = question.type === "multi";
  const selected = isMulti ? answers.preferredCountries ?? [] : answers[question.id];

  const isSelected = (id) => (isMulti ? selected.includes(id) : selected === id);

  const handlePick = (id) => {
    if (isMulti) onToggle(question.id, id, question.exclusiveNone);
    else onSet(question.id, id);
  };

  return (
    <div
      role={isMulti ? "group" : "radiogroup"}
      aria-label={question.question}
      className={`grid gap-3 ${
        question.options.length > 4 ? "sm:grid-cols-2" : "sm:grid-cols-2"
      }`}
    >
      {question.options.map((opt) => {
        const active = isSelected(opt.id);
        const Icon = opt.icon ? Fi[opt.icon] ?? Fi.FiCircle : null;

        return (
          <button
            key={opt.id}
            type="button"
            role={isMulti ? "checkbox" : "radio"}
            aria-checked={active}
            onClick={() => handlePick(opt.id)}
            className={`group relative flex items-start gap-3 rounded-2xl border p-3.5 sm:p-4 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/80 ${
              active
                ? "border-sky/70 bg-sky/15 shadow-[0_0_0_1px_rgba(56,189,248,0.55),0_12px_32px_-12px_rgba(56,189,248,0.45)]"
                : "border-white/10 bg-white/[0.04] hover:border-sky/40 hover:bg-white/[0.08] hover:-translate-y-0.5"
            }`}
          >
            {/* Icon / flag */}
            {opt.flagImg ? (
              <span className="flex h-9 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/15 bg-navy">
                <img
                  src={opt.flagImg}
                  alt=""
                  width="48"
                  height="36"
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const fallback = e.currentTarget.nextSibling;
                    if (fallback) fallback.style.display = "flex";
                  }}
                />
                <span className="hidden h-full w-full items-center justify-center text-xl">
                  {opt.flagEmoji}
                </span>
              </span>
            ) : Icon ? (
              <span
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-lg transition-colors ${
                  active ? "bg-sky text-navy" : "bg-white/10 text-sky group-hover:bg-sky/20"
                }`}
              >
                <Icon size={18} />
              </span>
            ) : null}

            <span className="min-w-0 flex-1">
              <span className={`block text-[13px] sm:text-sm font-semibold leading-snug ${active ? "text-white" : "text-white/90"}`}>
                {opt.label}
              </span>
              {opt.desc && (
                <span className="mt-1 block text-[10px] sm:text-[11px] leading-snug text-white/55">
                  {opt.desc}
                </span>
              )}
            </span>

            {/* Selected tick */}
            <span
              aria-hidden="true"
              className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
                active ? "border-sky bg-sky" : "border-white/25 bg-transparent"
              }`}
            >
              {active && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 22 }}
                >
                  <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                    <path d="M1 4.5L4 7.5L10 1.5" stroke="#0B1F3A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default QuizQuestion;
