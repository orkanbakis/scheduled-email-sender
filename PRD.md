# Product Requirements Document — Future Email Sender

## 1. Overview

**Future Email Sender** is a web application that lets users write an email today and schedule it to be delivered at a future date and time. When a message is scheduled, the recipient immediately receives a teaser email with a link to a countdown page — building anticipation before the real message arrives.

## 2. Problem Statement

People often want to send a message at a specific moment in the future (birthday, anniversary, after an event) but forget or are unavailable when the time comes. Existing email clients either lack scheduling UX or don't provide a fun anticipation-building experience for the recipient.

## 3. Goals

- Allow anyone to compose and schedule a future email with no account required
- Give recipients a delightful anticipation experience via a countdown page
- Ensure scheduled email content is private and secure (encrypted at rest)
- Keep the product simple and focused — no attachments, no account management in v1

## 4. Non-Goals (v1)

- User accounts / authentication
- Email attachments
- Multiple recipients (CC/BCC)
- Cancelling or editing a scheduled email after submission
- Email open/click tracking

## 5. User Stories

### Sender
- **US-01:** As a sender, I want to fill out a simple form with my name, my email, the recipient's email, the email subject, the body text, and a scheduled date/time, so that I can easily schedule a future email.
- **US-02:** As a sender, I want to receive confirmation that my email has been scheduled, along with a shareable countdown link, so I know it worked and can share the link with the recipient.
- **US-03:** As a sender, I want my email content to be stored securely, so that it cannot be read by anyone before it is delivered.

### Recipient
- **US-04:** As a recipient, I want to receive a teaser email immediately after a sender schedules a message for me, so I know something is coming.
- **US-05:** As a recipient, I want to see a countdown page showing when the email will arrive and who it's from, so I can look forward to it.
- **US-06:** As a recipient, I want the countdown page to update when the timer hits zero — showing that the email has been sent — so I know to check my inbox.
- **US-07:** As a recipient, I want to receive the actual email at exactly the scheduled time, with a professionally designed layout.

## 6. Functional Requirements

### 6.1 Compose Form
| ID | Requirement |
|---|---|
| F-01 | Form must collect: sender name, sender email, recipient email, subject, body, scheduled date/time |
| F-02 | Scheduled time must be at least 5 minutes in the future |
| F-03 | All fields are required |
| F-04 | Body is plain text only (no rich text, no attachments in v1) |
| F-05 | Form must show clear validation errors inline |
| F-06 | Form shows a loading state while the request is in flight |

### 6.2 Scheduling & Email Delivery
| ID | Requirement |
|---|---|
| F-07 | Upon successful submission, a teaser email is sent immediately to the recipient |
| F-08 | The actual email is scheduled via Resend's native `scheduledAt` API |
| F-09 | Email content (subject + body) is encrypted with AES-256-GCM before storage |
| F-10 | The scheduled email is delivered at the specified time by Resend |
| F-11 | Delivery status is tracked via Resend webhooks (`email.delivered`, `email.bounced`) |

### 6.3 Countdown Page
| ID | Requirement |
|---|---|
| F-12 | Each scheduled email has a unique public countdown URL: `/countdown/:id` |
| F-13 | The page displays the sender's name and a live countdown (DD:HH:MM:SS) |
| F-14 | When the timer reaches zero, the page shows "The email has been sent — check your inbox!" |
| F-15 | The page never shows the email subject or body |

### 6.4 Confirmation Page
| ID | Requirement |
|---|---|
| F-16 | After successful submission, the sender is redirected to a confirmation page |
| F-17 | The confirmation page shows the scheduled date/time and the copyable countdown URL |

### 6.5 Email Templates
| ID | Requirement |
|---|---|
| F-18 | Teaser email: modern, fun design; shows sender name, scheduled date, and a CTA button linking to countdown page |
| F-19 | Scheduled email: modern, professional design; shows sender name, subject, and body |
| F-20 | Both templates use inline CSS for email client compatibility |

## 7. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NF-01 | Frontend is dark mode by default |
| NF-02 | Fully responsive — works on mobile (320px+), tablet, and desktop |
| NF-03 | Email content is encrypted at rest using AES-256-GCM |
| NF-04 | Webhook endpoint verifies Resend signatures before processing |
| NF-05 | API validates all inputs with a schema (Zod) |

## 8. User Flow

```
Sender fills form
      │
      ▼
POST /api/emails
      │
      ├─► Encrypt content → store in DB (status: pending)
      │
      ├─► Send teaser email immediately → recipient gets countdown link
      │
      ├─► Schedule actual email via Resend scheduledAt
      │
      └─► Update DB status to "scheduled" → redirect sender to /success
                                                      │
                                              Recipient opens countdown link
                                                      │
                                              GET /api/emails/:id
                                                      │
                                              Show countdown timer
                                                      │
                                          ┌───────────┴───────────┐
                                    Timer running          Timer expired
                                    (show countdown)    (show "email sent!")
                                                               │
                                                    Resend delivers email at
                                                    scheduled time
                                                               │
                                                    Webhook updates DB
                                                    status to "delivered"
```

## 9. Status Model

| Status | Meaning |
|---|---|
| `pending` | Row inserted, nothing sent yet |
| `scheduled` | Teaser sent + actual email handed to Resend with future timestamp |
| `delivered` | Resend confirmed delivery via webhook |
| `failed` | Resend reported bounce or rejected the request |

## 10. Design Principles

- **Minimal:** No navigation clutter, no account prompts, no distractions
- **Dark mode first:** `bg-gray-950` base, `gray-900` cards, `gray-100` text, indigo-500 accent
- **Fun but professional:** Warm copy, gradient accents, satisfying interactions — not childish
- **Mobile first:** Single-column layouts, large tap targets, no horizontal scroll

## 11. Tech Stack Summary

| Layer | Technology |
|---|---|
| Frontend | Next.js 14+ (App Router), Tailwind CSS, TypeScript |
| Backend | Node.js + Express, TypeScript |
| Database | PostgreSQL |
| Email | Resend (native scheduling + webhooks) |
| Encryption | AES-256-GCM via Node.js `crypto` |
| Webhook auth | Svix (Resend's webhook library) |
