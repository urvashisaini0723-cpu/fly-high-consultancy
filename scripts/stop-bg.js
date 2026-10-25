// Stops the background site started with "npm run bg".
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const pidFile = path.join(__dirname, "..", ".dev-server.pid");

for (const port of [5000, 5173, 5174]) {
  try {
    execSync(`lsof -ti:${port} | xargs -r kill -9`, { stdio: "ignore" });
  } catch {
    // nothing listening on this port
  }
}

try {
  fs.unlinkSync(pidFile);
} catch {
  // already gone
}

console.log("[bg] Website stopped.");
