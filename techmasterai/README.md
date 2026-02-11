# TechMaster Nexus (TMAI)

A full-stack learning platform with **Type Forge** (typing practice), **DSA Practice**, **1v1 Code Arena**, and an AI **Chatbot**. Built with React, TypeScript, Vite, Express, Supabase, and Netlify.

---

## Features

- **Type Forge** — Code typing (cursor-sync), Spells (language mode), Fun (Bridge Jump, Astro Type), Live Coding
- **DSA Practice** — Problems, submissions, leaderboard, profile, solo/daily challenges, calendar
- **1v1 Code Arena** — Real-time duels with WebSocket
- **Chatbot** — AI assistant (Groq) via Netlify serverless
- **Auth** — Supabase auth; DSA login/register
- **Code execution** — Backend run for DSA test cases

---

## Tech Stack

| Layer      | Stack |
|-----------|--------|
| Frontend  | React 18, TypeScript, Vite 7, React Router, TanStack Query, Tailwind CSS, Radix UI (shadcn) |
| Backend   | Node 20+, Express 5, Groq SDK, PostgreSQL (optional), WebSocket |
| Hosting   | Netlify (frontend + serverless), Supabase (auth/data) |

---

## Prerequisites

- **Node.js** ≥ 20.19  
- **npm** ≥ 9  
- (Optional) PostgreSQL for local DSA data  
- (Optional) [.nvmrc](.nvmrc) — use `nvm use` in the project root

---

## Quick Start

```bash
# Clone and install
git clone <repo-url>
cd techmaster-nexus-main-main
npm install

# Copy env and set variables (see below)
cp .env.example .env

# Run frontend + backend together
npm run dev
```

- **Frontend:** http://localhost:5173  
- **Backend API:** http://localhost:3001 (when using `npm run dev`)

---

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Runs backend + Vite (concurrent) |
| `npm run dev:frontend` | Vite only |
| `npm run dev:backend` | Express server only |
| `npm run build` | Production Vite build → `dist/` |
| `npm run preview` | Preview production build |
| `npm run server` | Start Express server (e.g. after build) |
| `npm run deploy` | Build + Netlify production deploy |
| `npm run deploy:preview` | Build + Netlify preview deploy |
| `npm run db:init` | Initialize DB (backend) |
| `npm run db:seed` | Seed data |
| `npm run db:setup` | init + seed |
| `npm run lint` | ESLint |
| `npm run test` | Vitest |

---

## Environment Variables

Copy [.env.example](.env.example) to `.env` and fill in:

| Variable | Purpose |
|----------|---------|
| `GROQ_API_KEY` | Groq AI (chatbot, DSA AI helper) |
| `VITE_API_URL` | Backend API base URL (e.g. `http://localhost:3001`) |
| `DATABASE_URL` | PostgreSQL connection (DSA, local backend) |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role (server-side) |
| `PORT` | Backend port (default 3001) |
| `MAX_TOKENS_PER_REQUEST` | Chat max tokens |
| `RATE_LIMIT_REQUESTS_PER_MINUTE` | Chat rate limit |
| `CONVERSATION_HISTORY_LIMIT` | Chat history length |

`VITE_*` vars are exposed to the frontend; keep secrets only in non-`VITE_` vars.

---

## Project Structure

```
├── src/                    # Frontend (React + Vite)
│   ├── App.tsx             # Routes, layout wiring
│   ├── layouts/            # DsaLayout, TypeForgeLayout
│   ├── pages/              # Index, DSA, typeforge, Login, etc.
│   ├── components/        # UI, dsa/, typeforge/
│   ├── contexts/           # Theme, DSA auth, filters
│   ├── features/dsa/       # DSA API, auth, duels, profile
│   ├── data/               # Typing snippets, passages, DSA test cases
│   ├── hooks/              # useWebSocket, useTimerStopwatch, etc.
│   └── lib/                # supabase, utils
├── backend/                # Express API, DB, routes (dsa, dsaAi, execute)
├── netlify/                # Netlify serverless (e.g. chat)
├── supabase/               # Migrations, config
├── server.js               # Local Express server (dev)
├── netlify.toml            # Netlify config, redirects
└── package.json
```

---

## Deployment (Netlify)

- **Production:** Frontend is built with `vite build`; Netlify serves `dist/` and runs serverless functions (e.g. chat).
- **Local Netlify:** `npm run dev:netlify` or `netlify dev` to test with Netlify functions.
- **Backend:** For full local backend (DSA API, code execution, duels), use `npm run dev` (Express on `PORT`).

---

## License

Private / unlicensed unless stated otherwise.
