import { motion } from "framer-motion";
import { FiAlertTriangle, FiCheckCircle, FiChevronRight, FiStar } from "react-icons/fi";
import { VERIFY_NOTE } from "../../data/dreamCountries";

const BUDGET_TONE = {
  comfortable: "text-emerald-600",
  stretch: "text-amber-600",
  mismatch: "text-rose-600",
  "major-mismatch": "text-rose-600",
  unknown: "text-slate-500",
};

/** One recommendation card on the results page. */
const CountryResultCard = ({ match, index, onExplore }) => {
  const { country, category, percent, reasons, warnings, budgetStatus, isPreferred } = match;
  const isPotential = category === "Potential Match";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 * index, duration: 0.45, ease: "easeOut" }}
      className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-[0_24px_60px_-24px_rgba(2,6,23,0.55)] ring-1 ring-black/5"
    >
      {/* Image header */}
      <div className="relative h-36 sm:h-40 overflow-hidden bg-gradient-to-br from-navy to-[#122a4d]">
        <img
          src={country.image}
          alt={country.imageAlt}
          width="640"
          height="360"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/95 via-navy/45 to-navy/10" />

        {/* Category chip */}
        <div className="absolute left-3 top-3 flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-navy shadow ${
              isPotential ? "bg-gold" : "bg-sky"
            }`}
          >
            {category}
          </span>
          {isPreferred && (
            <span className="flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-navy shadow">
              <FiStar size={10} aria-hidden="true" /> Your pick
            </span>
          )}
        </div>

        {/* Country name + flag */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
          <h3 className="font-display text-2xl sm:text-[1.7rem] font-extrabold leading-none text-white drop-shadow">
            {country.name}
          </h3>
          <span className="flex h-9 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/40 shadow">
            <img
              src={country.flagImg}
              alt={`Flag of ${country.name}`}
              width="48"
              height="36"
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const s = e.currentTarget.nextSibling;
                if (s) s.style.display = "flex";
              }}
            />
            <span className="hidden h-full w-full items-center justify-center bg-white text-xl">
              {country.flagEmoji}
            </span>
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        {/* Match strength */}
        <div>
          <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            <span>Match strength</span>
            <span>{percent}%</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-sky to-teal"
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.9, delay: 0.25 * index + 0.2, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Why it may suit you */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-navy/60">Why this may suit you</p>
          <ul className="mt-1.5 space-y-1">
            {reasons.slice(0, 3).map((r) => (
              <li key={r} className="flex items-start gap-1.5 text-[11px] leading-snug text-slate-700">
                <FiCheckCircle className="mt-0.5 flex-shrink-0 text-[#0F766E]" size={11} aria-hidden="true" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Courses */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-navy/60">Popular courses</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {country.popularCourses.slice(0, 4).map((c) => (
              <span
                key={c}
                className="rounded-full bg-cloud px-2 py-1 text-[10px] font-medium text-navy ring-1 ring-navy/10"
              >
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Budget compatibility */}
        <p className={`text-[11px] font-semibold leading-snug ${BUDGET_TONE[budgetStatus] ?? BUDGET_TONE.unknown}`}>
          Budget: {country.costLabel} overall cost — {match.budgetStatus === "comfortable" ? "broadly within your band" : match.budgetStatus === "stretch" ? "tight against your band" : budgetStatus === "mismatch" || budgetStatus === "major-mismatch" ? "above your stated band" : "compare with counsellor"}
        </p>
        <p className="-mt-2 text-[9px] leading-snug text-slate-400">
          Indicative only; fees vary by university, course and city. {VERIFY_NOTE}.
        </p>

        {/* Warnings */}
        {warnings.length > 0 && (
          <ul className="space-y-1 rounded-xl border border-amber-200 bg-amber-50 p-2">
            {warnings.slice(0, 2).map((w) => (
              <li key={w} className="flex items-start gap-1.5 text-[10px] leading-snug text-amber-800">
                <FiAlertTriangle className="mt-0.5 flex-shrink-0" size={11} aria-hidden="true" />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        )}

        {/* CTA */}
        <button
          type="button"
          onClick={() => onExplore(country.id)}
          className="group mt-auto inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-navy px-4 py-2.5 text-[12px] font-bold text-white transition-colors hover:bg-[#122a4d] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky"
        >
          Explore {country.name}
          <FiChevronRight className="transition-transform group-hover:translate-x-0.5" size={14} aria-hidden="true" />
        </button>
      </div>
    </motion.article>
  );
};

export default CountryResultCard;
