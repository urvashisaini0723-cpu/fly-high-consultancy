// Starts the full site in the background so it keeps running after the
// terminal (or VS Code) is closed. Normal `npm run dev` still exists for
// development with live logs.
const { spawn } = require("child_process");
const fs = require("fs");
const http = require("http");
const path = require("path");

const root = path.join(__dirname, "..");
const logFile = path.join(root, "dev-server.log");
const pidFile = path.join(root, ".dev-server.pid");
const URLS = ["http://localhost:5173", "http://localhost:5000"];

const isUp = (url, timeout = 800) =>
  new Promise((resolve) => {
    const req = http.get(url, (res) => {
      res.resume();
      resolve(res.statusCode > 0);
    });
    req.setTimeout(timeout, () => {
      req.destroy();
      resolve(false);
    });
    req.on("error", () => resolve(false));
  });

(async () => {
  if (await isUp("http://localhost:5000/api/health")) {
    console.log("[bg] Already running - open http://localhost:5173");
    console.log("[bg] To restart: npm run bg:stop && npm run bg");
    process.exit(0);
  }

  const out = fs.openSync(logFile, "a");
  const child = spawn(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "dev"], {
    cwd: root,
    detached: true,
    stdio: ["ignore", out, out],
    env: process.env,
  });
  child.unref();
  fs.writeFileSync(pidFile, String(child.pid));

  console.log(`[bg] Starting in the background (pid ${child.pid})...`);

  let ready = false;
  for (let i = 0; i < 60; i += 1) {
    const [api, site] = await Promise.all([isUp(URLS[1]), isUp(URLS[0])]);
    if (api && site) {
      ready = true;
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  if (ready) {
    console.log("[bg] Website ready: http://localhost:5173");
    console.log("[bg] This keeps running even if you close the terminal.");
    console.log(`[bg] Logs: ${logFile}`);
    console.log("[bg] Stop: npm run bg:stop");
  } else {
    console.log(`[bg] Started, but the site is not responding yet. Check ${logFile}`);
  }

  process.exit(ready ? 0 : 1);
})();
