import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiSend,
  FiAlertCircle,
  FiChevronLeft,
  FiCheck,
  FiLock,
  FiEdit3,
  FiMessageSquare,
} from "react-icons/fi";
import { apiUrl } from "../../lib/api";
import { labelFor, COUNTRY_MAP } from "../../data/dreamCountries";

const COUNTRY_CODES = [
  { code: "+91", label: "+91 India" },
  { code: "+1", label: "+1 USA / Canada" },
  { code: "+44", label: "+44 United Kingdom" },
  { code: "+61", label: "+61 Australia" },
  { code: "+49", label: "+49 Germany" },
  { code: "+353", label: "+353 Ireland" },
  { code: "+64", label: "+64 New Zealand" },
  { code: "+971", label: "+971 UAE" },
];

const REQUIREMENT_OPTIONS = [
  "University and Course Selection",
  "Budget and Tuition Fee Guidance",
  "Scholarship Information",
  "IELTS / PTE Guidance",
  "Admission Application",
  "Visa Guidance",
];

const CURRENT_YEAR = new Date().getFullYear();
const GRAD_YEARS = Array.from({ length: 46 }, (_, i) => CURRENT_YEAR + 6 - i); // current+6 ... current-39

const inputClass =
  "w-full rounded-xl border border-navy/20 bg-white px-3.5 py-2.5 text-sm text-navy outline-none transition-all placeholder:text-navy/35 focus:border-sky focus:ring-2 focus:ring-sky/30";
// Same styling as inputClass but WITHOUT w-full — must not fight the w-[7.5rem]
// utility on the phone row's country-code select (w-full wins on source order and
// squeezes the number input to zero width).
const selectClass =
  "rounded-xl border border-navy/20 bg-white px-2 py-2.5 text-sm text-navy outline-none transition-all focus:border-sky focus:ring-2 focus:ring-sky/30";
const labelClass = "mb-1 block text-[11px] font-semibold uppercase tracking-wide text-sky/80";
const errorClass = "mt-1 text-[11px] font-medium text-rose-600";

/**
 * Counselling enquiry form. Quiz answers arrive pre-filled (read-only review
 * panel) — the visitor only types contact + academic details. Nothing is
 * transmitted before the consent checkbox is ticked.
 */
