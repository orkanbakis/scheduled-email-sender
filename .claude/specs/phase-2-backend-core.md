# Spec: Phase 2 — Backend Core

## Purpose
Build the Express server foundation, database schema, encryption service, and mail provider abstraction. This phase produces no user-facing features but establishes all infrastructure that Phase 3 depends on.

## Deliverables

### 2.1 Express App

**`src/index.ts`**
```ts
import app from './app';
import { config } from './config';

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
```

**`src/app.ts`**
```ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/error-handler';
import emailRoutes from './routes/email.routes';
import webhookRoutes from './routes/webhook.routes';  // mounted BEFORE json()
import healthRoutes from './routes/health.routes';

const app = express();

// Webhook route must use raw body for signature verification
app.use('/api/webhooks', webhookRoutes);

// All other routes use JSON body
app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

app.use('/api/health', healthRoutes);
app.use('/api/emails', emailRoutes);

app.use(errorHandler);

export default app;
```

**`src/middleware/error-handler.ts`**
```ts
// Express error handler signature: (err, req, res, next)
// Returns: { error: string, details?: unknown }
// Status: err.statusCode or 500
```

**`src/middleware/validate.ts`**
```ts
// Returns Express middleware that calls schema.parse(req.body)
// On ZodError: 400 with { error: "Validation failed", details: err.flatten() }
```

### 2.2 Database Schema

Migration file: `src/db/migrations/001_create_scheduled_emails.ts`

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE email_status AS ENUM ('pending', 'scheduled', 'delivered', 'failed');

CREATE TABLE scheduled_emails (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_name           VARCHAR(255) NOT NULL,
    sender_email          VARCHAR(255) NOT NULL,
    recipient_email       VARCHAR(255) NOT NULL,
    encrypted_content     TEXT NOT NULL,
    encryption_iv         TEXT NOT NULL,
    encryption_tag        TEXT NOT NULL,
    scheduled_at          TIMESTAMPTZ NOT NULL,
    resend_email_id       VARCHAR(255),
    status                email_status NOT NULL DEFAULT 'pending',
    scheduled_at_resend   TIMESTAMPTZ,
    delivered_at          TIMESTAMPTZ,
    failure_reason        TEXT,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_scheduled_emails_resend_id
    ON scheduled_emails (resend_email_id);
```

### 2.3 Encryption Service

**`src/services/encryption.service.ts`**

- Algorithm: `aes-256-gcm`
- Key: `Buffer.from(process.env.ENCRYPTION_KEY!, 'hex')` — must be exactly 32 bytes
- IV: `crypto.randomBytes(12)` — fresh per encrypt call
- Auth tag: 16 bytes (default GCM tag length)
- Stored values: all base64-encoded strings

```ts
interface EncryptResult {
  ciphertext: string;  // base64
  iv: string;          // base64
  tag: string;         // base64
}

function encrypt(plaintext: string): EncryptResult
function decrypt(ciphertext: string, iv: string, tag: string): string
```

What gets encrypted: `JSON.stringify({ subject, body })` — a single JSON payload.

### 2.4 Mail Provider

**Interface** (`src/mail/mail.provider.ts`):
```ts
interface SendMailOptions {
  to: string;
  from: string;
  subject: string;
  html: string;
  replyTo?: string;
  scheduledAt?: string;  // ISO 8601 — passed to Resend for scheduled sends
}

interface SendMailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface MailProvider {
  send(options: SendMailOptions): Promise<SendMailResult>;
}
```

**Resend Provider** (`src/mail/resend.provider.ts`):
- Uses `new Resend(apiKey)` and calls `resend.emails.send()`
- Maps `scheduledAt` to Resend's `scheduledAt` option
- On success: `{ success: true, messageId: data.id }`
- On error: `{ success: false, error: error.message }`

**Factory** (`src/mail/mail.factory.ts`):
```ts
export function createMailProvider(): MailProvider {
  switch (process.env.MAIL_PROVIDER ?? 'resend') {
    case 'resend': return new ResendMailProvider(process.env.RESEND_API_KEY!);
    default: throw new Error('Unknown mail provider');
  }
}
```

**Template specs:**

`templates/teaser.ts` — `teaserTemplate({ senderName, countdownUrl, scheduledAt })`:
- Background: `#0f0f1a` (near black)
- Header band: gradient `#4f46e5` → `#7c3aed` (indigo → violet), 200px height
- Large envelope emoji or icon centered in header
- Headline: "📬 Something special is on its way…" — white, 28px bold
- Body: white card `#1a1a2e`, rounded corners, padding 40px
- Text: "*[senderName]* has sent you a future message"
- Scheduled date in an indigo pill badge
- CTA button: gradient pill, "See the countdown →", links to `countdownUrl`
- Footer: subtle gray, app name

`templates/scheduled.ts` — `scheduledTemplate({ senderName, subject, body })`:
- Same dark background
- Header band with "✉️ Your message has arrived"
- White card with sender name, subject in large bold, body text in readable gray card
- Footer branding

Both templates: all styles inline, no external resources, max-width 600px, centered.

## Verification Checklist
- [ ] `GET /api/health` → `200 { status: "ok" }`
- [ ] `npm run migrate` → no errors, table visible in psql
- [ ] `encrypt("test") → decrypt(...)` → `"test"`
- [ ] Manual test email sent via Resend → arrives with correct styling
