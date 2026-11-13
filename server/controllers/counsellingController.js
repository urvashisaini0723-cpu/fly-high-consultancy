/**
 * Counselling enquiry handler for the "Find Your Dream Country" quiz.
 *
 * What happens on submit:
 *   1. A sanitized record (personal + academic + quiz answers + recommendations)
 *      is appended to server/data/enquiries.jsonl (created with 0700/0600 perms,
 *      gitignored). This is the durable LOCAL record — note Render's free tier
 *      ephemeral filesystem means this survives restarts but NOT redeploys.
 *   2. EMAIL 1 — ADMIN NOTIFICATION goes to the counselling inbox
 *      (OWNER_EMAIL, plus anything in MAIL_TO) with every answer, the
 *      recommendations, budget/course/timeline and a timestamp.
 *   3. EMAIL 2 — STUDENT CONFIRMATION goes to the address the visitor typed,
 *      thanking them for the quiz + enquiry and setting expectations.
 *      Both emails travel through the shared transport in server/lib/mailer.js
 *      (Brevo BREVO_API_KEY, SMTP fallback) — the same integration the contact
 *      form uses. No second email system, no second API key.
 *   4. The API answers success=true only when the enquiry is durably saved or
 *      the admin notification actually went out. Otherwise the visitor sees a
 *      retryable error and their input stays on screen. We never fake a success.
 *      A short-lived duplicate guard stops double-clicks from sending twice.
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { sendEmail, isConfigured } = require("../lib/mailer");

const ENQUIRIES_FILE =
  process.env.ENQUIRIES_FILE || path.join(__dirname, "..", "data", "enquiries.jsonl");

/* Every quiz enquiry must reach the counselling inbox. MAIL_TO can only ADD
   addresses; the owner address below is always included so a missing/typo'd
   Render env var can never silently stop the notifications. */
const OWNER_EMAIL = "urvashisaini0723@gmail.com";

const CONTACT = {
  phone: "+91 93061 42129",
  whatsapp: "https://wa.me/919306142129",
  email: "urvashisaini0723@gmail.com",
  address: "2nd Floor, Amar Complex, Near New PNB Bank, Pehowa, Kurukshetra, Haryana – 136128",
  hours: "Monday – Saturday, 10:00 AM – 7:00 PM (Sunday closed)",
};

/* The quiz CTA sends a country id ("canada"), so map it back to a display name
   for the emails. Unknown values are shown as typed rather than hidden. */
const COUNTRY_NAMES = {
  canada: "Canada",
  uk: "United Kingdom",
  australia: "Australia",
  germany: "Germany",
  ireland: "Ireland",
  newzealand: "New Zealand",
  usa: "USA",
};

const countryLabel = (value) => {
  const raw = clip(value, 60);
  if (!raw) return "";
  return COUNTRY_NAMES[raw.toLowerCase()] || raw;
};

/* Dedupe window: a repeated submit of the SAME successful enquiry within this
   window is acknowledged without sending a second pair of emails. */
const DEDUPE_WINDOW_MS = 10 * 60 * 1000;
const recentSubmissions = new Map();

const getRecipients = () => {
  const configured = String(process.env.MAIL_TO || "")
    .split(/[,;\s]+/)
    .map((s) => s.trim().toLowerCase())
    .filter((s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s));
  return [...new Set([OWNER_EMAIL, ...configured])];
};

const escapeHtml = (s = "") =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const clip = (value, max = 500) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

const asBool = (v) => v === true || v === "true" || v === 1;

