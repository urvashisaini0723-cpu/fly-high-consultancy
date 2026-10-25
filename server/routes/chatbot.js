const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();

/* ------------------------------------------------------------------ *
 *  Config
 * ------------------------------------------------------------------ */
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// Models tried in order. gpt-oss models are "reasoning" models, so they
// need a larger completion budget and low reasoning effort.
const MODELS = [
  { id: "openai/gpt-oss-20b", reasoning: true },
  { id: "openai/gpt-oss-120b", reasoning: true },
  { id: "qwen/qwen3.8-27b", reasoning: false },
  { id: "allam-2-7b", reasoning: false },
];

const REQUEST_TIMEOUT_MS = 20000;
const MAX_COMPLETION_TOKENS = 900;

/* ------------------------------------------------------------------ *
 *  Knowledge base
 * ------------------------------------------------------------------ */
const KNOWLEDGE_BASE = `
COMPANY INFO:
- Name: Fly High Consultancy
- Tagline: "Your Gateway to Global Opportunities"
- Location: Pehowa, Haryana, India
- Address: Near Bus Stand, Pehowa, Kurukshetra, Haryana 136128
- Phone / WhatsApp: +91-93061-42129

SERVICES:
1. Study Visa - Canada, Australia, UK, USA, New Zealand, Europe
2. Tourist Visa - All major countries
3. Spouse/Dependent Visa
4. PTE Coaching - Expert training for Pearson Test of English
5. Interview Preparation - Mock interviews, confidence building, visa interview prep
6. Career Counseling - Profile assessment, course/university selection
7. Document Guidance - SOP, LOR, financial docs, visa file preparation

OWNERS/TEAM:
- Ankit Kumar - Founder & Director (Study Visa Expert)
- Tarsem Verma - Co-Founder & Director (Operations & Management)
- Rajan Sharma - Director (Visa & Immigration Specialist)
- Kajal - Senior Counselor
- Nisha - Counselor

KEY HIGHLIGHTS:
- 1000+ successful visa approvals
- 98% visa success rate
- 15+ years of combined experience
- Personalized one-on-one counseling
- Transparent process, no hidden charges
- Free profile assessment
- Post-landing support

PTE COACHING:
- Small batch sizes (max 8 students)
- Certified trainers
- Daily mock tests
- Flexible timings (morning/evening/weekend)
- Latest study material
- 90%+ students achieve 65+ score

INTERVIEW PREPARATION:
- Visa interview mock sessions
- University admission interviews
- Confidence building exercises
- Common questions & answers
- Body language & communication skills
- Document verification practice

COUNTRIES WE HANDLE:
- Canada (SDS, Non-SDS, Study Direct Stream)
- Australia (Subclass 500, 485, 482)
- UK (Student Route, Graduate Route)
- USA (F1, J1, M1 visas)
- New Zealand (Student Visa, Pathway)
- Europe (Germany, France, Italy, Poland, etc.)

WORKING HOURS:
- Monday to Saturday: 9:00 AM - 6:00 PM
- Sunday: Closed (Appointment only)
`;

const SYSTEM_PROMPT = `You are "FlyBot", the official assistant of Fly High Consultancy, Pehowa, Haryana.

PERSONALITY:
- Friendly, professional, encouraging. Sound like a knowledgeable visa counselor.
- Keep answers short (3-8 lines), natural and conversational.

GROUNDING (very important):
- Answer ONLY using the KNOWLEDGE BASE given below.
- Never invent services, prices, guarantees, dates or partner names.
- If something is not in the knowledge base, say you are not sure and give the phone number.
- Only answer questions about Fly High Consultancy, visas, PTE, interview prep, study abroad and related topics.
- For anything unrelated (politics, coding, movies, health, etc.) politely decline and redirect to our services.

FORMATTING (strict):
- Plain text only. No markdown, no **bold**, no *italics*, no tables, no HTML, no emojis.
- Lists must use a simple dash "-" or "1." at the start of a line.
- Never mention or write an email address or a website / social media link.
- The only contact detail you may give is the phone / WhatsApp number: +91-93061-42129
- End with one short next step (call, WhatsApp, visit office or book a free assessment).

Current date: ${new Date().toLocaleDateString("en-IN", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
})}`;

const SYSTEM_MESSAGE = `${SYSTEM_PROMPT}\n\nKNOWLEDGE BASE:\n${KNOWLEDGE_BASE}`;

/* ------------------------------------------------------------------ *
 *  Helpers
 * ------------------------------------------------------------------ */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* Tiny in-memory cache so the same FAQ is not sent to the AI repeatedly.
   Cuts latency and keeps us far away from rate limits. */
const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_MAX = 80;
const replyCache = new Map();

