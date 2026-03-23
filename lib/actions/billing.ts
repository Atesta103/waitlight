/**
 * @module actions/billing
 * @category Actions
 *
 * Server Actions for Stripe billing flows.
 * All actions return { data } | { error } — never throw.
 */
"use server"

import { headers } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { adminSupabase } from "@/lib/supabase/admin"
import { stripe } from "@/lib/stripe"
import { isActiveStatus } from "@/lib/subscription-status"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SubscriptionRow = {
    id: string
    merchant_id: string
    stripe_customer_id: string
    stripe_subscription_id: string | null
    stripe_price_id: string | null
    status: string
    trial_end: string | null
    current_period_end: string | null
    cancel_at_period_end: boolean
    created_at: string
    updated_at: string
}

// ---------------------------------------------------------------------------
// getSubscriptionAction
// ---------------------------------------------------------------------------

/**
 * Fetch the current merchant's subscription row.
 * Returns null data when no subscription exists yet.
 */
export async function getSubscriptionAction(): Promise<
    { data: SubscriptionRow | null } | { error: string }
> {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Session expirée. Veuillez vous reconnecter." }
    }

    const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("merchant_id", user.id)
        .maybeSingle()

    if (error) {
        return { error: "Impossible de récupérer l'abonnement." }
    }

    return { data: data as SubscriptionRow | null }
}

// ---------------------------------------------------------------------------
// createCheckoutSessionAction
// ---------------------------------------------------------------------------

/**
 * Create a Stripe Checkout Session for a new subscription.
 * Returns the Checkout URL — the caller is responsible for redirecting.
 *
 * Reuses an existing Stripe Customer when one already exists.
 * Prevents creating a second session if the merchant already has an active sub.
 */
export async function createCheckoutSessionAction(): Promise<
    { data: { url: string } } | { error: string }
> {
    if (!process.env.STRIPE_PRICE_ID) {
        return { error: "Configuration de paiement manquante." }
    }

    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Session expirée. Veuillez vous reconnecter." }
    }

    // Block if already active
    const { data: existingSubRaw } = await supabase
        .from("subscriptions")
        .select("status, stripe_customer_id")
        .eq("merchant_id", user.id)
        .maybeSingle()

    const existingSub = existingSubRaw as {
        status: string
        stripe_customer_id: string
    } | null

    if (existingSub && isActiveStatus(existingSub.status)) {
        return { error: "Vous avez déjà un abonnement actif." }
    }

    // Resolve or create Stripe Customer.
    // Existing DB IDs can become stale if keys/accounts were changed in development.
    let stripeCustomerId: string | null = existingSub?.stripe_customer_id ?? null

    if (stripeCustomerId) {
        try {
            const existingCustomer = await stripe.customers.retrieve(
                stripeCustomerId,
            )
            if ("deleted" in existingCustomer && existingCustomer.deleted) {
                stripeCustomerId = null
            }
        } catch {
            stripeCustomerId = null
        }
    }

    if (!stripeCustomerId) {
        try {
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: { merchant_id: user.id },
            })
            stripeCustomerId = customer.id

            // Ensure we persist the valid customer id used for future checkout attempts.
            await adminSupabase.from("subscriptions").upsert(
                {
                    merchant_id: user.id,
                    stripe_customer_id: stripeCustomerId,
                    status: "incomplete",
                } as never,
                { onConflict: "merchant_id" },
            )
        } catch {
            return {
                error: "Impossible de contacter le serveur de paiement. Réessayez.",
            }
        }
    }

    // Build origin from request headers (works in both dev and prod)
    const headersList = await headers()
    const origin =
        headersList.get("origin") ??
        `https://${headersList.get("host") ?? "localhost:3000"}`

    try {
        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            customer: stripeCustomerId,
            line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
            subscription_data: { trial_period_days: 14 },
            success_url: `${origin}/billing-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/subscribe?error=cancelled`,
            allow_promotion_codes: true,
            metadata: { merchant_id: user.id },
        })

        if (!session.url) {
            return { error: "Impossible de créer la session de paiement." }
        }

        return { data: { url: session.url } }
    } catch {
        return {
            error: "Impossible de contacter le serveur de paiement. Réessayez.",
        }
    }
}

// ---------------------------------------------------------------------------
// createPortalSessionAction
// ---------------------------------------------------------------------------

/**
 * Create a Stripe Billing Portal session for the current merchant.
 * Allows them to update payment method, cancel, or view invoices.
 * Returns the Portal URL — the caller is responsible for redirecting.
 */
export async function createPortalSessionAction(): Promise<
    { data: { url: string } } | { error: string }
> {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Session expirée. Veuillez vous reconnecter." }
    }

    const { data: subRaw } = await supabase
        .from("subscriptions")
        .select("stripe_customer_id")
        .eq("merchant_id", user.id)
        .maybeSingle()

    const sub = subRaw as { stripe_customer_id: string } | null

    if (!sub?.stripe_customer_id) {
        return { error: "Aucun abonnement trouvé." }
    }

    const headersList = await headers()
    const origin =
        headersList.get("origin") ??
        `https://${headersList.get("host") ?? "localhost:3000"}`

    try {
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: sub.stripe_customer_id,
            return_url: `${origin}/dashboard/settings`,
        })

        return { data: { url: portalSession.url } }
    } catch {
        return {
            error: "Impossible de contacter le serveur de paiement. Réessayez.",
        }
    }
}
