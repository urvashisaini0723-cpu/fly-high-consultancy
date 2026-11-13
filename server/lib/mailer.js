/**
 * Shared transactional email transport for Fly High Consultancy.
 *
 * This is the ONE place that knows how mail leaves the server. Both the
 * contact form (server/controllers/contactController.js) and the Dream
 * Country quiz counselling enquiry (server/controllers/counsellingController.js)
 * call sendEmail() below, so there is a single email integration to maintain.
 *
 * Transport order (same as the original contact-form implementation):
 *   1. Brevo transactional API  — BREVO_API_KEY + MAIL_FROM
 *   2. SMTP fallback            — SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS
 *   3. nothing configured       — delivered:false (caller decides what to do)
 *
 * The API key never leaves the server: this module is required only by the
 * Express backend and is never bundled into the client.
 */
require("dotenv").config();
const nodemailer = require("nodemailer");

const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";
const REQUEST_TIMEOUT_MS = 12000;
const RETRY_DELAY_MS = 900;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const DEFAULT_FROM_EMAIL = "urvashisaini0723@gmail.com";
const DEFAULT_SENDER_NAME = "Fly High Consultancy Website";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** SMTP is usable only when real credentials are present (not the .env.example placeholders). */
const isConfiguredSmtp = () =>
  Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      !String(process.env.SMTP_USER).includes("your_email") &&
      !String(process.env.SMTP_PASS).includes("your_app_password")
  );

/** True when at least one transport could deliver. */
const isConfigured = () => Boolean(process.env.BREVO_API_KEY) || isConfiguredSmtp();

/** Verified sender identity. Brevo requires the sender to be a verified sender/domain. */
const getSender = () => ({
  name: process.env.MAIL_SENDER_NAME || DEFAULT_SENDER_NAME,
  email: process.env.MAIL_FROM || process.env.SMTP_USER || DEFAULT_FROM_EMAIL,
});

/** Accepts a string, an array of strings, or [{ email, name }] and returns clean Brevo recipients. */
const normalizeRecipients = (to) =>
  (Array.isArray(to) ? to : [to])
    .map((entry) =>
      typeof entry === "string" ? { email: entry } : entry && typeof entry === "object" ? entry : null
    )
    .map((entry) => {
      if (!entry || !EMAIL_RE.test(String(entry.email || "").trim())) return null;
      return {
        email: String(entry.email).trim(),
        ...(entry.name ? { name: String(entry.name).trim().slice(0, 120) } : {}),
      };
    })
    .filter(Boolean)
    .filter(
      (entry, index, all) => all.findIndex((other) => other.email === entry.email) === index
    );

const fetchWithTimeout = (url, options) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
};

const sendViaBrevo = async ({ recipients, subject, html, text, replyTo, sender }) => {
  const response = await fetchWithTimeout(BREVO_ENDPOINT, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender,
      to: recipients,
      ...(replyTo ? { replyTo } : {}),
      subject,
      htmlContent: html,
      textContent: text,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(`Brevo delivery failed (${response.status})`);
    error.data = data;
    // 4xx = bad key / unverified sender / blocked address: retrying cannot help.
    error.permanent = response.status < 500;
    throw error;
  }

  return data;
};

const sendViaSmtp = async ({ recipients, subject, html, text, replyTo, sender }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  const replyToHeader = replyTo
    ? replyTo.name
      ? `"${replyTo.name}" <${replyTo.email}>`
      : replyTo.email
    : undefined;

  return transporter.sendMail({
    from: `"${sender.name}" <${process.env.SMTP_USER}>`,
    to: recipients.map((r) => (r.name ? `"${r.name}" <${r.email}>` : r.email)).join(", "),
    ...(replyToHeader ? { replyTo: replyToHeader } : {}),
    subject,
    html,
    text,
  });
};

/**
 * Send one email.
 *
 * @param {object}  mail
 * @param {string|string[]} mail.to        Recipient email(s).
 * @param {string}  mail.subject
 * @param {string}  mail.html
 * @param {string} [mail.text]             Optional plain-text alternative.
 * @param {{email:string,name?:string}} [mail.replyTo]
 * @returns {Promise<{delivered:boolean, transport:("brevo"|"smtp"|null), error:Error|null}>}
 *          Never throws — callers decide whether a failure is fatal.
 */
const sendEmail = async ({ to, subject, html, text, replyTo }) => {
  const recipients = normalizeRecipients(to);
  if (!recipients.length) {
    return { delivered: false, transport: null, error: new Error("No valid recipient address") };
  }

  const sender = getSender();
  let lastError = null;

  // 1. Brevo — one retry for transient 5xx / network failures.
  if (process.env.BREVO_API_KEY) {
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        await sendViaBrevo({ recipients, subject, html, text, replyTo, sender });
        return { delivered: true, transport: "brevo", error: null };
      } catch (error) {
        lastError = error;
        if (error.permanent) break;
        if (attempt < 2) await delay(RETRY_DELAY_MS);
      }
    }
    console.error("[mailer] Brevo error:", lastError?.data || lastError?.message);
  }

  // 2. SMTP fallback — also used when Brevo is configured but rejected the email.
  if (isConfiguredSmtp()) {
    try {
      await sendViaSmtp({ recipients, subject, html, text, replyTo, sender });
      return { delivered: true, transport: "smtp", error: null };
    } catch (error) {
      lastError = error;
      console.error("[mailer] SMTP error:", error.message);
    }
  }

  if (!process.env.BREVO_API_KEY && !isConfiguredSmtp()) {
    console.warn(
      "[mailer] No email transport configured (BREVO_API_KEY / SMTP_*). Email not sent."
    );
  }

  return { delivered: false, transport: null, error: lastError };
};

module.exports = {
  sendEmail,
  isConfigured,
  isConfiguredSmtp,
  getSender,
  normalizeRecipients,
};