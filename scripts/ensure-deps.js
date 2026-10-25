// Runs automatically before "npm run dev".
// 1. Installs server/client packages only if node_modules is missing,
//    so a fresh checkout starts with a single command: npm run dev
// 2. Runs a quick preflight: .env / GROQ_API_KEY / port conflicts.
const { execSync } = require("child_process");
const fs = require("fs");
const net = require("net");
const path = require("path");

const root = path.join(__dirname, "..");
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

/* ---------------------------------------------------------------- *
 * 1. dependencies
 * ---------------------------------------------------------------- */
for (const dir of ["server", "client"]) {
  const nm = path.join(root, dir, "node_modules");
  if (!fs.existsSync(nm)) {
    console.log(`\n[setup] Installing ${dir} dependencies...`);
    execSync("npm install", { cwd: path.join(root, dir), stdio: "inherit" });
  } else {
    console.log(`[setup] ${dir} dependencies OK`);
  }
}

/* ---------------------------------------------------------------- *
 * 2. environment
 * ---------------------------------------------------------------- */
const envPath = path.join(root, "server", ".env");
const envExamplePath = path.join(root, "server", ".env.example");
let env = {};

const parseEnv = (file) => {
  const out = {};
  if (!fs.existsSync(file)) return out;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m && !line.trim().startsWith("#")) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
};

if (!fs.existsSync(envPath)) {
  console.warn(`\n${YELLOW}[setup] server/.env is missing.${RESET}`);
  if (fs.existsSync(envExamplePath)) {
    console.warn("[setup] Copy the template and fill in your keys:");
    console.warn(`${DIM}        cp server/.env.example server/.env${RESET}`);
  }
} else {
  env = parseEnv(envPath);
  console.log("[setup] server/.env found");
}

const groqKey = env.GROQ_API_KEY || "";
if (!groqKey || /^your_|^gsk_x+$|placeholder/i.test(groqKey)) {
  console.warn(
    `${YELLOW}[setup] GROQ_API_KEY is not configured - FlyBot will answer from the local knowledge base only.${RESET}`
  );
} else if (groqKey.length < 20) {
  console.warn(`${YELLOW}[setup] GROQ_API_KEY looks too short - please double check it.${RESET}`);
} else {
  console.log("[setup] GROQ_API_KEY detected");
}

/* ---------------------------------------------------------------- *
 * 3. port conflicts (leftover dev servers block a clean start)
 * ---------------------------------------------------------------- */
const isPortBusy = (port) =>
  new Promise((resolve) => {
    const socket = net.connect({ port, host: "127.0.0.1" });
    const finish = (busy) => {
      socket.destroy();
      resolve(busy);
    };
    socket.setTimeout(500);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
  });

(async () => {
  const [busy5000, busy5173] = await Promise.all([isPortBusy(5000), isPortBusy(5173)]);

  if (busy5000) {
    console.error(
      `\n${RED}[setup] Port 5000 is already in use - a Fly High backend is already running.${RESET}`
    );
    console.error(
      `[setup] Starting a second copy would leave you with a frontend that cannot reach its API.`
    );
    console.error(`[setup] The existing site is probably already open at http://localhost:5173`);
    console.error(`${DIM}        Stop it first:  lsof -ti:5000,5173,5174 | xargs kill -9${RESET}`);
    console.error(`[setup] Then run "npm run dev" again.\n`);
    process.exit(1);
  }
  if (busy5173) {
    console.warn(
      `\n${RED}[setup] Port 5173 is already in use.${RESET} A previous frontend may still be running.`
    );
    console.warn(`${DIM}        lsof -ti:5173 | xargs kill -9${RESET}`);
    console.warn("[setup] Otherwise Vite will pick the next free port.\n");
  }

  if (!busy5000 && !busy5173) {
    console.log(`${GREEN}[setup] Ports 5000 and 5173 are free${RESET}`);
  }

  console.log("[setup] Ready. Starting frontend + backend...\n");
})();
