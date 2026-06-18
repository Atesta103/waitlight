/**
 * @module stripe
 * @category Billing
 *
 * Singleton Stripe client — server-only.
 * Never import this file in a Client Component or any file prefixed with NEXT_PUBLIC_.
 */
import Stripe from "stripe"
import { getStripeSecretKey } from "@/lib/stripe-config"

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
    if (!_stripe) {
        _stripe = new Stripe(getStripeSecretKey(), {
            apiVersion: "2026-02-25.clover",
        })
    }
    return _stripe
}

// Compat — remplacé progressivement par getStripe()
export const stripe = new Proxy({} as Stripe, {
    get(_target, prop) {
        return (getStripe() as unknown as Record<string | symbol, unknown>)[prop]
    },
})
