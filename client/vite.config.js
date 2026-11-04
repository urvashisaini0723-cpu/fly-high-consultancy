import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const API_TARGET = "http://localhost:5000";

/**
 * When the backend is not running, Vite's proxy would answer with an empty
 * 500 response and the browser would only see "failed to fetch". Returning a
 * JSON body lets the chatbot show an accurate "service offline" state.
 */
function apiProxyGuard() {
  return {
    name: "fly-high-api-proxy-guard",
    configureServer(server) {
      server.httpServer?.once("listening", () => {
        setTimeout(async () => {
          try {
            const res = await fetch(`${API_TARGET}/api/health`, {
              signal: AbortSignal.timeout(2500),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            console.log("\n  \x1b[32m[api]\x1b[0m backend online at " + API_TARGET + "\n");
          } catch {
            console.warn(
              "\n  \x1b[33m[api] WARNING: backend is NOT running on port 5000.\x1b[0m"
            );
            console.warn(
              "  FlyBot chat and the contact form will fail until it is started."
            );
            console.warn(
              "  Run \x1b[1mnpm run dev\x1b[0m from the project root (not from client/).\n"
            );
          }
        }, 900);
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), apiProxyGuard()],
  build: {
    // Split the big, rarely-changing vendor code so returning visitors get
    // fast repeat loads (better long-term caching, no runtime benefit).
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "motion-vendor": ["framer-motion"],
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: API_TARGET,
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("error", (err, _req, res) => {
            const payload = JSON.stringify({
              success: false,
              backendDown: true,
              reply:
                "The FlyBot service is offline. Start the backend with `npm run dev` from the project root, then press Retry.",
              message: `API server unreachable on port 5000 (${err?.code || "ECONNREFUSED"})`,
            });

            if (res && !res.headersSent && typeof res.writeHead === "function") {
              res.writeHead(502, { "Content-Type": "application/json" });
              res.end(payload);
            } else if (res && typeof res.end === "function" && !res.writableEnded) {
              res.end(payload);
            }
          });
        },
      },
    },
  },
});
