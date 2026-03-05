import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { getQueueAction } from "@/lib/actions/queue"
import { QueueSection } from "./QueueSection"

export const metadata: Metadata = {
    title: "Tableau de bord — Wait-Light",
}

/**
 * Dashboard queue page — main merchant control center.
 *
 * Server Component: fetches initial merchant + queue data, then passes to the
 * QueueSection client organism which subscribes to Realtime for live updates.
 */
export default async function DashboardPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Fetch merchant profile (name, open state)
    const { data: merchant } = await supabase
        .from("merchants")
        .select("id, name, is_open")
        .eq("id", user!.id)
        .single()

    // Fetch initial active queue for SSR hydration
    const queueResult = await getQueueAction()
    const initialItems = "data" in queueResult ? queueResult.data : []

    if (!merchant) {
        return null // layout already redirects if not found
    }

    return (
        <QueueSection
            merchantId={merchant.id}
            merchantName={merchant.name}
            initialIsOpen={merchant.is_open}
            initialItems={initialItems}
        />
    )
}
