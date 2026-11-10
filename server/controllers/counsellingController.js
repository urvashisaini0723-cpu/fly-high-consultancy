/**
 * Counselling enquiry handler for the "Find Your Dream Country" quiz.
 *
 * What happens on submit:
 *   1. A sanitized record (personal + academic + quiz answers + recommendations)
 *      is appended to server/data/enquiries.jsonl (created with 0700/0600 perms,
 *      gitignored). This is the durable LOCAL record — note Render's free tier
 *      ephemeral filesystem means this survives restarts but NOT redeploys.
 *   2. A notification email is sent to the counselling team via Brevo
 *      (BREVO_API_KEY + MAIL_TO already configured for the contact form) with
 *      SMTP fallback (SMTP_HOST/USER/PASS) when Brevo is not set.
 *   3. The API answers success=true only if at least ONE of the two channels
 *      actually worked. Otherwise the visitor sees a retryable error and their
 *      input stays on screen. We never fake a success.
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

const ENQUIRIES_FILE =
  process.env.ENQUIRIES_FILE || path.join(__dirname, "..", "data", "enquiries.jsonl");

/* Every quiz enquiry must reach the counselling inbox. MAIL_TO can only ADD
   addresses; the owner address below is always included so a missing/typo'd
   Render env var can never silently stop the notifications. */
const OWNER_EMAIL = "urvashisaini0723@gmail.com";

const getRecipients = () => {
  const configured = String(process.env.MAIL_TO || "")
    .split(/[,;\s]+/)
    .map((s) => s.trim().toLowerCase())
    .filter((s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s));
  return [...new Set([OWNER_EMAIL, ...configured])];
};

const isConfiguredSmtp = () =>
  process.env.SMTP_HOST &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS &&
  !String(process.env.SMTP_USER).includes("your_email") &&
  !String(process.env.SMTP_PASS).includes("your_app_password");

const escapeHtml = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const clip = (value, max = 500) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

const asBool = (v) => v === true || v === "true" || v === 1;

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

/* ---------- 3. Notify the counselling team (Brevo → SMTP fallback) ---------- */
const buildEmailHtml = (r) => {
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
        ${row("Interested specifically in", r.interestedCountry || "No specific country")}
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
        Received ${escapeHtml(r.receivedAt)} · Visitor consent given at ${escapeHtml(r.consent.at || "—")} ·
        Source: ${escapeHtml(r.source)}
      </p>
    </div>
  </div>`;
};

const buildEmailText = (r) => {
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
    `Interested specifically in: ${r.interestedCountry || "No specific country"}`,
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
    `Received ${r.receivedAt} | Consent given at ${r.consent.at || "-"} | Source: ${r.source}`,
  ].join("\n");
};

const sendNotification = async (record) => {
  const recipients = getRecipients();
  const fromEmail = process.env.MAIL_FROM || process.env.SMTP_USER || OWNER_EMAIL;
  const subject = `New Counselling Enquiry — ${record.name}`;
  const html = buildEmailHtml(record);
  const text = buildEmailText(record);

  // Brevo transactional API (same integration the contact form uses).
  // One retry for transient 5xx/network failures; 4xx (bad key/sender) is final.
  let brevoError = null;
  if (process.env.BREVO_API_KEY) {
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            "api-key": process.env.BREVO_API_KEY,
          },
          body: JSON.stringify({
            sender: { name: "Fly High Consultancy Website", email: fromEmail },
            to: recipients.map((email) => ({ email })),
            replyTo: { email: record.email, name: record.name },
            subject,
            htmlContent: html,
            textContent: text,
          }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          const error = new Error(`Brevo delivery failed (${response.status})`);
          error.data = data;
          error.permanent = response.status < 500;
          throw error;
        }
        console.log("[counselling] notification emailed via Brevo to", recipients.join(", "));
        return true;
      } catch (error) {
        brevoError = error;
        if (error.permanent) break;
        if (attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 900));
        }
      }
    }
    console.error("[counselling] Brevo error:", brevoError?.data || brevoError?.message);
  }

  // SMTP fallback — also used when Brevo is configured but rejected the email
  if (isConfiguredSmtp()) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transporter.sendMail({
      from: `"Fly High Consultancy Website" <${process.env.SMTP_USER}>`,
      to: recipients.join(", "),
      replyTo: record.email,
      subject,
      html,
      text,
    });
    console.log("[counselling] notification emailed via SMTP to", recipients.join(", "));
    return true;
  }

  if (brevoError) throw brevoError;

  console.warn("[counselling] No email transport configured (BREVO_API_KEY / SMTP_*). Notification skipped.");
  return false;
};

/* ---------- Controller ---------- */
exports.submitCounsellingEnquiry = async (req, res) => {
  const record = buildRecord(req.body);

  let saved = false;
  try {
    saveEnquiryLocally(record);
    saved = true;
  } catch (error) {
    console.error("[counselling] could not persist enquiry:", error.message);
  }

  let notified = false;
  try {
    notified = await sendNotification(record);
  } catch (error) {
    console.error("[counselling] notification failed:", error.message);
  }

  if (!saved && !notified) {
    return res.status(500).json({
      success: false,
      message:
        "We could not submit your enquiry right now. Please try again, or call/WhatsApp us at +91 93061 42129.",
    });
  }

  return res.status(200).json({
    success: true,
    saved,
    notified,
    message: "Your enquiry has been received. Our team will contact you soon.",
  });
};
