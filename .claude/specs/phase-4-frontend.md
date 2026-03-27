# Spec: Phase 4 — Frontend

## Purpose
Build all frontend pages and components. The UI is dark-mode first, minimal, professional, and fully responsive.

## Design System

| Token | Value | Usage |
|---|---|---|
| `bg-gray-950` | `#030712` | Page background |
| `bg-gray-900` | `#111827` | Card background |
| `bg-gray-800` | `#1f2937` | Input background |
| `text-gray-100` | `#f3f4f6` | Primary text |
| `text-gray-400` | `#9ca3af` | Secondary/muted text |
| `indigo-500` | `#6366f1` | Accent, buttons, focus rings |
| `indigo-600` | `#4f46e5` | Button hover |
| `violet-500` | `#8b5cf6` | Gradient end for CTAs |

**Typography:** Inter (via `next/font/google`), weights 400/500/600/700

**Border radius:** `rounded-xl` for cards, `rounded-lg` for inputs, `rounded-full` for pill buttons

**Spacing unit:** Tailwind default (4px base)

---

## Pages & Components

### Root Layout (`src/app/layout.tsx`)
```tsx
<html lang="en" className="dark">
  <body className="bg-gray-950 text-gray-100 min-h-screen flex flex-col font-sans antialiased">
    <Header />
    <main className="flex-1">{children}</main>
    <Footer />
  </body>
</html>
```

### Header (`src/components/Header.tsx`)
```
┌─────────────────────────────────────────────┐
│  ✉ Future Email                             │
└─────────────────────────────────────────────┘
```
- `bg-gray-900 border-b border-gray-800`
- Logo: envelope emoji + "Future Email" in `text-gray-100 font-semibold`
- Height: 56px, horizontally padded, max-width container

### Footer (`src/components/Footer.tsx`)
- `text-gray-500 text-sm text-center py-6`
- Text: "© 2026 Future Email Sender"

---

### Home Page — Compose Form (`src/app/page.tsx`)

```
┌─────────────────────────────────────────────┐
│  Send a message to the future               │
│  ─────────────────────────────              │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  Your Name                         │    │
│  │  [_________________________________]│    │
│  │                                    │    │
│  │  Your Email                        │    │
│  │  [_________________________________]│    │
│  │                                    │    │
│  │  Recipient Email                   │    │
│  │  [_________________________________]│    │
│  │                                    │    │
│  │  Subject                           │    │
│  │  [_________________________________]│    │
│  │                                    │    │
│  │  Message                           │    │
│  │  [                                ]│    │
│  │  [_________________________________]│    │
│  │                                    │    │
│  │  Send on                           │    │
│  │  [_________________________________]│    │
│  │                                    │    │
│  │       [ Schedule Email → ]         │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

**Card:** `bg-gray-900 rounded-2xl p-6 sm:p-10 w-full max-w-xl shadow-2xl`

**Inputs:** `bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full px-4 py-3`

**Error text:** `text-red-400 text-sm mt-1`

**Submit button:** `bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-full px-8 py-3 w-full transition-colors disabled:opacity-50`

**Loading state:** button shows spinner + "Scheduling…" text

---

### Success Page (`src/app/success/page.tsx`)

```
┌─────────────────────────────────────────────┐
│                                             │
│              ✅                              │
│   Your email has been scheduled!            │
│   It will be delivered on                  │
│   April 15, 2026 at 2:00 PM               │
│                                             │
│   Share the countdown link:                 │
│  ┌──────────────────────────┐ [Copy]       │
│  │ http://…/countdown/uuid  │              │
│  └──────────────────────────┘              │
│                                             │
│        [ Schedule another →  ]             │
│                                             │
└─────────────────────────────────────────────┘
```

- Centered card, same styling as compose form card
- Date formatted with `Intl.DateTimeFormat` in user's local timezone
- Copy button: changes to "Copied! ✓" for 2 seconds, then resets

---

### Countdown Page (`src/app/countdown/[id]/page.tsx`)

**Before expiry:**
```
┌─────────────────────────────────────────────┐
│                                             │
│   📬                                        │
│   Orkan has sent you                        │
│   a future message                          │
│                                             │
│   ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐     │
│   │  02  │ │  14  │ │  37  │ │  08  │     │
│   │ days │ │ hrs  │ │ min  │ │ sec  │     │
│   └──────┘ └──────┘ └──────┘ └──────┘     │
│                                             │
│   Check your email at the scheduled time.  │
│                                             │
└─────────────────────────────────────────────┘
```

Countdown boxes: `bg-gray-900 rounded-xl p-4 text-center min-w-[72px]`
Number: `text-5xl font-bold text-indigo-400`
Label: `text-xs text-gray-500 uppercase mt-1`

**After expiry:**
```
┌─────────────────────────────────────────────┐
│                                             │
│              ✉️                              │
│   The email has been sent!                  │
│   Check your inbox — it should have         │
│   arrived by now.                           │
│                                             │
└─────────────────────────────────────────────┘
```

---

### `CountdownTimer` Component

```ts
interface Props {
  targetDate: Date;
  onExpire: () => void;
}
```

- On mount: start `setInterval(tick, 1000)`
- `tick`: compute `timeLeft = targetDate - now`; if ≤ 0, call `onExpire()` and clear interval
- Derived values: `days`, `hours`, `minutes`, `seconds` from `timeLeft`
- Cleanup: `clearInterval` on unmount

---

### `DateTimePicker` Component

```ts
interface Props {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}
```

- `<input type="datetime-local">`
- `min` attribute: computed as now + 5 minutes (updated on focus to stay fresh)
- Styling matches other inputs in the form
- iOS Safari note: `datetime-local` is supported in iOS 7+ but styling may need explicit height

---

## API Client (`src/lib/api.ts`)

```ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function scheduleEmail(payload: CreateEmailPayload): Promise<ScheduleEmailResponse>
export async function getEmail(id: string): Promise<EmailMetadata>
```

Both functions throw on non-2xx responses with a message extracted from `{ error }` response body.

---

## TypeScript Types (`src/types/index.ts`)

```ts
interface CreateEmailPayload {
  senderName: string;
  senderEmail: string;
  recipientEmail: string;
  subject: string;
  body: string;
  scheduledAt: string;
}

interface ScheduleEmailResponse {
  id: string;
  countdownUrl: string;
  scheduledAt: string;
}

interface EmailMetadata {
  id: string;
  senderName: string;
  scheduledAt: string;
  status: 'pending' | 'scheduled' | 'delivered' | 'failed';
  expired: boolean;
}
```

## Verification Checklist
- [ ] Dark mode renders correctly, no white flash on load
- [ ] Form: all 6 fields present, validation errors shown inline, loading state on submit
- [ ] Form: successful submit redirects to `/success?id=...`
- [ ] Success page: displays countdown URL, copy button works
- [ ] Countdown page: timer ticks every second
- [ ] Countdown page: switches to expired state when timer hits zero
- [ ] Responsive at 320px, 768px, 1280px — no horizontal overflow
