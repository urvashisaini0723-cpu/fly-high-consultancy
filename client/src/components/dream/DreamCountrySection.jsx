import { motion } from "framer-motion";
import { FiArrowRight, FiCheckCircle, FiSend, FiMapPin } from "react-icons/fi";
import { useDreamQuiz } from "../../context/DreamQuizContext";
import { COUNTRIES } from "../../data/dreamCountries";

/**
 * "Find Your Dream Country" teaser section for the Home page.
 * Opens the quiz modal via context — no routing involved.
 */
const DreamCountrySection = () => {
  const { openQuiz } = useDreamQuiz();
  const preview = COUNTRIES.filter((c) => ["canada", "germany", "australia"].includes(c.id));

  return (
    <section
      aria-labelledby="dream-country-heading"
      className="relative overflow-hidden py-20 md:py-24 text-white"
      style={{
        background:
          "radial-gradient(1000px 600px at 90% -10%, rgba(56,189,248,0.25), transparent 55%), radial-gradient(800px 550px at -10% 110%, rgba(255,122,61,0.22), transparent 55%), linear-gradient(150deg, #0d2440 0%, #0B1F3A 55%, #081726 100%)",
      }}
    >
      {/* dotted flight path ornament */}
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full opacity-40" preserveAspectRatio="none" viewBox="0 0 1200 500" fill="none">
        <path d="M-20 420C 260 380, 420 120, 760 150 S 1180 60, 1240 80" stroke="#38BDF8" strokeOpacity="0.35" strokeWidth="2" strokeDasharray="3 14" strokeLinecap="round"/>
      </svg>

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 md:grid-cols-2 md:px-6">
        {/* Copy */}
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
            <FiSend size={12} aria-hidden="true" /> Free Interactive Quiz
          </p>
          <h2 id="dream-country-heading" className="mt-5 font-display text-4xl font-extrabold leading-[1.12] sm:text-5xl">
            Your Dreams Have <span className="bg-gradient-to-r from-sky via-teal to-gold bg-clip-text text-transparent">No Borders.</span>
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-white/75 sm:text-lg">
            Answer a few simple questions and discover study destinations that match your goals,
            education and budget.
          </p>

          <button
            type="button"
            onClick={() => openQuiz()}
            className="group mt-7 inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-orange to-gold px-8 py-4 font-display text-base font-bold text-navy shadow-[0_18px_44px_-14px_rgba(255,122,61,0.6)] transition-transform hover:scale-[1.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:text-lg"
          >
            Find My Dream Country
            <FiArrowRight className="transition-transform duration-200 group-hover:translate-x-1.5" size={20} aria-hidden="true" />
          </button>

          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-medium text-white/60">
            {["6 quick questions", "Personalised top-3 results", "100% free, no sign-up"].map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <FiCheckCircle size={13} className="text-teal" aria-hidden="true" /> {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Visual — floating destination cards */}
        <div aria-hidden="true" className="relative mx-auto h-[340px] w-full max-w-md sm:h-[400px]">
          {/* glow */}
          <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky/20 blur-3xl" />

          {preview.map((c, i) => {
            const positions = [
              { top: "0%", left: "6%", rotate: "-4deg", delay: "0s" },
              { top: "30%", right: "0%", rotate: "3.5deg", delay: "-2.2s" },
              { bottom: "4%", left: "14%", rotate: "-1.5deg", delay: "-4.1s" },
            ][i];
            return (
              <motion.div
                key={c.id}
                className="absolute w-48 overflow-hidden rounded-2xl border border-white/15 bg-white shadow-2xl sm:w-56"
                style={positions}
                animate={{ y: [0, -14, 0] }}
                transition={{ duration: 4.6 + i * 0.7, repeat: Infinity, ease: "easeInOut", delay: i * 0.9 }}
              >
                <div className="relative h-20 sm:h-24">
                  <img
                    src={c.image}
                    alt=""
                    width="240"
                    height="140"
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/70 to-transparent" />
                  <span className="absolute bottom-2 left-3 flex items-center gap-1.5 text-[12px] font-bold text-white">
                    <img src={c.flagImg} alt="" width="20" height="14" className="h-3.5 w-5 rounded-[3px] object-cover" loading="lazy" />
                    {c.name}
                  </span>
                </div>
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700">Potential Match</span>
                  <span className="text-[9px] font-semibold text-slate-600">{[92, 84, 78][i]}%</span>
                </div>
              </motion.div>
            );
          })}

          {/* passport stamp */}
          <motion.div
            className="absolute right-2 top-2 flex h-24 w-24 rotate-12 items-center justify-center rounded-full border-2 border-dashed border-gold/60 text-center text-[8px] font-extrabold uppercase leading-tight tracking-widest text-gold/80 sm:h-28 sm:w-28 sm:text-[9px]"
            animate={{ rotate: [12, 8, 12] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            Fly High<br />Consultancy<br />Pehowa
          </motion.div>

          {/* plane chip */}
          <motion.div
            className="absolute bottom-16 right-6 flex items-center gap-2 rounded-full border border-sky/40 bg-navy/90 py-1.5 pl-2 pr-3 backdrop-blur sm:bottom-24"
            animate={{ x: [0, 18, 0] }}
            transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <FiMapPin size={12} className="text-sky" />
            <span className="text-[10px] font-bold text-sky">7 destinations</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DreamCountrySection;
