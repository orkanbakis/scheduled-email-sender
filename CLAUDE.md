# Future Email Sender

A web app that lets users compose and schedule emails for future delivery. A teaser email is sent immediately to the recipient with a countdown link. The actual email is delivered at the scheduled time via Resend's native scheduling API.

## Stack

- **Frontend:** Next.js (App Router), Tailwind CSS, TypeScript
- **Backend:** Node.js + Express, TypeScript
- **Database:** PostgreSQL
- **Email:** Resend (native scheduled sending)
- **Encryption:** AES-256-GCM for email content at rest

## Project Layout

```
/
├── backend/     Express API server
├── frontend/    Next.js app
├── specs/       Phase-by-phase technical specs
└── .claude/tasks/  Development task checklists
```

## Running Locally

### Prerequisites
- Node.js 20+
- PostgreSQL running locally
- Resend account + API key

### Backend
```bash
cd backend
cp ../.env.example .env   # fill in values
npm install
npm run migrate
npm run dev               # starts on :3001
```

### Frontend
```bash
cd frontend
cp ../.env.example .env.local  # fill in NEXT_PUBLIC_API_URL
npm install
npm run dev               # starts on :3000
```

## Environment Variables

See `.env.example` for all required variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `ENCRYPTION_KEY` | 64-char hex string (AES-256 key) — generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `RESEND_API_KEY` | Resend API key |
| `RESEND_WEBHOOK_SECRET` | Resend webhook signing secret (from Resend dashboard) |
| `FROM_EMAIL` | Verified sender email address in Resend |
| `APP_URL` | Public URL of the frontend (used in email links) |
| `PORT` | Backend port (default: 3001) |

## Key Conventions

- All API routes are prefixed `/api/`
- Email content (subject + body) is always stored encrypted; never returned from the API
- The countdown page never shows email content — it only shows a timer and an expiry message
- Resend handles delivery timing via its native `scheduledAt` parameter — no cron job
- Status flow: `pending` → `scheduled` → `delivered` | `failed`

## Architecture Notes

- `backend/src/mail/` contains a provider pattern — `MailProvider` interface + `ResendMailProvider`. New providers (SendGrid, etc.) can be swapped in via the `MAIL_PROVIDER` env var without changing business logic.
- Encryption key lives only in the environment; no KMS for now. Rotate by re-encrypting all rows.
- The Resend webhook endpoint (`POST /api/webhooks/resend`) uses Svix signature verification.
