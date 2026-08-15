import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { getAnalyticsAction } from "@/lib/actions/analytics"
import { AnalyticsDashboard } from "@/components/sections/AnalyticsDashboard"

export const metadata: Metadata = {
    title: "Analytiques — WaitLight",
}

/**
 * Analytics page — Server Component.
 * Fetches pre-aggregated analytics rows for SSR hydration, then passes to the
 * AnalyticsDashboard client organism for interactive charts.
 */
export default async function AnalyticsPage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const analyticsResult = await getAnalyticsAction()
    const initialData =
        "data" in analyticsResult ? analyticsResult.data : []

    // No internal scroll wrapper here (deliberately removed): Analytics is
    // the one dashboard page that scrolls at the page level instead of via a
    // nested container — DashboardShell (app/(dashboard)/layout.tsx) drops
    // the fixed-height/overflow-hidden shell specifically for this route, so
    // the browser's own document scroll takes over here. The header stays
    // pinned throughout via its own fixed (mobile)/sticky (desktop)
    // positioning, not by living inside a clipped/scrolling ancestor.
    return (
        <AnalyticsDashboard merchantId={user!.id} initialData={initialData} />
    )
}