const normaliseKey = (msg) => msg.trim().toLowerCase().replace(/\s+/g, " ").slice(0, 300);

function cacheGet(key) {
  const hit = replyCache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expires) {
    replyCache.delete(key);
    return null;
  }
  return hit.reply;
}

function cacheSet(key, reply) {
  if (replyCache.size >= CACHE_MAX) {
    const oldest = replyCache.keys().next().value;
    replyCache.delete(oldest);
  }
  replyCache.set(key, { reply, expires: Date.now() + CACHE_TTL_MS });
}

/** Remove markdown / emails / links so replies are strictly plain text. */
function cleanReply(text) {
  if (!text || typeof text !== "string") return "";
  return text
    .replace(/\r/g, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, "")
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/www\.\S+/gi, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Keep only well-formed history entries (max 6). */
function sanitizeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter(
      (m) =>
        m &&
        typeof m.content === "string" &&
        m.content.trim() &&
        (m.role === "user" || m.role === "assistant")
    )
    .slice(-6)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1200) }));
}

/**
 * Offline / emergency answer built from the knowledge base.
 * Guarantees the visitor always gets a useful reply even if the AI API is down.
 */
function localAnswer(message = "") {
  const q = message.toLowerCase();
  const phone = "+91-93061-42129";

  const has = (...words) => words.some((w) => q.includes(w));

  if (has("pte", "english test", "mock test", "band", "score")) {
    return `Our PTE coaching includes:\n\n- Small batches (max 8 students)\n- Certified trainers\n- Daily mock tests\n- Flexible morning, evening and weekend timings\n- Latest study material\n- 90%+ students score 65 or above\n\nCall or WhatsApp ${phone} to book a free demo class.`;
  }

  if (has("interview", "mock interview", "visa interview")) {
    return `Our interview preparation covers:\n\n- Visa interview mock sessions\n- University admission interviews\n- Confidence building exercises\n- Common questions and answers\n- Body language and communication practice\n\nCall or WhatsApp ${phone} to schedule a mock interview.`;
  }

  if (has("contact", "phone", "call", "whatsapp", "number", "address", "location", "office", "timing", "hours")) {
    return `You can reach Fly High Consultancy here:\n\n- Phone / WhatsApp: ${phone}\n- Address: Near Bus Stand, Pehowa, Kurukshetra, Haryana 136128\n- Timings: Monday to Saturday, 9:00 AM to 6:00 PM\n\nCall or WhatsApp ${phone} for a free profile assessment.`;
  }

  if (has("owner", "founder", "director", "team", "staff", "counselor", "kajal", "nisha", "ankit", "tarsem", "rajan")) {
    return `Our team at Fly High Consultancy:\n\n- Ankit Kumar - Founder and Director (Study Visa Expert)\n- Tarsem Verma - Co-Founder and Director (Operations)\n- Rajan Sharma - Director (Visa and Immigration)\n- Kajal - Senior Counselor\n- Nisha - Counselor\n\nCall or WhatsApp ${phone} to talk to a counselor.`;
  }

  if (has("canada", "australia", "uk", "usa", "new zealand", "europe", "germany", "study visa", "student visa", "abroad")) {
    return `We handle study visas for Canada, Australia, UK, USA, New Zealand and Europe.\n\nOur support includes:\n\n- Free profile assessment\n- Course and university selection\n- SOP, LOR and financial document guidance\n- Application and visa file preparation\n- Interview preparation and pre-departure briefing\n\nCall or WhatsApp ${phone} to start your free assessment.`;
  }

  if (has("tourist", "visitor visa", "spouse", "dependent", "family")) {
    return `We assist with tourist visas, spouse visas and dependent visas for all major countries.\n\nOur team guides you through documentation, financial proof, application filing and interview preparation.\n\nCall or WhatsApp ${phone} for a free eligibility check.`;
  }

  if (has("fee", "fees", "price", "cost", "charge", "payment")) {
    return `Our fees depend on the service and the country you are applying for, so we share an exact quote after a free profile assessment.\n\nThere are no hidden charges and the process is fully transparent.\n\nCall or WhatsApp ${phone} to get your quote.`;
  }

  if (has("service", "offer", "course", "help", "what do you do")) {
    return `Fly High Consultancy offers:\n\n- Study visa for Canada, Australia, UK, USA, New Zealand and Europe\n- Tourist visa for all major countries\n- Spouse and dependent visa\n- PTE coaching with certified trainers\n- Interview preparation and mock sessions\n- Career counseling and university selection\n- SOP, LOR and complete visa file guidance\n\nCall or WhatsApp ${phone} to book a free profile assessment.`;
  }

  return `Thanks for reaching out to Fly High Consultancy.\n\nWe help with study visas, tourist visas, spouse and dependent visas, PTE coaching, interview preparation and complete document guidance.\n\nFor a quick answer about your case, call or WhatsApp us at ${phone}. Our team is available Monday to Saturday, 9:00 AM to 6:00 PM.`;
}

