/**
 * @module actions/export
 * @category Actions
 *
 * Server Action for GDPR data export.
 * Returns all merchant-owned data in a single structured object.
 * RLS enforces tenant isolation — no cross-merchant data possible.
 */
"use server"

import { requireAuth } from "@/lib/supabase/require-auth"

export type TicketExport = {
    id: string
    customer_name: string
    entry_source: "qr" | "manual"
    status: "waiting" | "called" | "done" | "cancelled"
    joined_at: string
    called_at: string | null
    done_at: string | null
}

export type AnalyticsExport = {
    day_of_week: number
    hour: number
    ticket_count: number
    avg_wait_minutes: number | null
}

export type MerchantExport = {
    exported_at: string
    profile: {
        id: string
        name: string
        slug: string
        business_type: string
        created_at: string
        logo_url: string | null
        brand_color: string | null
        font_family: string | null
        border_radius: string | null
    }
    settings: {
        max_capacity: number
        welcome_message: string | null
        thank_you_title: string | null
        thank_you_message: string | null
        notifications_enabled: boolean
        auto_close_enabled: boolean
        schedule: unknown
    }
    tickets: TicketExport[]
    analytics: AnalyticsExport[]
    subscription: {
        status: string
        trial_end: string | null
        current_period_end: string | null
        cancel_at_period_end: boolean
    } | null
}

/**
 * Aggregate all merchant data for GDPR export.
 *
 * Fetches profile, settings, full ticket history (all statuses),
 * analytics, and subscription in parallel.
 *
 * **Errors:**
 * | `error` string | Cause |
 * |---|---|
 * | `"Session expirée. Veuillez vous reconnecter."` | No authenticated user |
 * | `"Impossible de récupérer vos données."` | One or more DB queries failed |
 */
export async function exportMerchantDataAction(): Promise<
    { data: MerchantExport } | { error: string }
> {
    const { supabase, user } = await requireAuth()

    const [merchantRes, settingsRes, ticketsRes, analyticsRes, subRes] =
        await Promise.all([
            supabase
                .from("merchants")
                .select(
                    "id, name, slug, business_type, created_at, logo_url, brand_color, font_family, border_radius",
                )
                .eq("id", user.id)
                .single(),

            supabase
                .from("settings")
                .select(
                    "max_capacity, welcome_message, thank_you_title, thank_you_message, notifications_enabled, auto_close_enabled, schedule",
                )
                .eq("merchant_id", user.id)
                .single(),

            supabase
                .from("queue_items")
                .select(
                    "id, customer_name, entry_source, status, joined_at, called_at, done_at",
                )
                .eq("merchant_id", user.id)
                .order("joined_at", { ascending: false }),

            supabase.rpc("get_analytics_range", {
                p_merchant_id: user.id,
                p_start: undefined,
                p_end: undefined,
            }),

            supabase
                .from("subscriptions")
                .select("status, trial_end, current_period_end, cancel_at_period_end")
                .eq("merchant_id", user.id)
                .maybeSingle(),
        ])

    if (merchantRes.error || !merchantRes.data) {
        console.error("[exportMerchantDataAction] merchant error:", merchantRes.error?.message)
        return { error: "Impossible de récupérer vos données." }
    }
    if (settingsRes.error || !settingsRes.data) {
        console.error("[exportMerchantDataAction] settings error:", settingsRes.error?.message)
        return { error: "Impossible de récupérer vos données." }
    }
    if (ticketsRes.error) {
        console.error("[exportMerchantDataAction] tickets error:", ticketsRes.error.message)
        return { error: "Impossible de récupérer vos données." }
    }
    if (analyticsRes.error) {
        console.error("[exportMerchantDataAction] analytics error:", analyticsRes.error.message)
        return { error: "Impossible de récupérer vos données." }
    }

    const m = merchantRes.data
    const s = settingsRes.data

    return {
        data: {
            exported_at: new Date().toISOString(),
            profile: {
                id: m.id,
                name: m.name,
                slug: m.slug,
                business_type: m.business_type,
                created_at: m.created_at,
                logo_url: m.logo_url,
                brand_color: m.brand_color,
                font_family: m.font_family,
                border_radius: m.border_radius,
            },
            settings: {
                max_capacity: s.max_capacity,
                welcome_message: s.welcome_message,
                thank_you_title: s.thank_you_title,
                thank_you_message: s.thank_you_message,
                notifications_enabled: s.notifications_enabled,
                auto_close_enabled: s.auto_close_enabled,
                schedule: s.schedule,
            },
            tickets: (ticketsRes.data ?? []) as TicketExport[],
            analytics: (analyticsRes.data ?? []) as AnalyticsExport[],
            subscription: subRes.data
                ? {
                      status: subRes.data.status,
                      trial_end: subRes.data.trial_end,
                      current_period_end: subRes.data.current_period_end,
                      cancel_at_period_end: subRes.data.cancel_at_period_end,
                  }
                : null,
        },
    }
}
