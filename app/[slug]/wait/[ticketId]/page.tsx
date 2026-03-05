import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { WaitClient } from "./WaitClient"

type WaitPageProps = {
    params: Promise<{ slug: string; ticketId: string }>
}

/**
 * Server component for /[slug]/wait/[ticketId].
 * Fetches merchant data and passes ticketId to client component.
 */
export default async function WaitPage({ params }: WaitPageProps) {
    const { slug, ticketId } = await params

    const supabase = await createClient()

    const { data: merchant } = await supabase
        .from("merchants")
        .select("id, name, slug, default_prep_time_min")
        .eq("slug", slug)
        .single()

    if (!merchant) {
        notFound()
    }

    return (
        <WaitClient
            merchant={merchant}
            ticketId={ticketId}
        />
    )
}
