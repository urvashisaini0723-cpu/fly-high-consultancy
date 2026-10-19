# FLY HIGH CONSULTANCY — Website

Multi-page animated website for Fly High Consultancy, Pehowa.

## Structure
```
fly-high-consultancy/
├── client/   (React + Vite frontend)
└── server/   (Node.js + Express backend)
```

## Setup (single command for both)
```bash
# from project root
npm install            # installs concurrently
npm run install:all    # installs server + client deps
cd server && cp .env.example .env && cd ..
npm run dev            # runs backend + frontend together
```
Client: http://localhost:5173
Server: http://localhost:5000

### Backend only
```bash
cd server
cp .env.example .env
npm install
npm run dev
```

### Frontend only
```bash
cd client
npm install
npm run dev
```

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
