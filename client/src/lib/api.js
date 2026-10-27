// Central API URL.
// Development: empty -> Vite proxy sends /api to http://localhost:5000
// Production (Vercel): VITE_API_BASE_URL = https://<render-service>.onrender.com
export const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

export const apiUrl = (path) => `${API_BASE}${path}`;
