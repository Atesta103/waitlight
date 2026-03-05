/**
 * QR code token validation utilities.
 *
 * Strategy
 * --------
 * The merchant dashboard generates a time-slotted token:
 *   token = Math.floor(Date.now() / REFRESH_INTERVAL_MS)
 *
 * The token is embedded in the join URL: `/[slug]/join?t={token}`
 *
 * Invalidation + grace period
 * ---------------------------
 * When the QR code rotates, the previous token is NO longer the current one.
 * However, a customer may have scanned the QR just as it switched and is still
 * navigating to the join URL. We accept the previous token for GRACE_MS after
 * it expired to cover this race condition.
 *
 * Timeline example (REFRESH_INTERVAL_MS = 10 s, GRACE_MS = 5 s):
 *
 *   0s ──── slot N valid ──────────── 10s
 *                          9s: customer scans slot N
 *   10s ──── slot N+1 valid ─────────────────── ...
 *   10s ──── slot N grace ──── 15s: slot N rejected
 *                         12s: customer hits server → slot N still valid ✓
 *                         16s: customer hits server → slot N rejected   ✗
 */

/** Must stay in sync with QRCodeDisplay.tsx */
export const QR_REFRESH_INTERVAL_MS = 10_000

/**
 * How long (ms) the previous token is still accepted after it expires.
 * Set to allow a full page load after scanning at the last second.
 */
export const QR_GRACE_MS = 5_000

/**
 * Returns the current valid slot index.
 */
export function currentSlot(now: number = Date.now()): number {
    return Math.floor(now / QR_REFRESH_INTERVAL_MS)
}

/**
 * Returns true if the given token is valid at `now`.
 *
 * Accepts:
 *  - The current slot (always valid)
 *  - The previous slot within the grace window
 *
 * @param token  The integer token parsed from the `?t=` query parameter.
 * @param now    Current timestamp in ms (injectable for testing). Defaults to Date.now().
 */
export function isQrTokenValid(
    token: number,
    now: number = Date.now(),
): boolean {
    const slot = currentSlot(now)

    // Current slot — always valid
    if (token === slot) return true

    // Previous slot — valid only within the grace period
    if (token === slot - 1) {
        const slotExpiredAt = slot * QR_REFRESH_INTERVAL_MS
        return now - slotExpiredAt < QR_GRACE_MS
    }

    return false
}
