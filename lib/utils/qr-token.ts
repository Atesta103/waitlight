/**
 * @module qr-token
 * @category Utilities
 *
 * Client-side time-slot token validation for the rotating QR code.
 *
 * **Strategy:** the merchant dashboard generates a time-slotted integer token:
 * `token = Math.floor(Date.now() / QR_REFRESH_INTERVAL_MS)`.
 * The token is embedded in the join URL as `/{slug}/join?t={token}`.
 *
 * **Grace period:** when the QR rotates, the previous slot is still accepted
 * for {@link QR_GRACE_MS} ms to cover customers who scanned just before rotation.
 *
 * @example
 * // 10 s slots, 5 s grace window
 * isQrTokenValid(currentSlot())           // true  (current slot)
 * isQrTokenValid(currentSlot() - 1)       // true  (if within grace window)
 * isQrTokenValid(currentSlot() - 2)       // false (too old)
 *
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
