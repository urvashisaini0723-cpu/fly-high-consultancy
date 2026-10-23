const path = require("path");
// load server/.env no matter which folder the process was started from
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const contactRoutes = require("./routes/contact");
const chatbotRoutes = require("./routes/chatbot");

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

app.use(
  cors({
    origin: (origin, cb) => {
      // allow same-origin / curl / mobile webviews (no Origin header)
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error("Not allowed by CORS"));
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

// Everything else
app.use("/api", limiter(300, 15, "Too many requests, please try again later."));

app.use("/api/contact", contactRoutes);
app.use("/api/chatbot", chatbotRoutes);

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

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ success: false, message: "Internal server error" });
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

const server = app.listen(PORT, () => {
  console.log(`Fly High Consultancy server running on port ${PORT}`);

  if (!process.env.GROQ_API_KEY) {
    console.warn(
      "[server] WARNING: GROQ_API_KEY is missing in server/.env - FlyBot will use local answers only."
    );
  } else {
    console.log("[server] Groq API key detected - FlyBot AI is enabled.");
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
