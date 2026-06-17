/**
 * @module stripe
 * @category Billing
 *
 * Singleton Stripe client — server-only.
 * Never import this file in a Client Component or any file prefixed with NEXT_PUBLIC_.
 */
import Stripe from "stripe"
import { getStripeSecretKey } from "@/lib/stripe-config"

export const stripe = new Stripe(getStripeSecretKey(), {
    apiVersion: "2026-02-25.clover",
})
