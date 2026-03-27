# Spec: Phase 1 — Scaffolding

## Purpose
Establish the project skeleton so all subsequent phases have a consistent foundation to build on.

## Deliverables

### Repository
- Single git repo at `/future-email-sender`
- `.gitignore` excludes: `node_modules/`, `dist/`, `.next/`, `.env`, `.env.local`, `*.js.map`

### Environment Config
`.env.example`:
```
# Backend
DATABASE_URL=postgresql://localhost:5432/future_email_sender
ENCRYPTION_KEY=                  # 64-char hex — generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
RESEND_API_KEY=
RESEND_WEBHOOK_SECRET=
FROM_EMAIL=no-reply@yourdomain.com
APP_URL=http://localhost:3000
PORT=3001
MAIL_PROVIDER=resend
CORS_ORIGIN=http://localhost:3000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Backend (`/backend`)
- `package.json` with all runtime and dev dependencies
- `tsconfig.json`:
  ```json
  {
    "compilerOptions": {
      "target": "ES2022",
      "module": "commonjs",
      "lib": ["ES2022"],
      "outDir": "./dist",
      "rootDir": "./src",
      "strict": true,
      "esModuleInterop": true,
      "skipLibCheck": true,
      "resolveJsonModule": true
    }
  }
  ```
- `nodemon.json`:
  ```json
  {
    "watch": ["src"],
    "ext": "ts",
    "exec": "ts-node src/index.ts"
  }
  ```
- `package.json` scripts:
  ```json
  {
    "dev": "nodemon",
    "build": "tsc",
    "start": "node dist/index.js",
    "migrate": "ts-node src/db/migrate.ts"
  }
  ```

### Frontend (`/frontend`)
- Created via `create-next-app` with: TypeScript, Tailwind, App Router, `src/` directory
- `tailwind.config.ts` — `darkMode: 'class'` set (dark mode always applied via root layout)
- `@tailwindcss/forms` installed for better form input styling

## Directory Structure After Phase 1

```
/
├── .git/
├── .gitignore
├── .env.example
├── CLAUDE.md
├── PRD.md
├── .claude/tasks/
├── specs/
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── nodemon.json
│   └── src/               (empty — populated in Phase 2)
└── frontend/
    ├── package.json
    ├── tsconfig.json
    ├── next.config.ts
    ├── tailwind.config.ts
    └── src/app/
        ├── layout.tsx
        ├── page.tsx
        └── globals.css
```

## Verification
1. `cd backend && npm run dev` → starts without errors (no routes yet, just the process running)
2. `cd frontend && npm run dev` → Next.js dev server at http://localhost:3000
3. Both TypeScript configs compile with `tsc --noEmit` without errors
