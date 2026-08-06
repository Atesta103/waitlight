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

    return (
        // h-full + min-h-0 + overflow-y-auto: <main> in the dashboard layout no
        // longer scrolls itself (that was removed as responsive groundwork), so
        // this page needs its own scroll container — otherwise content taller
        // than the viewport would be clipped by #dashboard-root's
        // overflow-hidden with no way to reach it. Mirrors the queue page's
        // internal-scroll pattern (h-full inside the flex column).
        <div className="h-full min-h-0 overflow-y-auto">
            <AnalyticsDashboard
                merchantId={user!.id}
                initialData={initialData}
            />
        </div>
    )
}
