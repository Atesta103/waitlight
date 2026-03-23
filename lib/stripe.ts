/**
 * @module stripe
 * @category Billing
 *
 * Singleton Stripe client — server-only.
 * Never import this file in a Client Component or any file prefixed with NEXT_PUBLIC_.
 */
import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set")
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-02-25.clover",
})