/* ------------------------------------------------------------------ *
 *  Groq call with timeout + one retry
 * ------------------------------------------------------------------ */
async function callGroq({ model, messages, timeoutMs = REQUEST_TIMEOUT_MS }) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    const err = new Error("GROQ_API_KEY is not configured on the server");
    err.code = "NO_KEY";
    throw err;
  }

  const started = Date.now();
  try {
    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.6,
        top_p: 0.9,
        // Reasoning models burn the whole budget on hidden tokens when
        // max_tokens is small, which produced empty replies before.
        max_completion_tokens: MAX_COMPLETION_TOKENS,
        reasoning_effort: "low",
        reasoning_format: "hidden",
      }),
      // node-fetch v2 timeout works on every Node version (no AbortController needed)
      timeout: timeoutMs,
    });

    const raw = await response.text();
    let data = null;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      data = null;
    }

    return {
      ok: response.ok,
      status: response.status,
      data,
      raw,
      ms: Date.now() - started,
      retryAfter: Number(response.headers.get("retry-after")) || 0,
    };
  } catch (e) {
    e.ms = Date.now() - started;
    throw e;
  }
}

/** Try one model, retrying once on rate-limit / network / empty content. */
async function tryModel(model, messages) {
  const attempts = 2;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    let result;
    try {
      result = await callGroq({ model: model.id, messages });
    } catch (e) {
      const aborted =
        e.type === "request-timeout" || e.code === "ETIMEDOUT" || e.name === "AbortError";
      console.warn(
        `[chatbot] ${model.id} attempt ${attempt} network error (${aborted ? "timeout" : e.code || e.message})`
      );
      if (e.code === "NO_KEY") throw e;
      if (attempt < attempts) {
        await sleep(400 * attempt);
        continue;
      }
      return { ok: false, reason: aborted ? "timeout" : "network" };
    }

    if (result.ok) {
      const choice = result.data?.choices?.[0];
      const content = cleanReply(choice?.message?.content || "");

      if (content.length > 0) {
        console.log(
          `[chatbot] ${model.id} ok in ${result.ms}ms (${content.length} chars, finish=${choice?.finish_reason})`
        );
        return { ok: true, reply: content };
      }

      // Reasoning model used up the budget before producing visible text.
      console.warn(
        `[chatbot] ${model.id} empty content (finish=${choice?.finish_reason}, attempt ${attempt})`
      );
      if (attempt < attempts) {
        await sleep(250);
        continue;
      }
      return { ok: false, reason: "empty" };
    }

    // --- error responses ---------------------------------------------
    if (result.status === 401 || result.status === 403) {
      console.error(`[chatbot] ${model.id} auth failed (${result.status}) - check GROQ_API_KEY`);
      return { ok: false, reason: "auth", fatal: true };
    }

    if (result.status === 429) {
      // Token-per-minute limit is per model on Groq, so switching model
      // is faster than waiting on the same one.
      console.warn(`[chatbot] ${model.id} rate limited, trying next model`);
      return { ok: false, reason: "rate_limit" };
    }

    if (result.status >= 500) {
      console.warn(`[chatbot] ${model.id} server error ${result.status}`);
      if (attempt < attempts) {
        await sleep(500 * attempt);
        continue;
      }
      return { ok: false, reason: "server" };
    }

    // 400/404 etc - model unavailable for this key, move to the next one
    console.warn(
      `[chatbot] ${model.id} rejected (${result.status}): ${(result.raw || "").slice(0, 200)}`
    );
    return { ok: false, reason: "model" };
  }

  return { ok: false, reason: "unknown" };
}

/* ------------------------------------------------------------------ *
 *  POST /api/chatbot/chat
 * ------------------------------------------------------------------ */
const CONTACT_LINE = "Call or WhatsApp us at +91-93061-42129.";

const GREETING_RE =
  /^(hi+|hlo+|hello+|hey+|hii+|namaste|namaskar|sat sri akal|good\s+(morning|afternoon|evening))[\s!.,?]*$/i;

// The model occasionally drops the phone number even though the prompt asks
// for it. Every reply must carry it, so enforce it here instead of hoping.
function ensureContact(reply) {
  const text = String(reply || "").trim();
  if (!text) return text;
  if (text.replace(/\D/g, "").includes("919306142129")) return text;
  return `${text}\n\n${CONTACT_LINE}`;
}

