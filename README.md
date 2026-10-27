# FLY HIGH CONSULTANCY — Website

Multi-page animated website for Fly High Consultancy, Pehowa.

## Structure
```
fly-high-consultancy/
├── client/   (React + Vite frontend)
└── server/   (Node.js + Express backend)
```

## Run the site (one command)
```bash
# from project root
npm install            # installs concurrently
npm run install:all    # installs server + client deps
cd server && cp .env.example .env && cd ..
npm run dev            # runs backend + frontend together
```
Client: http://localhost:5173
Server: http://localhost:5000

### Keep it running after the terminal is closed
```bash
npm run bg       # starts detached, keeps running after the terminal is closed
npm run bg:stop  # stops the background site
```
Logs: `dev-server.log`

### Backend only (development)
```bash
cd server
npm run dev
```

The client cannot run on its own: `npm run dev` inside `client/` checks for the
API on port 5000 and stops with an explanation, because a frontend without its
API produces 500 errors in the browser console.

The Vite dev server proxies `/api` to the backend.

## Environment variables (server/.env)
- PORT
- CLIENT_ORIGIN (comma separated, supports wildcards such as `https://*.vercel.app`)
- GROQ_API_KEY
- BREVO_API_KEY
- MAIL_FROM
- MAIL_TO

## API
- POST /api/contact { name, phone, email, interest, message }
- POST /api/chatbot/chat { message, history }
- GET /api/health
- GET /api/chatbot/status

## Live deployment
- Frontend (Vercel): https://fly-high-consultancy.vercel.app
- Backend (Render): https://fly-high-api.onrender.com
- API health: https://fly-high-api.onrender.com/api/health

### Frontend - Vercel
- Project root directory: `client/` (framework: Vite)
- Build: `npm run build`, output: `dist`
- Environment variable: `VITE_API_BASE_URL=https://fly-high-api.onrender.com`
- `client/vercel.json` adds SPA rewrites so deep links and F5 work.
- Pushes to `main` deploy automatically. Vercel only allows deployments whose
  commit author is a team member, so this repo's local git identity is:
  `git config user.email urvashisaini0723@gmail.com`

### Backend - Render
- Service: `fly-high-api`, root directory `server/`
- Build: `npm install`, start: `npm start`, health check: `/api/health`
- Environment variables: `GROQ_API_KEY`, `BREVO_API_KEY`, `MAIL_FROM`,
  `MAIL_TO`, `CLIENT_ORIGIN` (set to `https://*.vercel.app`)
- Free plan sleeps after ~15 minutes idle. The first request can take
  30-60 seconds; the chat UI shows a "Waking up the assistant" hint.
  For an always-fast backend, use a paid Render instance or an uptime pinger.

## Disclaimer
General guidance only. Visa decisions are made by the relevant authorities.
© 2026 Fly High Consultancy, Pehowa.
