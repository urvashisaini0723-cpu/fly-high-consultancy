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
- CLIENT_ORIGIN
- SMTP_HOST
- SMTP_PORT
- SMTP_SECURE
- SMTP_USER
- SMTP_PASS
- MAIL_TO

## API
- POST /api/contact { name, phone, email, interest, message }
- GET /api/health

## Deploy
- Build frontend: `cd client && npm run build` → serve `client/dist` (static host or behind Express).
- Host backend on any Node.js host; set .env and CLIENT_ORIGIN to your domain.
- Ensure SMTP credentials are configured in production.

## Disclaimer
General guidance only. Visa decisions are made by the relevant authorities.
© 2026 Fly High Consultancy, Pehowa.
