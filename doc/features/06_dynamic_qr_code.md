# Feature 06: Secure Rotating QR Code

* **Type**: Core application (Core)
* **Dependencies**: [Feature 02: Settings (Slug availability)](./02_merchant_settings.md), [Feature 03: Dashboard](./03_merchant_dashboard.md)

**Description**: The merchant displays a **live, rotating QR Code** on their screen (tablet or phone placed facing the customer line). The customer scans the code to join the queue. The QR code **changes every 15 seconds** with a cryptographic one-time token, ensuring only the person physically present in front of the screen can join — preventing remote fraud, screenshot sharing, and scanning from behind.

## How it works (overview)

1. The merchant opens the **QR Display** screen (`/(dashboard)/qr-display`) on a tablet or phone facing the customer line.
2. A Server Action generates a **short-lived, single-use token** (cryptographic nonce) and stores it in the `qr_tokens` table with a 30-second TTL.
3. The QR code encodes the URL: `https://wait-light.app/[slug]/join?token=<nonce>`.
4. Every **15 seconds**, the dashboard automatically requests a new token and re-renders the QR code with a smooth crossfade animation.
5. When a customer scans the QR code, the `/[slug]/join` page validates the token server-side:
   - Token must exist in `qr_tokens` for the correct `merchant_id`.
   - Token must not be expired (`created_at + 30s > NOW()`).
   - Token must not already be consumed (`used = false`).
6. On successful validation, the token is marked as `used = true` and the customer proceeds to the join form.
7. If the token is invalid or expired, the customer sees a friendly error: _"This QR code has expired. Please scan the current code on the merchant's screen."_

## Integration sub-tasks

### Backend (Supabase)

- [ ] Create the `qr_tokens` table:
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
- [ ] Set up RLS on `qr_tokens`:
  - `INSERT`: Merchant only (`auth.uid() = merchant_id`).
  - `SELECT`: Public for token validation (anon can check `nonce` + `merchant_id` existence).
  - `UPDATE` (mark `used`): Only via `SECURITY DEFINER` RPC `consume_qr_token(p_nonce, p_merchant_id)`.
  - `DELETE`: System only (cleanup cron).
- [ ] Write the `generate_qr_token` Server Action:
  1. Verify authenticated merchant.
  2. Generate a cryptographically secure nonce: `crypto.randomUUID()` combined with an HMAC signature using a server-side secret (`QR_TOKEN_SECRET`), producing a 32-char hex token.
  3. Insert into `qr_tokens` with 30-second TTL.
  4. Return `{ data: { nonce, expiresAt } }`.
- [ ] Write the `validate_qr_token` RPC (SECURITY DEFINER):
  ```sql
  CREATE OR REPLACE FUNCTION validate_qr_token(p_nonce TEXT, p_slug TEXT)
  RETURNS BOOLEAN AS $$
  DECLARE
    token_row qr_tokens%ROWTYPE;
    merchant_row merchants%ROWTYPE;
  BEGIN
    SELECT * INTO merchant_row FROM merchants WHERE slug = p_slug;
    IF NOT FOUND THEN RETURN false; END IF;

    SELECT * INTO token_row FROM qr_tokens
      WHERE nonce = p_nonce
        AND merchant_id = merchant_row.id
        AND used = false
        AND expires_at > NOW();
    IF NOT FOUND THEN RETURN false; END IF;

    UPDATE qr_tokens SET used = true WHERE id = token_row.id;
    RETURN true;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;
  ```
- [ ] Set up a **Supabase Cron Job** to purge expired tokens every 5 minutes:
  ```sql
  SELECT cron.schedule('cleanup-qr-tokens', '*/5 * * * *',
    $$DELETE FROM qr_tokens WHERE expires_at < NOW() - INTERVAL '5 minutes'$$
  );
  ```
- [ ] Add `QR_TOKEN_SECRET` to server-side environment variables (used for HMAC signing).

### Frontend (Next.js)

- [ ] Add a `/(dashboard)/qr-display` fullscreen view in the dashboard.
- [ ] Implement the `QRCodeDisplay` component:
  - Renders the QR code as **SVG** using `qrcode.react`.
  - Shows a **countdown ring** (circular progress indicator) showing seconds until next rotation.
  - On token expiry (every 15s), calls `generateQrTokenAction` and crossfades to the new QR code using Framer Motion.
  - Displays the merchant name and _"Scan to join the queue!"_ subtitle below the QR code.
