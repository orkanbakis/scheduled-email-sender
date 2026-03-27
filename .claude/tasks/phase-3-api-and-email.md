# Phase 3 — Backend API + Email Tasks

## Goal
Implement the full API: schedule an email, retrieve countdown metadata, and handle Resend delivery webhooks. At the end of this phase the full backend flow works end-to-end.

---

## Tasks

### 3.1 — POST /api/emails
- [ ] Create `backend/src/services/email.service.ts` — `scheduleEmail()`:
  1. Validate `scheduledAt` is ≥ 5 minutes from now (throw 400 if not)
  2. Encrypt `JSON.stringify({ subject, body })` → `{ ciphertext, iv, tag }`
  3. Insert row into `scheduled_emails` (status: `pending`)
  4. Send teaser email immediately via mail provider
  5. Schedule actual email via `mailProvider.send({ ..., scheduledAt })`
  6. Store `resend_email_id` from response, update status to `scheduled`
  7. Return `{ id, countdownUrl, scheduledAt }`
- [ ] Create `backend/src/controllers/email.controller.ts` — `createEmail` handler:
  - Parse + validate body with zod schema
  - Call `emailService.scheduleEmail()`
  - Return 201 with result
- [ ] Create `backend/src/routes/email.routes.ts`:
  - `POST /api/emails` → `createEmail`
  - `GET /api/emails/:id` → `getEmail`
- [ ] **Verify:** POST with valid body → DB row inserted, teaser email received in inbox

### 3.2 — GET /api/emails/:id
- [ ] Add `getEmail(id: string)` to `email.service.ts`:
  - SELECT row by id
  - Return `{ id, senderName, scheduledAt, status, expired: Date.now() >= scheduledAt }`
  - Throw 404 if not found
  - Never return encrypted content
- [ ] Add `getEmail` handler to controller
- [ ] **Verify:** GET before scheduled time → `expired: false`; GET after → `expired: true`

### 3.3 — POST /api/webhooks/resend
- [ ] Create `backend/src/routes/webhook.routes.ts`:
  - `POST /api/webhooks/resend` (raw body, no JSON middleware — needed for signature verification)
- [ ] Create `backend/src/controllers/webhook.controller.ts`:
  - Verify Resend webhook signature using `svix` Webhook class + `RESEND_WEBHOOK_SECRET`
  - On `email.delivered`:
    - Find row by `resend_email_id`
    - Update `status = 'delivered'`, `delivered_at = NOW()`
  - On `email.bounced`:
    - Update `status = 'failed'`, `failure_reason = event.reason`
  - Return 200 on success
- [ ] Mount webhook route in `app.ts` **before** `express.json()` (needs raw body)
- [ ] **Verify:** Use Resend dashboard webhook tester → DB row updates correctly

## Acceptance Criteria
- POST creates a DB row, sends teaser email, schedules actual email with Resend
- GET returns correct metadata and `expired` flag
- Webhook updates DB status on delivery/bounce events
- No email content is ever returned from any endpoint
