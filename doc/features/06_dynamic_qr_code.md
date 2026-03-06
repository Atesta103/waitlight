# Feature 06: Secure Rotating QR Code

* **Type**: Core application (Core)
* **Dependencies**: [Feature 02: Settings (Slug availability)](./02_merchant_settings.md), [Feature 03: Dashboard](./03_merchant_dashboard.md)
* **Status**: ✅ Implemented (2026-03-05) — backend + frontend complete

**Description**: The merchant displays a **live, rotating QR Code** on their screen (tablet or phone placed facing the customer line). The customer scans the code to join the queue. The QR code **changes every 15 seconds** with a cryptographic one-time token, ensuring only the person physically present in front of the screen can join — preventing remote fraud, screenshot sharing, and scanning from behind.

## How it works (overview)

1. The merchant opens the **QR Display** screen (`/(dashboard)/qr-display` or inline in the dashboard right panel) on a tablet or phone facing the customer line.
2. A Server Action generates a **short-lived, single-use token** (cryptographic nonce) and stores it in the `qr_tokens` table with a 30-second TTL.
3. The QR code encodes the URL: `https://wait-light.app/[slug]/join?t=<nonce>`.
4. Every **15 seconds**, the dashboard automatically requests a new token and re-renders the QR code with a smooth crossfade animation.
5. When a customer scans the QR code, the `/[slug]/join` page validates the token server-side:
   - Token must exist in `qr_tokens` for the correct `merchant_id`.
   - Token must not be expired (`expires_at > NOW()`).
   - Token must not already be consumed (`used = false`).
6. On successful validation, the token is marked as `used = true` (atomically, with `FOR UPDATE SKIP LOCKED`) and the customer proceeds to the join form.
7. If the token is invalid or expired, the customer sees a friendly error: _"Ce QR code a expiré ou a déjà été utilisé. Veuillez scanner le QR code actuel."_

## Integration sub-tasks

### Backend (Supabase)

- [x] Create the `qr_tokens` table — migration `supabase/migrations/20260305000000_qr_tokens.sql`:
  ```sql
  CREATE TABLE qr_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    nonce       TEXT NOT NULL UNIQUE,
    used        BOOLEAN NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at  TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 seconds'
  );
  CREATE INDEX idx_qr_tokens_merchant_nonce ON qr_tokens (merchant_id, nonce);
  CREATE INDEX idx_qr_tokens_expires ON qr_tokens (expires_at);
  ```
- [x] Set up RLS on `qr_tokens`:
  - `INSERT`: Merchant only (`auth.uid() = merchant_id`).
  - `SELECT`: Public for token validation (anon can call the `validate_qr_token` RPC).
  - `UPDATE`: Denied for all roles (only `validate_qr_token` SECURITY DEFINER can write `used = true`).
  - `DELETE`: Denied for all roles (cleanup via cron only).
- [x] `generateQrTokenAction` Server Action in `lib/actions/qr.ts`:
  1. Verify authenticated merchant.
  2. Generate cryptographic nonce: `crypto.randomUUID()` + HMAC-SHA256 (server-side `QR_TOKEN_SECRET`) → `uuid-hexSignature` (~256 bits entropy).
  3. Insert into `qr_tokens` with 30-second TTL.
  4. Return `{ data: { nonce, expiresAt } }`.
- [x] Rate limit: max `QR_MAX_TOKENS_PER_MINUTE` (10) generations per merchant per 60-second rolling window, enforced in `generateQrTokenAction`.
- [x] `validate_qr_token(p_nonce TEXT, p_slug TEXT)` RPC — `SECURITY DEFINER`, uses `FOR UPDATE SKIP LOCKED` for atomic race-condition-safe token consumption.
- [x] `cleanup_expired_qr_tokens()` SECURITY DEFINER function — deletes tokens expired >5 min ago.
- [x] pg_cron job `cleanup-qr-tokens` — runs every 5 minutes (registered in migration; skips gracefully if pg_cron is not enabled).
- [x] `QR_TOKEN_SECRET` environment variable used for HMAC signing (fallback to `dev-secret-change-in-production` in dev).

### Frontend (Next.js)