- [ ] Add an action bar with:
  - **"Fullscreen" button** — toggles browser Fullscreen API for kiosk-mode tablet display.
  - **"Print Static Flyer" button** — prints a static QR code pointing to `/[slug]` (the landing page, not `/join?token=`) with a note _"Visit our page"_ for offline marketing. This is separate from the live rotating code.
- [ ] On the `/[slug]/join` page:
  - Extract `token` from URL search params.
  - If no token is present, show a message: _"Please scan the QR code at the merchant's counter to join the queue."_
  - Call `validate_qr_token` RPC before rendering the join form.
  - If token is invalid/expired, show: _"This QR code has expired. Please scan the current code displayed at the counter."_ with a clear visual (icon + explanation).
  - If token is valid, render the join form as normal.

## Identified additional tasks

### Quality & robustness

- [ ] **SVG format**: Ensure the QR code is generated as an SVG, not a raster PNG, so it remains crisp on all screen sizes.
- [ ] **Token generation resilience**: If the Server Action to generate a new token fails (network issue), keep displaying the previous QR code and retry with exponential backoff. Show a subtle warning to the merchant: _"Token refresh failed — retrying…"_
- [ ] **Grace period**: The token TTL (30s) is intentionally longer than the rotation interval (15s). This means two tokens are always valid simultaneously, handling the edge case where a customer scans right as the code transitions.
- [ ] **Offline detection**: If the merchant's device goes offline, pause token rotation, display a prominent warning banner, and resume immediately on reconnection.

### UX & accessibility

- [ ] **WakeLock API**: Activate the `navigator.wakeLock` API on the `qr-display` route to prevent the tablet screen from sleeping. Include the iOS `<video>` fallback.
- [ ] **High contrast QR**: Render the QR code in pure black on white with generous quiet zone (margin) for maximum scan reliability across all phone cameras and lighting conditions.
- [ ] **Countdown animation**: The circular countdown ring around the QR code gives visual feedback that the code is live and actively rotating — this builds customer trust and signals urgency to scan now.
- [ ] **Print CSS**: Include a `@media print` block for the static flyer that hides the dashboard nav, centers the QR on an A4/Letter sheet, and adds the merchant name + _"Visit us online"_ subtitle.
- [ ] **Kiosk mode**: When fullscreen is activated, hide all browser chrome and dashboard navigation. Show only the QR code, merchant branding, and the countdown ring.

### Security

- [ ] **Cryptographic nonce**: Each token is generated using `crypto.randomUUID()` + HMAC-SHA256 with a server-side secret. Tokens are unguessable and cannot be forged.
- [ ] **Single-use enforcement**: The `validate_qr_token` RPC atomically marks the token as `used` in the same transaction that validates it, preventing race conditions where two people scan the same QR frame.
- [ ] **Short TTL**: 30-second expiry window makes screenshot-sharing and remote scanning effectively impossible. By the time someone texts a photo of the QR code, it's already expired.
- [ ] **Rolling invalidation**: Only the last 2 tokens per merchant are valid at any time. All older tokens are either expired or already consumed.
- [ ] **No token in localStorage**: The token is a one-time gate to access the join form. Once validated, it is consumed server-side — it is never stored on the client.
- [ ] **Rate limiting on token generation**: Max 10 token generations per minute per merchant (prevents abuse if dashboard is compromised).
- [ ] **Anti-enumeration**: Tokens are high-entropy (UUID + HMAC), making brute-force attempts to guess a valid token computationally infeasible.
- [ ] **Fraud scenario mitigations**:
  - _Screenshot sharing_: Token expires in 30s — too fast to share via messaging apps.
  - _Scanning from behind the counter_: QR rotates every 15s, so a scan captured from distance/angle must be used within seconds. Combined with single-use, only one person can join per token.
  - _Bot/automated joining_: Rate limiting (5 joins/IP/min) + token requirement makes automated queue stuffing impractical.
  - _Token replay_: Single-use flag prevents any token from being used twice.

## Architecture Notes

- The QR code is generated **client-side** from the token URL — no image blobs stored in Supabase.
- Token generation happens via a **Server Action** (not a client-side Supabase call) to keep the HMAC secret server-side.
- The `qr-display` page is a lightweight, focused view optimized for tablet display in kiosk mode. It should load fast and use minimal resources.
- The rotating QR system replaces the previous static QR design. The static _"Print Flyer"_ option remains available but points to the landing page (`/[slug]`), not the join page, since static codes cannot carry rotating tokens.
- The 15s rotation / 30s TTL configuration values should be stored as constants in `lib/utils/qr-config.ts` to allow easy tuning without code changes across multiple files.
