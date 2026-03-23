/**
 * @module api/webhooks/stripe
 * @category API
 *
 * Stripe webhook endpoint.
 * Verifies the Stripe-Signature header before processing any event.
 * All DB writes use the service_role admin client (bypasses RLS).
 * Every handler is idempotent — safe to replay.
 *
 * NOTE: Stripe API v2025 moved current_period_end from Subscription to
 * SubscriptionItem (sub.items.data[0].current_period_end) and replaced
 * Invoice.subscription with Invoice.parent.subscription_details.subscription.
 */
import { NextResponse } from "next/server"
import type Stripe from "stripe"
import { stripe } from "@/lib/stripe"
import { adminSupabase } from "@/lib/supabase/admin"

// Disable Next.js body parsing — Stripe requires the raw body for signature verification.
export const dynamic = "force-dynamic"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function subPeriodEnd(sub: Stripe.Subscription): string | null {
    const item = sub.items.data[0]
    if (!item) return null
    return new Date(item.current_period_end * 1000).toISOString()
}

function invoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
    const subRef =
        invoice.parent?.subscription_details?.subscription ?? null
    if (!subRef) return null
    return typeof subRef === "string" ? subRef : subRef.id
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
    const body = await request.text()
    const sig = request.headers.get("stripe-signature")

    if (!sig) {
        return NextResponse.json(
            { error: "Missing stripe-signature header" },
            { status: 400 },
        )
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
        console.error("STRIPE_WEBHOOK_SECRET is not set")
        return NextResponse.json(
            { error: "Webhook secret not configured" },
            { status: 500 },
        )
    }

    let event: Stripe.Event
    try {
        event = stripe.webhooks.constructEvent(
            body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET,
        )
    } catch {
        return NextResponse.json(
            { error: "Webhook signature verification failed" },
            { status: 400 },
        )
    }

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session
                if (session.mode !== "subscription") break

                const merchantId = session.metadata?.merchant_id
                if (!merchantId) break

                const sub = await stripe.subscriptions.retrieve(
                    session.subscription as string,
                    { expand: ["items"] },
                )

                const { error: upsertError } = await adminSupabase
                    .from("subscriptions")
                    .upsert(
                    {
                        merchant_id: merchantId,
                        stripe_customer_id: session.customer as string,
                        stripe_subscription_id: sub.id,
                        status: sub.status,
                        current_period_end: subPeriodEnd(sub),
                        cancel_at_period_end: sub.cancel_at_period_end,
                    } as never,
                    { onConflict: "merchant_id" },
                )

                if (upsertError) throw upsertError
                break
            }

            case "customer.subscription.updated": {
                const sub = event.data.object as Stripe.Subscription
                const merchantId = sub.metadata?.merchant_id

                const payload = {
                    status: sub.status,
                    current_period_end: subPeriodEnd(sub),
                    cancel_at_period_end: sub.cancel_at_period_end,
                } as never

                if (merchantId) {
                    const { error } = await adminSupabase
                        .from("subscriptions")
                        .update(payload)
                        .eq("merchant_id", merchantId)
                    if (error) throw error
                } else {
                    const { error } = await adminSupabase
                        .from("subscriptions")
                        .update(payload)
                        .eq("stripe_subscription_id", sub.id)
                    if (error) throw error
                }
                break
            }

            case "customer.subscription.deleted": {
                const sub = event.data.object as Stripe.Subscription
                const { error } = await adminSupabase
                    .from("subscriptions")
                    .update({ status: "canceled" } as never)
                    .eq("stripe_subscription_id", sub.id)
                if (error) throw error
                break
            }

            case "invoice.payment_succeeded": {
                const invoice = event.data.object as Stripe.Invoice
                const subId = invoiceSubscriptionId(invoice)
                if (!subId) break

                const sub = await stripe.subscriptions.retrieve(subId, {
                    expand: ["items"],
                })
                const { error } = await adminSupabase
                    .from("subscriptions")
                    .update({
                        status: "active",
                        current_period_end: subPeriodEnd(sub),
                    } as never)
                    .eq("stripe_subscription_id", sub.id)
                if (error) throw error
                break
            }

            case "invoice.payment_failed": {
                const invoice = event.data.object as Stripe.Invoice
                const subId = invoiceSubscriptionId(invoice)
                if (!subId) break

                const { error } = await adminSupabase
                    .from("subscriptions")
                    .update({ status: "past_due" } as never)
                    .eq("stripe_subscription_id", subId)
                if (error) throw error
                break
            }

            default:
                break
        }
    } catch (err) {
        console.error("Webhook handler error:", err)
        // Return 200 to prevent Stripe retries — log internally via monitoring.
    }

    return NextResponse.json({ received: true }, { status: 200 })
}
