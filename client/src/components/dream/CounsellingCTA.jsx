import { FiPhoneCall } from "react-icons/fi";

/** Bottom-of-results counselling banner. */
const CounsellingCTA = ({ onBook }) => (
  <div className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-br from-[#1a1330] via-[#141f3c] to-navy p-6 text-center sm:p-8">
    {/* glow orbs */}
    <div aria-hidden="true" className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-sky/20 blur-3xl" />
    <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-orange/20 blur-3xl" />
    <p className="relative text-[10px] font-bold uppercase tracking-[0.22em] text-gold">Free Counselling</p>
    <h3 className="relative mt-2 font-display text-2xl font-extrabold text-white sm:text-3xl">
      Not Sure Which Country Is Right for You?
    </h3>
    <p className="relative mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-white/70">
      Get personalized guidance from our experienced counselling team — honest advice, realistic
      options, no pressure.
    </p>
    <button
      type="button"
      onClick={onBook}
      className="relative mt-5 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange to-gold px-7 py-3.5 font-display text-[15px] font-bold text-navy shadow-[0_16px_40px_-12px_rgba(245,184,61,0.55)] transition-transform hover:scale-[1.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
    >
      <FiPhoneCall size={17} aria-hidden="true" />
      Book Free Counselling
    </button>
    <p className="relative mt-3 text-[10px] text-white/45">
      Prefer to talk? Call or WhatsApp +91 93061 42129 (Mon–Sat, 10 AM – 7 PM)
    </p>
  </div>
);

export default CounsellingCTA;
