/**
 * @module stripe-config
 * @category Billing
 *
 * Server-only Stripe environment helpers.
 */

export function getStripeSecretKey(): string {
    const key = process.env.STRIPE_SECRET_KEY

    if (!key) {
        throw new Error("STRIPE_SECRET_KEY is not set")
    }

    if (process.env.NODE_ENV === "production" && key.startsWith("sk_test_")) {
        throw new Error("Production billing requires a live Stripe secret key")
    }

    return key
}

export function getStripePriceId(): string | null {
    const priceId = process.env.STRIPE_PRICE_ID

    if (!priceId || !priceId.startsWith("price_")) {
        return null
    }

    return priceId
}
