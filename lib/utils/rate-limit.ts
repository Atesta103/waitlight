/**
 * In-memory rate limiter utility for API route handlers.
 * Note: Features basic per-instance rate limiting.
 * For distributed rate limiting, consider Upstash Redis or Supabase limits.
 */

const rateLimitMap = new Map<string, { count: number; expiresAt: number }>()

/**
 * Clean up expired records to prevent unbounded memory growth.
 * Typically called occasionally on new requests.
 */
function cleanup() {
    const now = Date.now()
    for (const [key, record] of rateLimitMap.entries()) {
        if (record.expiresAt < now) {
            rateLimitMap.delete(key)
        }
    }
}

/**
 * Check if the given identifier (e.g., IP address) has exceeded the rate limit.
 *
 * @param identifier - Unique identifier (e.g. IP address)
 * @param limit - Maximum number of requests allowed within the window
 * @param windowMs - Time window in milliseconds
 * @returns true if allowed, false if rate limited
 */
export function checkRateLimit(
    identifier: string,
    limit: number = 10,
    windowMs: number = 60000,
): boolean {
    const now = Date.now()

    // Periodically cleanup (e.g., 10% chance per call to avoid blocking every time)
    if (Math.random() < 0.1) {
        cleanup()
    }

    const record = rateLimitMap.get(identifier)

    if (!record || record.expiresAt < now) {
        rateLimitMap.set(identifier, { count: 1, expiresAt: now + windowMs })
        return true
    }

    if (record.count >= limit) {
        return false
    }

    record.count++
    return true
}
