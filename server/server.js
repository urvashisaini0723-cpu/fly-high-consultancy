const path = require("path");
// load server/.env no matter which folder the process was started from
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const contactRoutes = require("./routes/contact");
const chatbotRoutes = require("./routes/chatbot");
const counsellingRoutes = require("./routes/counselling");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = (
  process.env.CLIENT_ORIGIN ||
  "http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174"
)
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

// Exact origins plus wildcard entries such as https://*.vercel.app
const originAllowed = (origin) =>
  allowedOrigins.some((allowed) => {
    if (allowed === "*") return true;
    if (!allowed.includes("*")) return allowed === origin;
    const pattern = allowed.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
    return new RegExp(`^${pattern}$`).test(origin);
  });

// Render terminates TLS in front of the app - trust one proxy hop so
// rate limiting sees the real visitor IP instead of the proxy IP.
app.set("trust proxy", 1);

app.use(
  cors({
    origin: (origin, cb) => {
      // allow same-origin / curl / mobile webviews (no Origin header)
      if (!origin || originAllowed(origin)) return cb(null, true);
      const err = new Error("Origin not allowed by CORS");
      err.status = 403;
      cb(err);
    },
    credentials: true,
  })
);

/* ------------------------------------------------------------------ *
 * Rate limiting
 * ------------------------------------------------------------------ */
const limiter = (max, windowMinutes, message) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    // never blocks a normal visitor mid-conversation
    skip: (req) => req.method === "OPTIONS",
    message: { success: false, reply: message, message },
  });

// Chatbot: generous, a real conversation is many messages
app.use(
  "/api/chatbot",
  limiter(100, 5, "You are sending messages too quickly. Please wait a few seconds and try again.")
);

// Contact form: strict
app.use(
  "/api/contact",
  limiter(10, 15, "Too many submissions. Please wait before trying again.")
);

// Counselling form: strict
app.use(
  "/api/counselling",
  limiter(8, 15, "Too many submissions. Please wait before trying again.")
);

// Everything else
app.use("/api", limiter(300, 15, "Too many requests, please try again later."));

app.use("/api/contact", contactRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/counselling", counsellingRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "Fly High Consultancy API is running",
    uptime: Math.round(process.uptime()),
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Error handler - always JSON, never Express's default HTML 500 page
app.use((err, _req, res, _next) => {
  if (res.headersSent) return;

  const status = Number(err.status || err.statusCode) || 500;

  if (status >= 500) {
    console.error("[server] request error:", err.message);
  } else {
    console.warn("[server] rejected request:", err.message);
  }

  res.status(status).json({
    success: false,
    message: status >= 500 ? "Internal server error" : err.message,
    reply:
      "Something went wrong on our side. Please try again in a moment, or call or WhatsApp us at +91-93061-42129.",
  });
});

/* ------------------------------------------------------------------ *
 * Crash guards - keep the chatbot alive instead of dying silently
 * ------------------------------------------------------------------ */
process.on("unhandledRejection", (reason) => {
  // never let one failed request take the whole API down
  console.error("[server] unhandled rejection:", reason?.message || reason);
});
process.on("uncaughtException", (err) => {
  console.error("[server] uncaught exception:", err?.message || err);
  process.exit(1);
});

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Fly High Consultancy server running on port ${PORT}`);

  if (!process.env.GROQ_API_KEY) {
    console.warn(
      "[server] WARNING: GROQ_API_KEY is missing in server/.env - FlyBot will use local answers only."
    );
  } else {
    console.log("[server] Groq API key detected - FlyBot AI is enabled.");

    // Non-blocking reachability probe: tells you in the terminal whether the AI
    // provider is usable. It never prints the key and never delays startup.
    const fetch = require("node-fetch");
    fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      timeout: 8000,
    })
      .then((response) => {
        if (response.ok) {
          console.log("[server] AI provider reachable - live answers enabled.");
        } else if (response.status === 401 || response.status === 403) {
          console.error(
            "[server] AI provider rejected the key (401/403) - please check GROQ_API_KEY in server/.env."
          );
        } else {
          console.warn(
            `[server] AI provider returned HTTP ${response.status} - local answers will be used.`
          );
        }
      })
      .catch((error) => {
        const reason = error.code || error.type || error.message;
        console.warn(
          `[server] AI provider unreachable (${reason}) - local answers will be used until it recovers.`
        );
      });
  }
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `[server] Port ${PORT} is already in use. Stop the other process (lsof -ti:${PORT} | xargs kill -9) and start again.`
    );
  } else {
    console.error("[server] failed to start:", err.message);
  }
  process.exit(1);
});

module.exports = app;