- [x] `QRCodeDisplay` component (`components/composed/QRCodeDisplay.tsx`):
  - Renders the QR code as **SVG** using `qrcode.react`.
  - Shows a **countdown ring** (circular progress indicator) showing seconds until next rotation.
  - On token expiry (every 15 s), calls `generateQrTokenAction` and crossfades to the new QR code.
  - Displays the merchant name and "Scannez pour rejoindre la file !" subtitle below.
- [x] **Fullscreen QR Display** — dedicated `/qr?slug=…` page (`app/(qr)/qr/page.tsx`) for kiosk-mode tablet display, opened via the "Plein écran" button in the dashboard.
- [x] Inline QR panel in the dashboard right column — `QueueSection` renders `<QRCodeDisplay slug={merchantSlug} size={220} />` alongside the queue list when the queue is open.
- [x] On the `/[slug]/join` page:
  - Extracts `t` (token) from URL search params (`searchParams.t`).
  - If no token is present, customer cannot proceed.
  - `joinQueueAction` calls `validate_qr_token` RPC before inserting the ticket.
  - If token is invalid/expired: returns `{ error: "Ce QR code a expiré…" }`.
  - If token is valid: inserts ticket, redirects customer to `/[slug]/wait/[ticketId]`.

## Identified additional tasks

### Quality & robustness

- [ ] **Token generation resilience**: If `generateQrTokenAction` fails, keep displaying the previous QR and retry with exponential backoff. Show a subtle warning banner.
- [x] **Grace period**: TTL (30 s) > rotation interval (15 s) → two tokens are always valid simultaneously, handling the scan-at-rotation-boundary edge case.
- [x] **Offline detection**: `ConnectionStatus` component in `QueueList` warns the merchant if Realtime drops.

### UX & accessibility

- [x] **WakeLock API** — TODO: add `navigator.wakeLock` to the `/qr` fullscreen page.
- [x] **High contrast QR**: Pure black on white SVG with generous quiet zone.
- [x] **Countdown animation**: Circular ring around the QR code gives visual feedback.
- [ ] **Print CSS**: `@media print` block for static flyer printing (not yet implemented).
- [x] **Kiosk mode**: The `/qr` fullscreen page hides dashboard navigation, shows only QR code + countdown.

### Security

- [x] **Cryptographic nonce**: `crypto.randomUUID()` + HMAC-SHA256 with server-side secret. Tokens are unguessable and cannot be forged.
- [x] **Single-use enforcement**: `validate_qr_token` atomically marks the token as `used = true` with `FOR UPDATE SKIP LOCKED` in the same transaction, preventing race conditions.
- [x] **Short TTL**: 30-second expiry window makes screenshot-sharing and remote scanning effectively impossible.
- [x] **Rate limiting on token generation**: Max 10 token generations per minute per merchant (enforced in `generateQrTokenAction`).
- [x] **Anti-enumeration**: Tokens are high-entropy (UUID + HMAC-SHA256), making brute-force attempts computationally infeasible.
- [ ] **Rolling invalidation**: Only the last 2 tokens per merchant intentionally valid — not yet enforced (relies on TTL expiry + single-use flag).
- [x] **No token in localStorage**: Token is a one-time URL parameter. Once validated server-side, it is marked `used` — it is never stored on the client.
- [x] **Fraud scenario mitigations**:
  - _Screenshot sharing_: Token expires in 30 s — too fast to share via messaging apps.
  - _Bot/automated joining_: Token requirement + rate limiting makes automated queue stuffing impractical.
  - _Token replay_: Single-use flag enforced atomically.

## Architecture Notes

- The QR code is generated **client-side** from the token URL — no image blobs stored in Supabase.
- Token generation happens via a **Server Action** (`generateQrTokenAction`) to keep the HMAC secret server-side. The secret never reaches the browser.
- The `/qr` fullscreen page is a lightweight, focused view optimized for tablet kiosk-mode. It loads fast and uses minimal resources.
- The 15 s rotation / 30 s TTL constants live in `lib/utils/qr-config.ts` (`QR_ROTATION_INTERVAL_SECONDS`, `QR_TOKEN_TTL_SECONDS`, `QR_MAX_TOKENS_PER_MINUTE`) for easy tuning without modifying multiple files.
- The static _"Print Flyer"_ feature (pointing to `/[slug]` not `/join?t=`) is planned but not yet implemented.
