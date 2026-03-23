import type { Metadata } from "next"
import type Stripe from "stripe"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { adminSupabase } from "@/lib/supabase/admin"
import { stripe } from "@/lib/stripe"
import Link from "next/link"
import { AlertCircle } from "lucide-react"

export const metadata: Metadata = {
    title: "Abonnement activé — Wait-Light",
}

type SearchParams = Promise<{ session_id?: string }>

/**
 * Billing success page — Server Component.
 *
 * Called after a successful Stripe Checkout. Immediately upserts the
 * subscription row so the dashboard gate works without waiting for a webhook.
 * The webhook will later sync any state changes — upserts are idempotent.
 *
 * NOTE: Stripe v20 moved current_period_end from Subscription to
 * SubscriptionItem (sub.items.data[0].current_period_end).
 */
export default async function BillingSuccessPage(props: {
    searchParams: SearchParams
}) {
    const searchParams = await props.searchParams
    const sessionId = searchParams.session_id

    if (!sessionId) {
        return <ErrorView message="Lien de retour invalide." />
    }

    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) redirect("/login")

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ["subscription", "subscription.items"],
        })

        if (session.status !== "complete") {
            return (
                <ErrorView message="Le paiement n'est pas encore confirmé. Veuillez patienter quelques instants." />
            )
        }

        const merchantId = session.metadata?.merchant_id ?? user.id
        const sub = session.subscription as Stripe.Subscription
        const periodEnd = sub.items.data[0]?.current_period_end
            ? new Date(sub.items.data[0].current_period_end * 1000).toISOString()
            : null

        const { error: upsertError } = await adminSupabase
            .from("subscriptions")
            .upsert(
            {
                merchant_id: merchantId,
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: sub.id,
                status: sub.status,
                current_period_end: periodEnd,
                cancel_at_period_end: sub.cancel_at_period_end,
            } as never,
            { onConflict: "merchant_id" },
        )

        if (upsertError) {
            return (
                <ErrorView message="Impossible de confirmer le paiement. Si vous avez été débité, contactez le support." />
            )
        }
    } catch {
        return (
            <ErrorView message="Impossible de confirmer le paiement. Si vous avez été débité, contactez le support." />
        )
    }

    redirect("/dashboard")
}

function ErrorView({ message }: { message: string }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-surface-base px-4">
            <div className="w-full max-w-sm rounded-2xl border border-border-default bg-surface-card p-8 text-center shadow-sm">
                <AlertCircle
                    size={40}
                    className="mx-auto mb-4 text-feedback-error"
                    aria-hidden="true"
                />
                <h1 className="mb-2 text-lg font-semibold text-text-primary">
                    Une erreur est survenue
                </h1>
                <p className="mb-6 text-sm text-text-secondary">{message}</p>
                <Link
                    href="/subscribe"
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                >
                    Retourner à l&apos;abonnement
                </Link>
            </div>
        </div>
    )
}
