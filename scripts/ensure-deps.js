// Runs automatically before "npm run dev".
// Installs server/client packages ONLY if their node_modules are missing,
// so a fresh checkout starts with a single command: npm run dev
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

for (const dir of ["server", "client"]) {
  const nm = path.join(root, dir, "node_modules");
  if (!fs.existsSync(nm)) {
    console.log(`\n[setup] Installing ${dir} dependencies...`);
    execSync("npm install", { cwd: path.join(root, dir), stdio: "inherit" });
  } else {
    console.log(`[setup] ${dir} dependencies OK`);
  }
}

console.log("[setup] Ready. Starting frontend + backend...\n");
