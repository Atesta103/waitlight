/**
 * @module qr-config
 * @category Utilities
 *
 * Centralized configuration constants for the rotating QR code system.
 * Edit here to tune timing without hunting across multiple files.
 */

/** Milliseconds between QR code rotations on the display screen. */
export const QR_ROTATION_INTERVAL_MS = 15_000

/** Seconds a token remains valid in the database (30s grace window). */
export const QR_TOKEN_TTL_SECONDS = 30

/**
 * Maximum number of valid tokens simultaneously per merchant.
 * Current (15s interval) + Previous (still within 30s TTL) = 2.
 */
export const QR_MAX_VALID_TOKENS = 2

/** Max token generations per minute per merchant before rate-limiting. */
export const QR_MAX_TOKENS_PER_MINUTE = 10