const CounsellingForm = ({ answers, recommendation, focusCountry, onSuccess, onBack }) => {
  const [form, setForm] = useState({
    name: "",
    countryCode: "+91",
    phone: "",
    email: "",
    cityState: "",
    contactMethod: "WhatsApp",
    degree: "",
    gradYear: "",
    percentage: "",
    studyGap: "Not Sure",
    englishTest: "Not Started",
    passport: "Not Applied",
    requirements: [],
    message: "",
    consent: false,
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | error
  const [serverError, setServerError] = useState("");
  const inFlightRef = useRef(false);

  // ensure form still reflects focusCountry when it changes (Explore Country buttons)
  useEffect(() => {
    setServerError("");
  }, [focusCountry]);

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const toggleRequirement = (req) => {
    setForm((f) => ({
      ...f,
      requirements: f.requirements.includes(req)
        ? f.requirements.filter((r) => r !== req)
        : [...f.requirements, req],
    }));
  };

  const validate = () => {
    const next = {};
    if (form.name.trim().length < 2) next.name = "Please enter your full name.";
    const phoneDigits = form.phone.replace(/[^\d]/g, "");
    if (phoneDigits.length < 7 || phoneDigits.length > 13)
      next.phone = "Enter a valid mobile number (7–13 digits).";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim()))
      next.email = "Enter a valid email address.";
    if (!form.consent) next.consent = "Please tick the consent box so we can contact you.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const buildPayload = () => ({
    name: form.name.trim(),
    phone: `${form.countryCode} ${form.phone.trim()}`,
    email: form.email.trim(),
    cityState: form.cityState.trim(),
    contactMethod: form.contactMethod,
    consent: form.consent,
    interestedCountry: focusCountry || null,
    academic: {
      degree: form.degree.trim(),
      gradYear: form.gradYear,
      percentage: form.percentage.trim(),
      studyGap: form.studyGap,
      englishTest: form.englishTest,
      passport: form.passport,
    },
    requirements: form.requirements,
    message: form.message.trim(),
    quiz: {
      goal: labelFor("goal", answers.goal),
      qualification: labelFor("qualification", answers.qualification),
      budget: labelFor("budget", answers.budget),
      preferredCountries: (answers.preferredCountries || [])
        .filter((id) => id !== "none")
        .map((id) => labelFor("preferredCountries", id)),
      preferredNone: (answers.preferredCountries || []).includes("none"),
      course: labelFor("course", answers.course),
      timeline: labelFor("timeline", answers.timeline),
      recommendations: (recommendation?.top || []).map((r) => ({
        country: r.country.name,
        category: r.category,
        matchPercent: r.percent,
      })),
    },
    submittedAt: new Date().toISOString(),
    source: "find-your-dream-country-quiz",
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (inFlightRef.current || status === "submitting") return; // prevent duplicates
    if (!validate()) {
      setStatus("error");
      setServerError("Please fix the highlighted fields and try again.");
      return;
    }
    inFlightRef.current = true;
    setStatus("submitting");
    setServerError("");

    try {
      const res = await fetch(apiUrl("/api/counselling"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      let data = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }
      if (res.ok && data?.success) {
        onSuccess(data, buildPayload());
        return;
      }
      setStatus("error");
      setServerError(
        data?.message ||
          "We could not submit your enquiry right now. Your details are kept on this page — please try again, or call/WhatsApp +91 93061 42129."
      );
    } catch {
      setStatus("error");
      setServerError(
        "Network error — your details are kept on this page. Please check your connection and try again, or call/WhatsApp +91 93061 42129."
      );
    } finally {
      inFlightRef.current = false;
      setStatus((s) => (s === "submitting" ? "idle" : s));
    }
  };

  const focusName = focusCountry ? COUNTRY_MAP[focusCountry]?.name : null;
  const preferredLabels = (answers.preferredCountries || [])
    .filter((id) => id !== "none")
    .map((id) => labelFor("preferredCountries", id));

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      {/* Back link */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1 text-[12px] font-semibold text-sky hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky rounded"
      >
        <FiChevronLeft size={14} aria-hidden="true" /> Back to my results
      </button>

      {/* A. Personal details */}
      <section aria-labelledby="personal-details">
        <h3 id="personal-details" className="font-display text-base font-bold text-white">
          1. Your details
        </h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="cq-name">Full Name *</label>
            <div className="relative">
              <FiUser className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-navy/40" aria-hidden="true" />
              <input
                id="cq-name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className={`${inputClass} pl-10`}
                placeholder="e.g. Rahul Kumar"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "cq-name-err" : undefined}
              />
            </div>
            {errors.name && <p id="cq-name-err" className={errorClass}>{errors.name}</p>}
          </div>

          <div>
            <label className={labelClass} htmlFor="cq-phone">Mobile Number *</label>
            <div className="flex gap-2">
              <select
                aria-label="Country code"
                value={form.countryCode}
                onChange={(e) => set("countryCode", e.target.value)}
                className={`${selectClass} w-[7.5rem] flex-shrink-0`}
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
              <div className="relative min-w-0 flex-1">
                <FiPhone className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-navy/40" aria-hidden="true" />
                <input
                  id="cq-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel-national"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  className={`${inputClass} pl-10`}
                  placeholder="98XXX XXXXX"
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? "cq-phone-err" : undefined}
                />
              </div>
            </div>
            {errors.phone && <p id="cq-phone-err" className={errorClass}>{errors.phone}</p>}
          </div>

          <div>
            <label className={labelClass} htmlFor="cq-email">Email *</label>
            <div className="relative">
              <FiMail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-navy/40" aria-hidden="true" />
              <input
                id="cq-email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                className={`${inputClass} pl-10`}
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "cq-email-err" : undefined}
              />
            </div>
            {errors.email && <p id="cq-email-err" className={errorClass}>{errors.email}</p>}
          </div>

          <div>
            <label className={labelClass} htmlFor="cq-city">Current City & State</label>
            <div className="relative">
              <FiMapPin className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-navy/40" aria-hidden="true" />
              <input
                id="cq-city"
                type="text"
                autoComplete="address-level2"
                value={form.cityState}
                onChange={(e) => set("cityState", e.target.value)}
                className={`${inputClass} pl-10`}
                placeholder="e.g. Pehowa, Haryana"
              />
            </div>
          </div>

          <fieldset className="sm:col-span-2">
            <legend className={labelClass}>Preferred contact method</legend>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {["WhatsApp", "Phone Call", "Email"].map((m) => (
                <label
                  key={m}
                  className={`cursor-pointer rounded-full border px-4 py-2 text-[12px] font-semibold transition-all focus-within:ring-2 focus-within:ring-sky ${
                    form.contactMethod === m
                      ? "border-sky bg-sky text-navy shadow"
                      : "border-white/20 bg-white/5 text-white/80 hover:border-sky/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="contactMethod"
                    value={m}
                    checked={form.contactMethod === m}
                    onChange={() => set("contactMethod", m)}
                    className="sr-only"
                  />
                  {m}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </section>

      {/* B. Quiz answers review (read-only) */}
      <section aria-labelledby="quiz-review" className="rounded-2xl border border-sky/20 bg-white/[0.06] p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 id="quiz-review" className="font-display text-base font-bold text-white">
            2. Your quiz answers <span className="text-sky">(auto-filled)</span>
          </h3>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex flex-shrink-0 items-center gap-1 rounded-lg border border-white/15 px-2.5 py-1.5 text-[10px] font-semibold text-white/80 transition-colors hover:border-sky/50 hover:text-sky focus:outline-none focus-visible:ring-2 focus-visible:ring-sky"
          >
            <FiEdit3 size={11} aria-hidden="true" /> Change answers
          </button>
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] sm:grid-cols-3">
          {[
            ["Main goal", labelFor("goal", answers.goal)],
            ["Qualification", labelFor("qualification", answers.qualification)],
            ["Budget", labelFor("budget", answers.budget)],
            ["Preferred", preferredLabels.length ? preferredLabels.join(", ") : "No Preference"],
            ["Field", labelFor("course", answers.course)],
            ["Planning to go", labelFor("timeline", answers.timeline)],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-[9px] font-bold uppercase tracking-wider text-white/45">{k}</dt>
              <dd className="mt-0.5 font-semibold leading-snug text-white/90">{v || "—"}</dd>
            </div>
          ))}
        </dl>
        {recommendation?.top?.length > 0 && (
          <div className="mt-3 border-t border-white/10 pt-3">
            <p className="text-[9px] font-bold uppercase tracking-wider text-white/45">Your recommended destinations</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {recommendation.top.map((r) => (
                <span key={r.country.id} className="rounded-full bg-sky/15 px-2.5 py-1 text-[10px] font-semibold text-sky ring-1 ring-sky/30">
                  {r.country.name} · {r.category}
                </span>
              ))}
            </div>
          </div>
        )}
        {focusName && (
          <p className="mt-2 text-[11px] font-semibold text-gold">
            Interested specifically in: {focusName}
          </p>
        )}
      </section>

      {/* C. Academic details */}
      <section aria-labelledby="academic-details">
        <h3 id="academic-details" className="font-display text-base font-bold text-white">
          3. Academic details <span className="text-white/40 text-xs font-body font-medium">(optional)</span>
        </h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="cq-degree">Degree / Course Name</label>
            <input
              id="cq-degree"
              type="text"
              value={form.degree}
              onChange={(e) => set("degree", e.target.value)}
              className={inputClass}
              placeholder="e.g. B.Com, B.Tech CSE"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="cq-gradyear">Graduation Year</label>
            <select id="cq-gradyear" value={form.gradYear} onChange={(e) => set("gradYear", e.target.value)} className={inputClass}>
              <option value="">Select year</option>
              {GRAD_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="cq-percent">Percentage / CGPA</label>
            <input
              id="cq-percent"
              type="text"
              inputMode="decimal"
              value={form.percentage}
              onChange={(e) => set("percentage", e.target.value)}
              className={inputClass}
              placeholder="e.g. 78% or 8.2 CGPA"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="cq-gap">Study Gap</label>
            <select id="cq-gap" value={form.studyGap} onChange={(e) => set("studyGap", e.target.value)} className={inputClass}>
              {["No", "Yes", "Not Sure"].map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="cq-english">English Test Status</label>
            <select id="cq-english" value={form.englishTest} onChange={(e) => set("englishTest", e.target.value)} className={inputClass}>
              {["IELTS", "PTE", "TOEFL", "Planning", "Not Started"].map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="cq-passport">Passport Status</label>
            <select id="cq-passport" value={form.passport} onChange={(e) => set("passport", e.target.value)} className={inputClass}>
              {["Issued", "Applied", "Not Applied"].map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* D. Counselling requirements */}
      <section aria-labelledby="counselling-need">
        <h3 id="counselling-need" className="font-display text-base font-bold text-white">
          4. What do you need help with?
        </h3>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {REQUIREMENT_OPTIONS.map((req) => {
            const checked = form.requirements.includes(req);
            return (
              <label
                key={req}
                className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-[12px] font-medium transition-all focus-within:ring-2 focus-within:ring-sky ${
                  checked ? "border-sky/60 bg-sky/15 text-white" : "border-white/12 bg-white/[0.04] text-white/75 hover:border-sky/40"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleRequirement(req)}
                  className="h-4 w-4 flex-shrink-0 accent-sky"
                />
                {req}
              </label>
            );
          })}
        </div>
        <label className={`${labelClass} mt-3`} htmlFor="cq-message">
          Additional message <span className="normal-case text-white/40">(optional)</span>
        </label>
        <div className="relative">
          <FiMessageSquare className="pointer-events-none absolute left-3.5 top-3.5 text-navy/40" aria-hidden="true" />
          <textarea
            id="cq-message"
            rows={3}
            value={form.message}
            onChange={(e) => set("message", e.target.value)}
            className={`${inputClass} pl-10 resize-none`}
            placeholder="Tell us anything else we should know…"
            maxLength={1000}
          />
        </div>
      </section>

      {/* Privacy consent */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.05] p-4">
        <label className="flex cursor-pointer items-start gap-3 text-[12px] leading-snug text-white/85">
          <input
            type="checkbox"
            checked={form.consent}
            onChange={(e) => set("consent", e.target.checked)}
            className="mt-0.5 h-5 w-5 flex-shrink-0 accent-sky"
            aria-describedby="consent-note"
          />
          <span>
            I consent to Fly High Consultancy using my contact details <strong>only</strong> to respond to this
            counselling enquiry, as described in our{" "}
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="font-semibold text-sky underline underline-offset-2 hover:text-white">
              Privacy Policy
            </a>
            . I understand this is not an application and does not guarantee admission or a visa.
          </span>
        </label>
        <p id="consent-note" className="mt-2 flex items-center gap-1.5 pl-8 text-[10px] text-white/45">
          <FiLock size={11} aria-hidden="true" /> Your details stay with our counselling team and are never published.
        </p>
        {errors.consent && <p className="mt-2 pl-8 text-[11px] font-medium text-rose-400">{errors.consent}</p>}
      </div>

      {/* Submit / error state */}
      <AnimatePresence mode="wait">
        {status === "error" && serverError && (
          <motion.div
            key="err"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-3 text-[12px] leading-snug text-rose-200"
            role="alert"
          >
            <FiAlertCircle className="mt-0.5 flex-shrink-0" size={16} aria-hidden="true" />
            <span>{serverError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange to-gold px-6 py-4 font-display text-base font-bold text-navy shadow-xl transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
      >
        {status === "submitting" ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-navy/30 border-t-navy" aria-hidden="true" />
            Submitting your enquiry…
          </>
        ) : (
          <>
            Submit Enquiry <FiSend size={16} aria-hidden="true" />
          </>
        )}
      </button>
      <p className="text-center text-[10px] text-white/40">
        We never share your details. Submission goes straight to our counselling desk.
      </p>
    </form>
  );
};

export default CounsellingForm;
