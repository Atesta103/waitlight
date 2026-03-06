/**
 * @module actions/analytics
 * @category Actions
 *
 * Server Actions for flow prediction & analytics (Feature 08).
 * All queries enforce `merchant_id = auth.uid()` via the RPC — cross-tenant
 * leakage is impossible even without a materialized-view RLS policy.
 */
"use server"

import { createClient } from "@/lib/supabase/server"

export type AnalyticsRow = {
    day_of_week: number       // 0=Sunday … 6=Saturday
    hour: number              // 0–23
    ticket_count: number
    avg_wait_minutes: number | null
}

export type DateRangeInput = {
    start: string | null  // ISO timestamp or null for "all time"
    end: string | null
}

/**
 * Fetch pre-aggregated analytics for the authenticated merchant.
 *
 * - When `range` is omitted or both values are null → queries the
 *   `merchant_analytics_view` materialized view (full history, very fast).
 * - When `range` has date values → calls `get_analytics_range` which queries
 *   `queue_items` directly so date filtering is applied.
 *
 * Returns at most ~168 rows (7 days × 24 hours).
 *
 * **Errors:**
 * | `error` string | Cause |
 * |---|---|
 * | `"Session expirée. Veuillez vous reconnecter."` | No authenticated user |
 * | `"Impossible de charger les statistiques."` | RPC failed |
 */
export async function getAnalyticsAction(
    range?: DateRangeInput,
): Promise<{ data: AnalyticsRow[] } | { error: string }> {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Session expirée. Veuillez vous reconnecter." }
    }

    // Always use get_analytics_range so data is live (no materialized view refresh needed).
    // The materialized view + get_analytics RPC remain available for direct DB use / future optimisation.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.rpc as any).call(
        supabase,
        "get_analytics_range",
        {
            p_merchant_id: user.id,
            p_start: range?.start ?? null,
            p_end: range?.end ?? null,
        },
    )

    if (error) {
        return { error: "Impossible de charger les statistiques." }
    }

    return { data: (data as AnalyticsRow[]) ?? [] }
}
