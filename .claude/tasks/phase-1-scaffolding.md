# Phase 1 — Scaffolding Tasks

## Goal
Set up the full project skeleton: git repo, backend boilerplate, frontend boilerplate, and environment config. At the end of this phase the project structure exists and both dev servers start cleanly.

---

## Tasks

- [x] **1.1** Create `.gitignore` (node_modules, .env, .env.local, dist, .next)
- [x] **1.2** Create `.env.example` with all required variables documented
- [x] **1.3** Initialize `/backend`:
  - `npm init -y`
  - Install deps: `express cors helmet zod pg resend svix dotenv`
  - Install dev deps: `typescript ts-node nodemon @types/express @types/cors @types/node @types/pg`
  - Create `tsconfig.json` (target ES2022, module commonjs, strict)
  - Create `nodemon.json` for ts-node hot reload
  - Add `dev`, `build`, `start`, `migrate` scripts to `package.json`
- [x] **1.4** Initialize `/frontend`:
  - `npx create-next-app@latest frontend --typescript --tailwind --app --src-dir --import-alias "@/*"`
  - Verify Tailwind is configured
  - Set `darkMode: 'class'` via `@variant dark` in globals.css (Tailwind v4, no config file)
  - Install `@tailwindcss/forms`
- [x] **1.5** Verify both servers start:
  - `cd backend && npm run dev` → no errors
  - `cd frontend && npm run dev` → Next.js loads at localhost:3000

## Acceptance Criteria
- Both `npm run dev` commands start without errors
- `.env.example` documents every env var used in the project
- TypeScript compiles without errors in both projects
 