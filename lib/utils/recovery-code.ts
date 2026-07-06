/**
 * @module utils/recovery-code
 * @category Utils
 *
 * Generates short, human-friendly recovery codes for queue tickets.
 * A customer who lost their tracking link retrieves it with their first
 * name + this code on /{slug}/retrouver.
 */

/**
 * Alphabet without visually ambiguous glyphs (no I, L, O, 0, 1) so the code
 * stays readable when spoken aloud or read off a screen.
 */
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"

/** Default code length. 4 chars ≈ 810k combinations — memorable, and safe when paired with the first name + rate-limiting. */
export const RECOVERY_CODE_LENGTH = 4

/**
 * Generate a cryptographically-random recovery code from {@link CODE_ALPHABET}.
 *
 * @param length - Number of characters (defaults to {@link RECOVERY_CODE_LENGTH}).
 */
export function generateRecoveryCode(length = RECOVERY_CODE_LENGTH): string {
    const bytes = crypto.getRandomValues(new Uint8Array(length))
    let code = ""
    for (let i = 0; i < length; i++) {
        code += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length]
    }
    return code
}

/**
 * Normalize a user-entered code for comparison: trim, uppercase, and strip
 * any character not in the alphabet (spaces, dashes, ambiguous glyphs typed
 * by the customer). Maps common look-alikes (0→O won't match; we instead
 * drop them) — keep it strict but forgiving of spacing/case.
 */
export function normalizeRecoveryCode(input: string): string {
    return input
        .trim()
        .toUpperCase()
        .split("")
        .filter((ch) => CODE_ALPHABET.includes(ch))
        .join("")
}
