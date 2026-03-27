# Spec: Phase 5 — Polish

## Purpose
Harden the app for production readiness: security, rate limiting, error handling edge cases, and a final QA pass.

## Backend Additions

### Rate Limiting (`express-rate-limit`)
```ts
import rateLimit from 'express-rate-limit';

const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,                      // max 5 requests per IP per window
  message: { error: 'Too many requests — try again in 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false
});

// Applied only to POST /api/emails
router.post('/', emailLimiter, validate(createEmailSchema), createEmail);
```

### CORS Hardening
```ts
cors({
  origin: process.env.CORS_ORIGIN,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
})
```

### XSS Prevention in Email Templates
- `senderName`, `subject`, `body` must be HTML-encoded before being interpolated into template strings
- Helper: `htmlEncode(str)` — replaces `&`, `<`, `>`, `"`, `'` with HTML entities
- Applied to all user-supplied values in both templates

### Logging
```ts
import morgan from 'morgan';
app.use(morgan('combined'));
```

### Graceful Shutdown
```ts
process.on('SIGTERM', async () => {
  await pool.end();
  process.exit(0);
});
```

## Frontend Additions

### Loading Skeleton (Countdown Page)
- While `getEmail()` is fetching: show a pulsing skeleton of the countdown layout
- Use Tailwind's `animate-pulse` on placeholder boxes

### Meta Tags (Countdown Page)
```tsx
<Head>
  <title>A message is on its way…</title>
  <meta property="og:title" content="Someone sent you a future message" />
  <meta property="og:description" content={`Arriving on ${formattedDate}`} />
</Head>
```

### Error Boundaries
- 404 state: `"This countdown link is invalid or has expired."`
- Network error state: `"Unable to load — please refresh."`
- No blank/white screens under any circumstance

### Form UX
- Autofocus on first field on desktop
- `autocomplete` attributes:
  - Sender name: `autocomplete="name"`
  - Sender email: `autocomplete="email"`
  - Recipient email: `autocomplete="off"`
- `spellCheck={false}` on email inputs

## Responsive QA Matrix

| Page | 320px | 768px | 1280px |
|---|---|---|---|
| Home (form) | Single column, full-width inputs | Centered card, max-width | Centered card, same |
| Success | Centered, URL wraps gracefully | Same | Same |
| Countdown | Timer boxes stack 2x2 if needed | 4 in a row | 4 in a row |

**Tap target minimum:** All buttons and interactive elements ≥ 44px height.

## End-to-End Test Scenarios

| Scenario | Expected |
|---|---|
| Valid form submission | Teaser email arrives; success page shows countdown URL |
| Open countdown link | Timer counts down in real time |
| Schedule < 5 min in future | Form shows inline validation error |
| Invalid email address | Form shows inline validation error |
| Open `/countdown/bad-id` | Error message shown, no crash |
| Resend delivers email | Countdown page shows "sent" message |
| 6th POST from same IP in 15 min | 429 Too Many Requests |
| Webhook with bad signature | 400 rejected |

## Production Build Verification
- `cd backend && npm run build` — no TypeScript errors
- `cd frontend && npm run build` — no TypeScript errors, no missing env vars
- Both start correctly with `npm start`
