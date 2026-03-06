import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { getAnalyticsAction } from "@/lib/actions/analytics"
import { AnalyticsDashboard } from "@/components/sections/AnalyticsDashboard"

export const metadata: Metadata = {
    title: "Analytiques — Wait-Light",
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
        <AnalyticsDashboard
            merchantId={user!.id}
            initialData={initialData}
        />
    )
}
