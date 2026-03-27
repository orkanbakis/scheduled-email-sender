# Spec: Phase 3 — Backend API + Email

## Purpose
Implement the three API endpoints and wire together all Phase 2 services into a working backend. At the end of this phase the full email scheduling flow works end-to-end.

## Deliverables

### POST /api/emails

**Zod schema:**
```ts
const createEmailSchema = z.object({
  senderName:     z.string().min(1).max(255),
  senderEmail:    z.string().email(),
  recipientEmail: z.string().email(),
  subject:        z.string().min(1).max(255),
  body:           z.string().min(1).max(10000),
  scheduledAt:    z.string().datetime()
                   .refine(v => new Date(v) > addMinutes(new Date(), 5), {
                     message: 'Must be at least 5 minutes in the future'
                   })
});
```

**Response (201):**
```json
{
  "id": "uuid",
  "countdownUrl": "http://localhost:3000/countdown/uuid",
  "scheduledAt": "2026-04-15T14:00:00.000Z"
}
```

**`scheduleEmail()` service method — full flow:**
```
1. Encrypt JSON.stringify({ subject, body }) → { ciphertext, iv, tag }
2. INSERT into scheduled_emails (status: 'pending') → get id
3. Build countdownUrl = APP_URL + '/countdown/' + id
4. Send teaser email immediately:
   mailProvider.send({
     to: recipientEmail,
     from: FROM_EMAIL,
     subject: `${senderName} has a future message for you`,
     html: teaserTemplate({ senderName, countdownUrl, scheduledAt })
   })
5. Schedule actual email:
   mailProvider.send({
     to: recipientEmail,
     from: FROM_EMAIL,
     subject: subject,           ← plaintext here for Resend header
     html: scheduledTemplate({ senderName, subject, body }),
     scheduledAt: scheduledAt    ← ISO string → Resend defers delivery
   })
6. UPDATE scheduled_emails SET
     resend_email_id = result.messageId,
     status = 'scheduled',
     scheduled_at_resend = NOW()
   WHERE id = id
7. Return { id, countdownUrl, scheduledAt }
```

**Error handling:**
- Teaser email fails → rollback is not needed, but log the error and still try scheduling
- Resend scheduling fails → update status to `failed`, return 500

### GET /api/emails/:id

**Response (200):**
```json
{
  "id": "uuid",
  "senderName": "Orkan",
  "scheduledAt": "2026-04-15T14:00:00.000Z",
  "status": "scheduled",
  "expired": false
}
```

**Logic:**
```ts
const row = await db.query('SELECT * FROM scheduled_emails WHERE id = $1', [id]);
if (!row) throw { statusCode: 404, message: 'Not found' };
return {
  id: row.id,
  senderName: row.sender_name,
  scheduledAt: row.scheduled_at,
  status: row.status,
  expired: new Date() >= new Date(row.scheduled_at)
};
```

- **Never** query, decrypt, or return `encrypted_content`, `encryption_iv`, `encryption_tag`.

### POST /api/webhooks/resend

**Svix verification:**
```ts
import { Webhook } from 'svix';

const wh = new Webhook(process.env.RESEND_WEBHOOK_SECRET!);
const payload = wh.verify(rawBody, {
  'svix-id': req.headers['svix-id'],
  'svix-timestamp': req.headers['svix-timestamp'],
  'svix-signature': req.headers['svix-signature']
});
```

**Event handling:**
```ts
switch (payload.type) {
  case 'email.delivered':
    await db.query(
      `UPDATE scheduled_emails SET status='delivered', delivered_at=NOW()
       WHERE resend_email_id=$1`,
      [payload.data.email_id]
    );
    break;
  case 'email.bounced':
    await db.query(
      `UPDATE scheduled_emails SET status='failed', failure_reason=$2
       WHERE resend_email_id=$1`,
      [payload.data.email_id, payload.data.reason ?? 'Bounced']
    );
    break;
}
res.status(200).json({ received: true });
```

**Important:** This route must receive the **raw request body** (not parsed JSON) for signature verification to work. Mount it before `express.json()` middleware and use `express.raw({ type: 'application/json' })` on this route specifically.

## Verification Checklist
- [ ] POST with valid body → 201, DB row exists, teaser email arrives in inbox
- [ ] POST with `scheduledAt` 1 min in future → 400 validation error
- [ ] POST with invalid email → 400 validation error
- [ ] GET valid id before scheduled time → `{ expired: false }`
- [ ] GET invalid id → 404
- [ ] Resend webhook test (delivered) → DB row status changes to `delivered`
- [ ] Resend webhook with wrong signature → 400
