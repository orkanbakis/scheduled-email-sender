# Phase 4 — Frontend Tasks

## Goal
Build the Next.js frontend: app shell, compose form, success page, and countdown page. At the end of this phase the full user flow works from form submission to countdown display.

---

## Tasks

### 4.1 — App Shell
- [ ] Update `frontend/src/app/layout.tsx`:
  - Apply Inter font via `next/font/google`
  - Set `<html className="dark">` (always dark mode)
  - Set background: `bg-gray-950 text-gray-100 min-h-screen`
  - Render `<Header>` and `<Footer>` around `{children}`
- [ ] Update `frontend/src/app/globals.css`:
  - Tailwind directives
  - Base styles: remove default margins, set `box-sizing: border-box`
- [ ] Create `frontend/src/components/Header.tsx`:
  - App name ("Future Email") in small, clean typography
  - Minimal — no navigation links
- [ ] Create `frontend/src/components/Footer.tsx`:
  - Single line: "© 2026 Future Email Sender"
  - Subtle gray text
- [ ] **Verify:** Blank page loads at localhost:3000 in dark mode with header/footer

### 4.2 — Email Compose Form
- [ ] Create `frontend/src/lib/api.ts`:
  - `scheduleEmail(payload): Promise<{ id, countdownUrl, scheduledAt }>` — POST to backend
  - `getEmail(id): Promise<EmailMetadata>` — GET from backend
  - Uses `NEXT_PUBLIC_API_URL` env var as base URL
- [ ] Create `frontend/src/components/DateTimePicker.tsx`:
  - Wraps `<input type="datetime-local">`
  - Sets `min` to now + 5 minutes (recalculated on focus)
  - Applies dark-mode-compatible Tailwind styling
- [ ] Create `frontend/src/components/EmailForm.tsx`:
  - Controlled form with state for all fields
  - Fields: Sender Name, Sender Email, Recipient Email, Subject, Body (textarea), Scheduled Date/Time
  - Client-side validation before submit (all required, email format, min scheduled time)
  - Shows inline error messages per field
  - Loading spinner on submit button while request is in flight
  - On success: calls `router.push('/success?id=...')`
  - On API error: shows error banner
- [ ] Update `frontend/src/app/page.tsx`:
  - Centered layout: `flex flex-col items-center justify-center min-h-screen px-4`
  - Card wrapping `<EmailForm />`: `bg-gray-900 rounded-2xl p-6 md:p-10 w-full max-w-xl shadow-xl`
  - Heading above card: "Send a message to the future"
- [ ] **Verify:** Form submits, redirects to /success, teaser email arrives in inbox

### 4.3 — Success Page
- [ ] Create `frontend/src/app/success/page.tsx`:
  - Reads `id` from search params (`useSearchParams()`)
  - Fetches `GET /api/emails/:id` to get `scheduledAt`
  - Shows: checkmark icon, "Your email has been scheduled!", formatted date/time
  - Shows countdown URL in a copyable input (with copy button that changes to "Copied!")
  - Button: "Schedule another email" → links to `/`
- [ ] **Verify:** Page renders after form submission with correct data

### 4.4 — Countdown Page
- [ ] Create `frontend/src/components/CountdownTimer.tsx`:
  - Props: `targetDate: Date`, `onExpire: () => void`
  - Uses `useEffect` + `setInterval(1000)` to count down
  - Displays: `DD days HH:MM:SS` with each unit in its own styled box
  - Calls `onExpire()` when `timeLeft <= 0`
  - Cleans up interval on unmount
- [ ] Create `frontend/src/components/ExpiredMessage.tsx`:
  - Shows envelope icon + "The email has been sent!"
  - Subtitle: "Check your inbox — it should have arrived by now"
  - Subtle indigo accent styling
- [ ] Create `frontend/src/app/countdown/[id]/page.tsx`:
  - Fetches `GET /api/emails/:id` on mount
  - Loading state: subtle spinner
  - Error/not-found state: "This countdown link is invalid or expired"
  - If `expired: false`: show sender name, `<CountdownTimer targetDate={scheduledAt} onExpire={handleExpire} />`
  - If `expired: true` or after `onExpire` fires: show `<ExpiredMessage />`
  - `handleExpire`: re-fetches to confirm, sets local `expired` state
- [ ] **Verify:** Countdown ticks live; switching to expired state works correctly

## Acceptance Criteria
- App loads in dark mode on all pages
- Form validates and submits correctly; loading/error states work
- Success page shows countdown URL correctly with working copy button
- Countdown page ticks in real-time and switches to expired message at zero
- All pages are responsive on mobile (320px), tablet (768px), and desktop
