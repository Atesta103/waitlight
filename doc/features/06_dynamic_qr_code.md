# Feature 06: Secure Rotating QR Code

## 1. Metadata

- Feature: Cryptographic Rotating QR Code
- Owner: Founding Team
- Status: `implemented`
- Last updated: 2026-03-23
- Related issue/epic: TBD
- Value to user: 5
- Strategic priority: 5
- Time to code: 4
- Readiness score: 90/100
- Interest score: 95/100
- Source of truth:
  - Schema: `supabase/migrations/20260305000000_qr_tokens.sql`
  - Route(s): `app/[slug]/join/`, `app/(qr)/qr/`
  - UI entrypoint(s): `components/composed/QRCodeDisplay.tsx`

## 2. Problem and Outcome

### Problem

A static QR code pointing to a join URL can be shared remotely (via messaging apps, screenshots) or scanned by bots — allowing people to join the queue without being physically present, completely undermining the fairness of the system.

### Target outcome

A QR code that rotates every 15 seconds with a cryptographic one-time token. Only the person physically in front of the merchant's screen can scan the current code. Screenshots are useless after 30 seconds; bots are blocked by the rate limit.

### Success metrics

- Token entropy ≥ 256 bits (UUID + HMAC-SHA256)
- Zero replay attacks possible (single-use token + `FOR UPDATE SKIP LOCKED`)
- QR rotation causes zero user-visible flicker (crossfade animation)

## 3. Scope

### In scope

- `qr_tokens` table with 30s TTL, single-use enforcement
- `generateQrTokenAction` — authenticated, HMAC-signed, rate-limited (10/min)
- `validate_qr_token` RPC — atomic token consumption
- `cleanup_expired_qr_tokens` pg_cron (every 5 min)
- `QRCodeDisplay` with countdown ring and crossfade
- Fullscreen kiosk page `/qr?slug=…`

### Out of scope

- Static printed QR codes (pointing to `/[slug]` without token)
- Print CSS / flyer generation (planned)
- Rolling token invalidation beyond single-use

## 4. User Stories

- As a merchant, I want the QR code to rotate automatically so that remote sharing is prevented.
- As a customer, I want a smooth scanning experience so that I join the queue in one scan.
- As a merchant, I want a fullscreen kiosk mode so that I can display the QR code on a dedicated tablet.

## 5. Functional Requirements

- [x] FR-1: `qr_tokens` table — `nonce`, `merchant_id`, `used`, `expires_at` (30s TTL)
- [x] FR-2: `generateQrTokenAction` — auth check, nonce = `crypto.randomUUID()` + HMAC-SHA256, rate limit 10/min
- [x] FR-3: `validate_qr_token(p_nonce, p_slug)` RPC — SECURITY DEFINER, `FOR UPDATE SKIP LOCKED`, marks `used = true`
- [x] FR-4: `cleanup_expired_qr_tokens` — pg_cron every 5 min, deletes tokens > 5 min past expiry
- [x] FR-5: `QRCodeDisplay` — 15s rotation, crossfade animation, countdown ring
- [x] FR-6: Fullscreen `/(qr)/qr/page.tsx` — kiosk mode, no dashboard chrome
- [x] FR-7: Inline QR panel in dashboard right column when queue is open
- [x] FR-8: Grace period: TTL (30s) > rotation (15s) — two tokens valid simultaneously
- [ ] FR-9: Token generation resilience — retry with backoff if action fails
- [ ] FR-10: Rolling invalidation — only last 2 tokens per merchant valid (beyond TTL + single-use)
- [ ] FR-11: Print CSS for static flyer

## 6. Data Contracts

### Existing tables/types

- `qr_tokens`: `id`, `merchant_id`, `nonce` (UNIQUE), `used`, `created_at`, `expires_at`

### Schema changes (if any)

- [x] None (table created in migration `20260305000000_qr_tokens.sql`)

### Validation (Zod)

- Input schema(s): `GenerateQrTokenSchema` (merchant auth only — no body input)
- Expected failure responses: `401` (unauthenticated), `429` (rate limit), `400` (token expired or invalid)

## 7. API and Integration Contracts

### Route handlers

- n/a (Server Actions for token generation; RPC for validation)

### External dependencies

- `QR_TOKEN_SECRET` env var for HMAC-SHA256 signing
- `qrcode.react` library for SVG rendering
- pg_cron for token cleanup

## 8. UI and UX

- Entry points: Merchant opens dashboard → QR panel visible; or opens fullscreen `/qr` tab
- Loading state: QR code SVG renders immediately from token; spinner during the 15s refresh crossfade
- Empty state: n/a (QR is always available when merchant is authenticated)
- Error state: Subtle warning banner if token generation fails; previous code remains displayed
- Accessibility notes: QR code has `alt` text; countdown ring uses `aria-label`; kiosk page removes all nav for focus simplicity

## 9. Security and Privacy

- Secret/env requirements: `QR_TOKEN_SECRET` (server-only, HMAC signing)
- Data retention and PII handling: Tokens are ephemeral — cleaned up by pg_cron 5 min post-expiry
- Abuse/failure cases and mitigations: HMAC prevents token forgery; single-use + FOR UPDATE prevents replay; rate limit prevents enumeration bot; 30s TTL prevents screenshot sharing

## 10. Observability

- Structured logs to emit: Token generated (merchant_id), token validated (merchant_id, success/failure), cleanup run (tokens deleted count)
- Key counters/timers to track: Token validation failure rate, rate limit hits per merchant
- Alert thresholds (if relevant): Token validation failure rate > 10% → alert (possible attack)

## 11. Test Plan

### Unit

- `signQrToken`: known input → expected HMAC output
- `verifyQrToken`: valid signature → true; tampered payload → false
- Rate limit counter: 10 within window → allowed; 11th → rejected

### Integration

- `validate_qr_token` RPC: valid nonce → returns merchant data + marks used; used nonce → returns null; expired nonce → returns null
- `generateQrTokenAction`: 11th call within 60s → error `rate_limit_exceeded`

### Storybook (if UI)

- Story variant 1: `QRCodeDisplay` — default active state with countdown
- Story variant 2: `QRCodeDisplay` — crossfade transition (use `args.isRefreshing`)
- Story variant 3: `QRCodeDisplay` — error state (token generation failed)

### Manual QA

- Step 1: Display QR → scan before 15s → join successfully
- Step 2: Wait 30s → try to scan old QR → get "QR code expired" error
- Step 3: Scan same QR twice rapidly → second scan rejected

## 12. Implementation Plan

1. Milestone 1: `qr_tokens` table, RLS, `validate_qr_token` RPC, cleanup function + cron
2. Milestone 2: `generateQrTokenAction`, HMAC signing, rate limiting
3. Milestone 3: `QRCodeDisplay` UI, crossfade, countdown ring, fullscreen kiosk page

## 13. Rollout and Backfill

- Feature flag needed: no
- Backfill required: no (tokens are ephemeral)
- Rollback plan: Remove token validation from `joinQueueAction`; merchant provides static join link

## 14. Definition of Done

- [x] Implementation merged to main
- [x] Relevant unit and integration tests added and passing
- [x] End-user or internal documentation updated
- [x] `.env.example` updated (QR_TOKEN_SECRET)
- [ ] Dashboard/Storybook layout and behavior visually validated
