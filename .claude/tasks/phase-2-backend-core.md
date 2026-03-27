# Phase 2 — Backend Core Tasks

## Goal
Build the Express app foundation, database connection, encryption, and mail provider. At the end of this phase the backend server runs, the DB schema exists, and we can encrypt/decrypt content and send a test email.

---

## Tasks

### 2.1 — Express App Bootstrap
- [ ] Create `backend/src/app.ts`:
  - Apply `helmet()`, `cors()`, `express.json()` middleware
  - Mount routes (health, email, webhook)
  - Apply error-handler middleware last
- [ ] Create `backend/src/index.ts`:
  - Import and start Express app
  - Listen on `PORT` from env
- [ ] Create `backend/src/middleware/error-handler.ts`:
  - Catches errors thrown in route handlers
  - Returns `{ error: message }` JSON with appropriate status
- [ ] Create `backend/src/middleware/validate.ts`:
  - Accepts a Zod schema, returns an Express middleware
  - On validation failure, returns 400 with field errors
- [ ] Create `backend/src/routes/health.routes.ts`:
  - `GET /api/health` → `{ status: "ok", timestamp: new Date() }`
- [ ] **Verify:** `GET /api/health` returns 200 OK

### 2.2 — Database Connection + Migration
- [ ] Create `backend/src/config/database.ts`:
  - Export a `pg.Pool` instance from `DATABASE_URL` env var
- [ ] Create `backend/src/db/migrations/001_create_scheduled_emails.ts`:
  - Create `email_status` enum
  - Create `scheduled_emails` table (full schema per PRD)
  - Create index on `resend_email_id`
- [ ] Create `backend/src/db/migrate.ts`:
  - Runs all migration files in order
- [ ] Add `"migrate": "ts-node src/db/migrate.ts"` to `package.json`
- [ ] **Verify:** `npm run migrate` runs cleanly; `\d scheduled_emails` in psql shows correct schema

### 2.3 — Encryption Service
- [ ] Create `backend/src/services/encryption.service.ts`:
  - `encrypt(plaintext: string): { ciphertext: string, iv: string, tag: string }`
    - Uses `crypto.createCipheriv('aes-256-gcm', key, iv)`
    - Generates a fresh 12-byte random IV per call
    - Returns all values as base64 strings
  - `decrypt(ciphertext: string, iv: string, tag: string): string`
    - Uses `crypto.createDecipheriv` + `decipher.setAuthTag()`
  - Key loaded from `ENCRYPTION_KEY` env var (64-char hex → 32-byte buffer)
- [ ] **Verify:** encrypt(`"hello world"`) → decrypt result → `"hello world"` ✓

### 2.4 — Mail Provider + Templates
- [ ] Create `backend/src/mail/mail.provider.ts`:
  ```ts
  interface SendMailOptions { to, from, subject, html, replyTo?, scheduledAt? }
  interface SendMailResult { success: boolean, messageId?: string, error?: string }
  interface MailProvider { send(opts: SendMailOptions): Promise<SendMailResult> }
  ```
- [ ] Create `backend/src/mail/resend.provider.ts`:
  - Implements `MailProvider` using the `resend` npm package
  - Maps `scheduledAt` → Resend's `scheduledAt` parameter
  - Returns `messageId` from Resend response
- [ ] Create `backend/src/mail/mail.factory.ts`:
  - Reads `MAIL_PROVIDER` env var (default: `"resend"`)
  - Returns correct provider instance
- [ ] Create `backend/src/mail/templates/teaser.ts`:
  - Function: `teaserTemplate({ senderName, countdownUrl, scheduledAt }): string`
  - Dark gradient header, envelope icon, "Something special is on its way..." headline
  - Sender name callout, formatted scheduled date
  - Pill CTA button (indigo→violet gradient) linking to countdown URL
  - All inline CSS
- [ ] Create `backend/src/mail/templates/scheduled.ts`:
  - Function: `scheduledTemplate({ senderName, subject, body }): string`
  - Gradient header, "Your message has arrived" headline
  - Sender name, subject in large text, body in clean card
  - All inline CSS
- [ ] **Verify:** Send a test email via Resend to a real address; check it looks correct

## Acceptance Criteria
- `GET /api/health` returns 200
- DB migration runs without errors
- Encrypt→decrypt round-trip works
- Test email arrives and displays correctly
