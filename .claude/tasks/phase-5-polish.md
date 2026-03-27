# Phase 5 — Polish Tasks

## Goal
Harden the app with proper error handling, rate limiting, security, and a full manual QA pass. At the end of this phase the app is ready for deployment.

---

## Tasks

### 5.1 — Backend Hardening
- [ ] Add `express-rate-limit` to `POST /api/emails` (max 5 requests per IP per 15 minutes)
- [ ] Sanitize rendered content in email templates to prevent XSS (use a simple HTML-encode helper)
- [ ] Add `CORS_ORIGIN` env var and restrict `cors()` to that origin
- [ ] Add request logging middleware (morgan or custom) for debugging
- [ ] Ensure all DB queries use parameterized statements (no string interpolation)
- [ ] Add graceful shutdown: on `SIGTERM`, close DB pool before exiting

### 5.2 — Frontend Polish
- [ ] Add loading skeleton to countdown page (while fetching metadata)
- [ ] Add toast/banner for copy-to-clipboard feedback on success page
- [ ] Ensure all form inputs have proper `autocomplete` attributes
- [ ] Add `<meta>` tags for sharing: og:title, og:description on countdown page
- [ ] Handle 404 and error states gracefully across all pages (no blank screens)
- [ ] Ensure `<DateTimePicker>` works correctly on iOS Safari (datetime-local quirks)

### 5.3 — Responsive QA
- [ ] Test all pages at 320px width (iPhone SE)
- [ ] Test all pages at 768px width (tablet portrait)
- [ ] Test all pages at 1280px width (desktop)
- [ ] Verify tap targets are ≥ 44x44px on mobile
- [ ] Verify no horizontal overflow on any page

### 5.4 — End-to-End Test
- [ ] Full flow: fill form → submit → receive teaser email → open countdown link → wait for delivery → check inbox
- [ ] Test error case: submit with past date → validation error shown
- [ ] Test error case: invalid email format → validation error shown
- [ ] Test 404 case: open `/countdown/invalid-id` → proper error shown

### 5.5 — Environment & Deployment Prep
- [ ] Finalize `.env.example` with all variables and instructions
- [ ] Add `README.md` with setup instructions
- [ ] Verify `npm run build` succeeds in both `backend/` and `frontend/`
- [ ] Verify production build starts correctly

## Acceptance Criteria
- Rate limiting is active on POST /api/emails
- No XSS vectors in email template rendering
- App is fully functional and visually correct on mobile, tablet, and desktop
- All error states are handled — no blank screens
- Production build compiles without errors
