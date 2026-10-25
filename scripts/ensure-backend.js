// Guard for "npm run dev" inside client/.
// Starting only the frontend leaves Vite on port 5173/5174 with no API behind
// it, and every chatbot request shows up as a 500 in the browser console.
// The full site must be started from the project root.
const net = require("net");

const PORT = Number(process.env.API_PORT || 5000);
const WAIT_MS = 8000;

const isUp = () =>
  new Promise((resolve) => {
    const socket = net.connect({ port: PORT, host: "127.0.0.1" });
    const done = (value) => {
      socket.destroy();
      resolve(value);
    };
    socket.setTimeout(700);
    socket.once("connect", () => done(true));
    socket.once("timeout", () => done(false));
    socket.once("error", () => done(false));
  });

(async () => {
  const deadline = Date.now() + WAIT_MS;

  // The root "npm run dev" starts the API and the client together, so give
  // the backend a few seconds to bind before declaring it missing.
  while (Date.now() < deadline) {
    if (await isUp()) process.exit(0);
    await new Promise((resolve) => setTimeout(resolve, 400));
  }

  console.error("");
  console.error(`[api] No backend is running on port ${PORT}.`);
  console.error("[api] Starting only the client gives you a site whose chat and");
  console.error("[api] contact form cannot work (browser console shows 500 errors).");
  console.error("");
  console.error("[api] Start the full site from the project root instead:");
  console.error("[api]     cd /home/kd/Desktop/urvashi/fly-high-consultancy");
  console.error("[api]     npm run dev");
  console.error("");
  process.exit(1);
})();