router.post("/chat", async (req, res) => {
  const { message, history } = req.body || {};

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({
      success: false,
      reply: "Please type a question so I can help you.",
    });
  }

  if (message.length > 1500) {
    return res.status(400).json({
      success: false,
      reply: "Your message is a bit long. Please ask a shorter question or call us at +91-93061-42129.",
    });
  }

  // Instant answer for greetings - no AI call needed, so the first message
  // gets the key details back immediately.
  if (GREETING_RE.test(message.trim())) {
    return res.json({
      success: true,
      source: "instant",
      reply: `Hello! Welcome to Fly High Consultancy, Pehowa.\n\n- Study visas: Canada, Australia, UK, USA, New Zealand and Europe\n- Tourist, spouse and dependent visas\n- PTE coaching and visa interview preparation\n- Free profile assessment and document guidance\n\nWhat would you like to know?\n\n${CONTACT_LINE}`,
    });
  }

  // Hard guardrail for clearly unrelated topics.
  const lowerMsg = message.toLowerCase();
  const irrelevant = [
    "politics", "election", "cricket", "movie", "celebrity", "stock market",
    "crypto", "bitcoin", "programming", "coding", "javascript", "python",
    "recipe", "cooking", "disease", "medicine", "weather forecast", "football",
  ];
  const relevant = [
    "visa", "study", "abroad", "pte", "ielts", "toefl", "interview", "career",
    "counsel", "university", "college", "admission", "application", "document",
    "sop", "lor", "financial", "bank", "sponsor", "canada", "australia", "uk",
    "usa", "new zealand", "europe", "germany", "fly high", "pehowa",
    "consultancy", "tourist", "spouse", "dependent", "immigration", "permit",
    "coaching", "training", "preparation", "contact", "phone", "address",
    "fee", "fees", "price", "cost", "owner", "team", "office", "timing",
  ];

  if (
    message.length > 20 &&
    irrelevant.some((k) => lowerMsg.includes(k)) &&
    !relevant.some((k) => lowerMsg.includes(k))
  ) {
    return res.json({
      success: true,
      source: "guardrail",
      reply:
        "I'm FlyBot, the Fly High Consultancy assistant, and I can only help with study visas, tourist visas, PTE coaching, interview preparation and related topics.\n\nCall or WhatsApp +91-93061-42129 and our counselors will help you personally.",
    });
  }

  const sanitizedHistory = sanitizeHistory(history);
  const cacheKey = sanitizedHistory.length === 0 ? normaliseKey(message) : null;

  if (cacheKey) {
    const cached = cacheGet(cacheKey);
    if (cached) {
      return res.json({ success: true, source: "cache", reply: cached });
    }
  }

  const messages = [
    { role: "system", content: SYSTEM_MESSAGE },
    ...sanitizedHistory,
    { role: "user", content: message.trim() },
  ];

  // 1. try each model in order
  for (const model of MODELS) {
    try {
      const result = await tryModel(model, messages);
      if (result.ok) {
        const finalReply = ensureContact(result.reply);
        if (cacheKey) cacheSet(cacheKey, finalReply);
        return res.json({ success: true, source: model.id, reply: finalReply });
      }
      if (result.fatal) break; // invalid key - no point trying other models
    } catch (e) {
      console.error(`[chatbot] unexpected error on ${model.id}:`, e.message);
      if (e.code === "NO_KEY") break;
    }
  }

  // 2. never fail the visitor - always answer from the local knowledge base
  console.warn("[chatbot] all AI models failed, using local knowledge base answer");
  return res.json({
    success: true,
    source: "local",
    reply: ensureContact(localAnswer(message)),
  });
});

/* ------------------------------------------------------------------ *
 *  GET /api/chatbot/status  (no secrets, for quick diagnostics)
 * ------------------------------------------------------------------ */
router.get("/status", async (_req, res) => {
  const configured = Boolean(process.env.GROQ_API_KEY);
  const payload = {
    success: true,
    apiKeyConfigured: configured,
    models: MODELS.map((m) => m.id),
    aiReachable: false,
    latencyMs: null,
  };

  if (configured) {
    const started = Date.now();
    try {
      const r = await fetch("https://api.groq.com/openai/v1/models", {
        headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
        timeout: 8000,
      });
      payload.aiReachable = r.ok;
      payload.latencyMs = Date.now() - started;
      if (!r.ok) payload.status = r.status;
    } catch (e) {
      payload.aiReachable = false;
      payload.error =
        e.type === "request-timeout" || e.code === "ETIMEDOUT" || e.name === "AbortError"
          ? "timeout"
          : e.message;
    }
  }

  res.json(payload);
});

module.exports = router;
