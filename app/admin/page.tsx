import type { Metadata } from "next"
import { adminSupabase } from "@/lib/supabase/admin"
import { stripe } from "@/lib/stripe"
import { AdminDashboard } from "@/components/sections/AdminDashboard"

export const metadata: Metadata = {
    title: "Admin — Wait-Light",
}

/**
 * Admin page — Server Component.
 * Fetches all merchants, subscriptions, charges, and invoices.
 * Access is already guarded by AdminLayout.
 */
export default async function AdminPage() {
    // Fetch all merchants with their subscriptions in one join
    const { data: merchants } = await adminSupabase
        .from("merchants")
        .select("id, name, slug, created_at, bypass_paywall")
        .order("created_at", { ascending: false })

    const { data: subscriptions } = await adminSupabase
        .from("subscriptions")
        .select("*")

    // Fetch recent Stripe charges and invoices (last 100 each)
    const [chargesRes, invoicesRes] = await Promise.allSettled([
        stripe.charges.list({ limit: 100, expand: ["data.customer"] }),
        stripe.invoices.list({ limit: 100, expand: ["data.customer"] }),
    ])

    const charges =
        chargesRes.status === "fulfilled" ? chargesRes.value.data : []
    const invoices =
        invoicesRes.status === "fulfilled" ? invoicesRes.value.data : []

    // Build a map of stripe_customer_id → merchant name for display
    type SubRow = {
        merchant_id: string
        stripe_customer_id: string
        [key: string]: unknown
    }
    type MerchantRow = {
        id: string
        name: string
        slug: string
        created_at: string
        bypass_paywall: boolean
    }
    const customerToMerchant: Record<string, string> = {}
    for (const sub of (subscriptions ?? []) as SubRow[]) {
        const merchant = ((merchants ?? []) as MerchantRow[]).find(
            (m) => m.id === sub.merchant_id,
        )
        if (merchant) {
            customerToMerchant[sub.stripe_customer_id] = merchant.name
        }
    }

    return (
        <AdminDashboard
            merchants={(merchants ?? []) as MerchantRow[]}
            subscriptions={(subscriptions ?? []) as never}
            charges={charges}
            invoices={invoices}
            customerToMerchant={customerToMerchant}
        />
    )
}