/** Human-readable IST timestamp used in both emails. */
const formatDateTime = (iso) => {
  const date = iso ? new Date(iso) : new Date();
  const formatted = date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${formatted} IST`;
};

/* ---------- 1. Sanitize the incoming payload into a clean record ---------- */
const buildRecord = (body = {}) => {
  const quiz = body.quiz && typeof body.quiz === "object" ? body.quiz : {};
  const academic = body.academic && typeof body.academic === "object" ? body.academic : {};

  const recommendations = Array.isArray(quiz.recommendations)
    ? quiz.recommendations.slice(0, 5).map((r) => ({
        country: clip(r?.country, 60),
        category: clip(r?.category, 60),
        matchPercent: Number.isFinite(Number(r?.matchPercent))
          ? Math.max(0, Math.min(100, Math.round(Number(r.matchPercent))))
          : null,
      }))
    : [];

  return {
    receivedAt: new Date().toISOString(),
    name: clip(body.name, 80),
    phone: clip(body.phone, 24),
    email: clip(body.email, 120).toLowerCase(),
    cityState: clip(body.cityState, 80),
    contactMethod: ["WhatsApp", "Phone Call", "Email"].includes(body.contactMethod)
      ? body.contactMethod
      : "WhatsApp",
    consent: {
      given: asBool(body.consent),
      at: asBool(body.consent) ? new Date().toISOString() : null,
    },
    interestedCountry: clip(body.interestedCountry, 60) || null,
    academic: {
      degree: clip(academic.degree, 120),
      gradYear: clip(academic.gradYear, 4),
      percentage: clip(academic.percentage, 30),
      studyGap: ["No", "Yes", "Not Sure"].includes(academic.studyGap) ? academic.studyGap : "Not Sure",
      englishTest: clip(academic.englishTest, 20),
      passport: clip(academic.passport, 20),
    },
    requirements: Array.isArray(body.requirements)
      ? body.requirements.slice(0, 10).map((r) => clip(r, 80)).filter(Boolean)
      : [],
    message: clip(body.message, 1000),
    quiz: {
      goal: clip(quiz.goal, 80),
      qualification: clip(quiz.qualification, 80),
      budget: clip(quiz.budget, 60),
      preferredCountries: Array.isArray(quiz.preferredCountries)
        ? quiz.preferredCountries.slice(0, 8).map((c) => clip(c, 60)).filter(Boolean)
        : [],
      preferredNone: asBool(quiz.preferredNone),
      course: clip(quiz.course, 80),
      timeline: clip(quiz.timeline, 60),
      recommendations,
    },
    source: clip(body.source, 60) || "find-your-dream-country-quiz",
    clientSubmittedAt: clip(body.submittedAt, 40) || null,
  };
};

/* ---------- 2. Persist locally (JSONL) ---------- */
const saveEnquiryLocally = (record) => {
  const dir = path.dirname(ENQUIRIES_FILE);
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  fs.appendFileSync(ENQUIRIES_FILE, JSON.stringify(record) + "\n", {
    encoding: "utf8",
    mode: 0o600,
  });
};

/* ---------- 3a. EMAIL 1 — admin notification ---------- */
const buildAdminEmailHtml = (r) => {
  const row = (label, value) => `
    <tr>
      <td style="padding:7px 10px;font-weight:bold;background:#f4f8fd;border:1px solid #e2e8f0;width:38%;">${escapeHtml(label)}</td>
      <td style="padding:7px 10px;border:1px solid #e2e8f0;">${escapeHtml(value || "—")}</td>
    </tr>`;
  const list = (items) =>
    items.length ? items.map(escapeHtml).join(", ") : "—";
  const recs =
    r.quiz.recommendations.length > 0
      ? r.quiz.recommendations
          .map((x) => `${escapeHtml(x.country)} (${escapeHtml(x.category)}${x.matchPercent != null ? `, ${x.matchPercent}%` : ""})`)
          .join("<br/>")
      : "—";

  return `
  <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#0B1F3A;">
    <div style="background:#0B1F3A;padding:18px 22px;border-radius:12px 12px 0 0;">
      <h2 style="margin:0;color:#F5B83D;font-size:20px;">New Counselling Enquiry</h2>
      <p style="margin:4px 0 0;color:#cbd5e1;font-size:12px;">Fly High Consultancy · Find Your Dream Country quiz</p>
    </div>
    <div style="border:1px solid #e2e8f0;border-top:0;border-radius:0 0 12px 12px;padding:18px 22px;">
      <h3 style="font-size:14px;margin:0 0 8px;color:#1d4ed8;">Contact details</h3>
      <table style="border-collapse:collapse;width:100%;font-size:13px;">
        ${row("Name", r.name)}
        ${row("Phone", r.phone)}
        ${row("Email", r.email)}
        ${row("City / State", r.cityState)}
        ${row("Preferred contact", r.contactMethod)}
        ${row("Interested specifically in", countryLabel(r.interestedCountry) || "No specific country")}
      </table>

      <h3 style="font-size:14px;margin:16px 0 8px;color:#1d4ed8;">Quiz answers</h3>
      <table style="border-collapse:collapse;width:100%;font-size:13px;">
        ${row("Main goal", r.quiz.goal)}
        ${row("Qualification", r.quiz.qualification)}
        ${row("Budget", r.quiz.budget)}
        ${row("Preferred countries", r.quiz.preferredNone ? "No preference" : list(r.quiz.preferredCountries))}
        ${row("Field of interest", r.quiz.course)}
        ${row("Planning to go", r.quiz.timeline)}
      </table>

      <h3 style="font-size:14px;margin:16px 0 8px;color:#1d4ed8;">Recommended destinations</h3>
      <p style="font-size:13px;margin:0;">${recs}</p>

      <h3 style="font-size:14px;margin:16px 0 8px;color:#1d4ed8;">Academic details</h3>
      <table style="border-collapse:collapse;width:100%;font-size:13px;">
        ${row("Degree / Course", r.academic.degree)}
        ${row("Graduation year", r.academic.gradYear)}
        ${row("Percentage / CGPA", r.academic.percentage)}
        ${row("Study gap", r.academic.studyGap)}
        ${row("English test", r.academic.englishTest)}
        ${row("Passport", r.academic.passport)}
      </table>

      <h3 style="font-size:14px;margin:16px 0 8px;color:#1d4ed8;">Counselling requirements</h3>
      <p style="font-size:13px;margin:0;">${list(r.requirements)}</p>

      ${r.message ? `<h3 style="font-size:14px;margin:16px 0 8px;color:#1d4ed8;">Message</h3><p style="font-size:13px;background:#fff8ec;border:1px solid #fde68a;border-radius:8px;padding:10px;">${escapeHtml(r.message)}</p>` : ""}

      <p style="margin-top:18px;font-size:10px;color:#64748b;border-top:1px solid #e2e8f0;padding-top:10px;">
        Received ${escapeHtml(formatDateTime(r.receivedAt))} · Visitor consent given at ${escapeHtml(r.consent.at ? formatDateTime(r.consent.at) : "—")} ·
        Source: ${escapeHtml(r.source)}
      </p>
    </div>
  </div>`;
};

const buildAdminEmailText = (r) => {
  const recs =
    r.quiz.recommendations.length > 0
      ? r.quiz.recommendations
          .map((x) => `- ${x.country} (${x.category}${x.matchPercent != null ? `, ${x.matchPercent}%` : ""})`)
          .join("\n")
      : "-";
  const list = (items) => (items.length ? items.join(", ") : "-");
  return [
    "NEW COUNSELLING ENQUIRY",
    "Fly High Consultancy - Find Your Dream Country quiz",
    "",
    "CONTACT DETAILS",
    `Name: ${r.name}`,
    `Phone: ${r.phone}`,
    `Email: ${r.email}`,
    `City / State: ${r.cityState || "-"}`,
    `Preferred contact: ${r.contactMethod}`,
    `Interested specifically in: ${countryLabel(r.interestedCountry) || "No specific country"}`,
    "",
    "QUIZ ANSWERS",
    `Main goal: ${r.quiz.goal || "-"}`,
    `Qualification: ${r.quiz.qualification || "-"}`,
    `Budget: ${r.quiz.budget || "-"}`,
    `Preferred countries: ${r.quiz.preferredNone ? "No preference" : list(r.quiz.preferredCountries)}`,
    `Field of interest: ${r.quiz.course || "-"}`,
    `Planning to go: ${r.quiz.timeline || "-"}`,
    "",
    "RECOMMENDED DESTINATIONS",
    recs,
    "",
    "ACADEMIC DETAILS",
    `Degree / Course: ${r.academic.degree || "-"}`,
    `Graduation year: ${r.academic.gradYear || "-"}`,
    `Percentage / CGPA: ${r.academic.percentage || "-"}`,
    `Study gap: ${r.academic.studyGap || "-"}`,
    `English test: ${r.academic.englishTest || "-"}`,
    `Passport: ${r.academic.passport || "-"}`,
    "",
    "COUNSELLING REQUIREMENTS",
    list(r.requirements),
    ...(r.message ? ["", "MESSAGE", r.message] : []),
    "",
    "---",
    `Received ${formatDateTime(r.receivedAt)} | Consent given at ${r.consent.at ? formatDateTime(r.consent.at) : "-"} | Source: ${r.source}`,
  ].join("\n");
};

const sendAdminNotification = async (record) => {
  const recipients = getRecipients();
  const result = await sendEmail({
    to: recipients,
    subject: `New Counselling Enquiry — ${record.name} · ${formatDateTime(record.receivedAt)}`,
    html: buildAdminEmailHtml(record),
    text: buildAdminEmailText(record),
    replyTo: { email: record.email, name: record.name },
  });

  if (result.delivered) {
    console.log(`[counselling] admin notification sent via ${result.transport} to ${recipients.join(", ")}`);
  }
  return result;
};

/* ---------- 3b. EMAIL 2 — student confirmation ---------- */
const buildStudentEmailHtml = (r) => {
  const row = (label, value) => `
    <tr>
      <td style="padding:7px 10px;font-weight:bold;background:#f4f8fd;border:1px solid #e2e8f0;width:40%;">${escapeHtml(label)}</td>
      <td style="padding:7px 10px;border:1px solid #e2e8f0;">${escapeHtml(value || "—")}</td>
    </tr>`;
  const list = (items) => (items.length ? items.map(escapeHtml).join(", ") : "—");
  const recs =
    r.quiz.recommendations.length > 0
      ? r.quiz.recommendations
          .map(
            (x) =>
              `<li style="margin-bottom:4px;">${escapeHtml(x.country)} <span style="color:#64748b;">— ${escapeHtml(x.category)}${x.matchPercent != null ? ` · ${x.matchPercent}% match` : ""}</span></li>`
          )
          .join("")
      : `<li style="color:#64748b;">A counsellor will shortlist options for your profile.</li>`;

  return `
  <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#0B1F3A;">
    <div style="background:#0B1F3A;padding:22px;border-radius:12px 12px 0 0;text-align:center;">
      <h1 style="margin:0;color:#F5B83D;font-size:21px;">Your Enquiry Has Been Received!</h1>
      <p style="margin:6px 0 0;color:#cbd5e1;font-size:12px;">Fly High Consultancy · Study Abroad &amp; Visa Guidance</p>
    </div>
    <div style="border:1px solid #e2e8f0;border-top:0;border-radius:0 0 12px 12px;padding:20px 22px;font-size:13px;line-height:1.6;">
      <p style="margin:0 0 12px;">Dear <strong>${escapeHtml(r.name)}</strong>,</p>
      <p style="margin:0 0 12px;">
        Thank you for completing the <strong>Find Your Dream Country</strong> quiz and sending us your
        counselling enquiry. We have received your details successfully, and a confirmation copy of this
        message is now with our counselling desk at <a href="mailto:${escapeHtml(CONTACT.email)}" style="color:#1d4ed8;">${escapeHtml(CONTACT.email)}</a>.
      </p>
      <p style="margin:0 0 12px;">
        Here is a summary of what you shared with us. Please reply to this email if anything needs correcting.
      </p>

      <h3 style="font-size:14px;margin:18px 0 8px;color:#1d4ed8;">Your details</h3>
      <table style="border-collapse:collapse;width:100%;font-size:13px;">
        ${row("Name", r.name)}
        ${row("Email", r.email)}
        ${row("Phone", r.phone)}
        ${row("Preferred contact method", r.contactMethod)}
        ${row("City / State", r.cityState || "—")}
        ${row("Interested specifically in", countryLabel(r.interestedCountry) || "No specific country")}
      </table>

      <h3 style="font-size:14px;margin:18px 0 8px;color:#1d4ed8;">Your quiz answers</h3>
      <table style="border-collapse:collapse;width:100%;font-size:13px;">
        ${row("Main goal", r.quiz.goal)}
        ${row("Qualification", r.quiz.qualification)}
        ${row("Budget", r.quiz.budget)}
        ${row("Preferred countries", r.quiz.preferredNone ? "No preference" : list(r.quiz.preferredCountries))}
        ${row("Field of interest", r.quiz.course)}
        ${row("Planning to go", r.quiz.timeline)}
      </table>

      <h3 style="font-size:14px;margin:18px 0 8px;color:#1d4ed8;">Recommended destinations</h3>
      <ul style="margin:0;padding-left:18px;font-size:13px;">${recs}</ul>
      <p style="margin:8px 0 0;font-size:11px;color:#64748b;">
        These are preliminary suggestions based on your answers — not an eligibility check, admission
        offer, employment promise or visa guarantee.
      </p>

      ${
        r.academic.degree || r.academic.gradYear || r.academic.percentage
          ? `<h3 style="font-size:14px;margin:18px 0 8px;color:#1d4ed8;">Academic details you shared</h3>
             <table style="border-collapse:collapse;width:100%;font-size:13px;">
               ${row("Degree / Course", r.academic.degree)}
               ${row("Graduation year", r.academic.gradYear)}
               ${row("Percentage / CGPA", r.academic.percentage)}
               ${row("Study gap", r.academic.studyGap)}
               ${row("English test", r.academic.englishTest)}
               ${row("Passport", r.academic.passport)}
             </table>`
          : ""
      }

      ${
        r.requirements.length
          ? `<h3 style="font-size:14px;margin:18px 0 8px;color:#1d4ed8;">Help you asked for</h3>
             <p style="margin:0;font-size:13px;">${list(r.requirements)}</p>`
          : ""
      }

      <div style="margin-top:20px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:14px 16px;">
        <h3 style="font-size:13px;margin:0 0 8px;color:#0369a1;">What happens next</h3>
        <ol style="margin:0;padding-left:18px;font-size:12.5px;line-height:1.7;">
          <li>Our counselling team reviews your quiz answers and preferences.</li>
          <li>We contact you on <strong>${escapeHtml(r.contactMethod)}</strong> — usually within one working day (Mon–Sat).</li>
          <li>We discuss realistic country and course options, budget, scholarships, English tests and timelines.</li>
          <li>There is no charge for this first conversation, and no obligation to proceed.</li>
        </ol>
      </div>

      <p style="margin:16px 0 0;font-size:12.5px;">
        Need us sooner? Call or WhatsApp us at
        <a href="tel:+919306142129" style="color:#1d4ed8;">${escapeHtml(CONTACT.phone)}</a> or reply to this email.
      </p>

      <div style="margin-top:18px;border-top:1px solid #e2e8f0;padding-top:14px;font-size:11.5px;color:#475569;line-height:1.7;">
        <strong style="color:#0B1F3A;">Fly High Consultancy</strong><br/>
        ${escapeHtml(CONTACT.address)}<br/>
        Phone / WhatsApp: <a href="tel:+919306142129" style="color:#1d4ed8;">${escapeHtml(CONTACT.phone)}</a><br/>
        Email: <a href="mailto:${escapeHtml(CONTACT.email)}" style="color:#1d4ed8;">${escapeHtml(CONTACT.email)}</a><br/>
        Office hours: ${escapeHtml(CONTACT.hours)}
      </div>

      <p style="margin:16px 0 0;font-size:10px;color:#94a3b8;">
        This is an automated acknowledgement of your enquiry. Your details are used only to respond to this
        enquiry, as described in our Privacy Policy, and are never published or sold.
        Submitted ${escapeHtml(formatDateTime(r.receivedAt))}.
      </p>
    </div>
  </div>`;
};

const buildStudentEmailText = (r) => {
  const recs =
    r.quiz.recommendations.length > 0
      ? r.quiz.recommendations
          .map((x) => `- ${x.country} (${x.category}${x.matchPercent != null ? `, ${x.matchPercent}%` : ""})`)
          .join("\n")
      : "- A counsellor will shortlist options for your profile.";
  const list = (items) => (items.length ? items.join(", ") : "-");

  return [
    `Dear ${r.name},`,
    "",
    "Thank you for completing the Find Your Dream Country quiz and sending us your counselling",
    "enquiry. We have received your details successfully.",
    "",
    "YOUR DETAILS",
    `Name: ${r.name}`,
    `Email: ${r.email}`,
    `Phone: ${r.phone}`,
    `Preferred contact method: ${r.contactMethod}`,
    `City / State: ${r.cityState || "-"}`,
    `Interested specifically in: ${countryLabel(r.interestedCountry) || "No specific country"}`,
    "",
    "YOUR QUIZ ANSWERS",
    `Main goal: ${r.quiz.goal || "-"}`,
    `Qualification: ${r.quiz.qualification || "-"}`,
    `Budget: ${r.quiz.budget || "-"}`,
    `Preferred countries: ${r.quiz.preferredNone ? "No preference" : list(r.quiz.preferredCountries)}`,
    `Field of interest: ${r.quiz.course || "-"}`,
    `Planning to go: ${r.quiz.timeline || "-"}`,
    "",
    "RECOMMENDED DESTINATIONS (preliminary suggestions only)",
    recs,
    "",
    "WHAT HAPPENS NEXT",
    "1. Our counselling team reviews your quiz answers and preferences.",
    `2. We contact you on ${r.contactMethod} — usually within one working day (Mon-Sat).`,
    "3. We discuss realistic country and course options, budget, scholarships, English tests and timelines.",
    "4. There is no charge for this first conversation, and no obligation to proceed.",
    "",
    `Need us sooner? Call or WhatsApp ${CONTACT.phone} or reply to this email.`,
    "",
    "---",
    "Fly High Consultancy",
    CONTACT.address,
    `Phone / WhatsApp: ${CONTACT.phone}`,
    `Email: ${CONTACT.email}`,
    `Office hours: ${CONTACT.hours}`,
    "",
    "This is an automated acknowledgement of your enquiry. Your details are used only to respond to",
    "this enquiry and are never published or sold.",
    `Submitted ${formatDateTime(r.receivedAt)}.`,
  ].join("\n");
};

const sendStudentConfirmation = async (record) => {
  if (!record.email) {
    return { delivered: false, transport: null, error: new Error("Visitor has no email address") };
  }
  const sender = process.env.MAIL_FROM || process.env.SMTP_USER || OWNER_EMAIL;

  const result = await sendEmail({
    to: { email: record.email, name: record.name },
    subject: "Your Fly High Consultancy Enquiry Has Been Received!",
    html: buildStudentEmailHtml(record),
    text: buildStudentEmailText(record),
    // Replies go to the counselling desk, not back to the automated sender.
    replyTo: { email: sender, name: "Fly High Consultancy" },
  });

  if (result.delivered) {
    console.log(`[counselling] student confirmation sent via ${result.transport} to ${record.email}`);
  }
  return result;
};

/* ---------- 4. Duplicate-submission guard ---------- */
const dedupeKey = (record) => `${record.email}|${record.phone.replace(/\D/g, "")}`;

const pruneDedupe = (now) => {
  for (const [key, entry] of recentSubmissions) {
    if (now - entry.at > DEDUPE_WINDOW_MS) recentSubmissions.delete(key);
  }
};

const isDuplicate = (record) => {
  const now = Date.now();
  pruneDedupe(now);
  const entry = recentSubmissions.get(dedupeKey(record));
  return Boolean(entry && now - entry.at <= DEDUPE_WINDOW_MS);
};

const markSubmitted = (record) => {
  recentSubmissions.set(dedupeKey(record), { at: Date.now() });
};

/* ---------- Controller ---------- */
exports.submitCounsellingEnquiry = async (req, res) => {
  const record = buildRecord(req.body);

  // Ignore an exact repeat of an enquiry we already accepted (double click,
  // browser retry, impatient refresh). The visitor still gets a success screen.
  if (isDuplicate(record)) {
    console.warn("[counselling] duplicate submission ignored:", dedupeKey(record));
    return res.status(200).json({
      success: true,
      duplicate: true,
      saved: true,
      adminNotified: true,
      studentNotified: true,
      message: "Your enquiry has already been received. Our team will contact you soon.",
    });
  }

  let saved = false;
  try {
    saveEnquiryLocally(record);
    saved = true;
  } catch (error) {
    console.error("[counselling] could not persist enquiry:", error.message);
  }

  // EMAIL 1 — admin notification. This is the one that must not be lost.
  let adminNotified = false;
  try {
    const result = await sendAdminNotification(record);
    adminNotified = result.delivered;
    if (!result.delivered) {
      console.error("[counselling] admin notification not delivered:", result.error?.message || "no transport");
    }
  } catch (error) {
    console.error("[counselling] admin notification failed:", error.message);
  }

  // EMAIL 2 — student confirmation. Best effort: the enquiry is already safe,
  // so a bounce here must not block the visitor's thank-you screen.
  let studentNotified = false;
  try {
    const result = await sendStudentConfirmation(record);
    studentNotified = result.delivered;
    if (!result.delivered) {
      console.warn("[counselling] student confirmation not delivered:", result.error?.message || "no transport");
    }
  } catch (error) {
    console.warn("[counselling] student confirmation failed:", error.message);
  }

  if (!saved && !adminNotified) {
    return res.status(500).json({
      success: false,
      message:
        "We could not submit your enquiry right now. Please try again, or call/WhatsApp us at +91 93061 42129.",
    });
  }

  markSubmitted(record);

  if (!isConfigured()) {
    console.warn("[counselling] no email transport configured — enquiry stored locally only.");
  }

  const message =
    studentNotified
      ? "Your enquiry has been received. A confirmation email is on its way to you."
      : "Your enquiry has been received. Our team will contact you soon.";

  return res.status(200).json({
    success: true,
    duplicate: false,
    saved,
    adminNotified,
    studentNotified,
    message,
  });
};