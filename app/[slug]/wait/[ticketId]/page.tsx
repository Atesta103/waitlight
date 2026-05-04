import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { z } from "zod"
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

    // Validate that the ID is an UUID before making DB queries
    if (!z.string().uuid().safeParse(ticketId).success) {
        notFound()
    }

    const supabase = await createClient()

    const { data } = await supabase
        .from("merchants")
        .select(`
            id, name, slug, background_url, default_prep_time_min, calculated_avg_prep_time,
            business_type,
            settings!inner(
                notification_channels,
                notification_sound,
                approaching_position_enabled,
                approaching_position_threshold,
                approaching_time_enabled,
                approaching_time_threshold_min,
                thank_you_message
            )
        `)
        .eq("slug", slug)
        .single()

    if (!data) {
        notFound()
    }

    // Pass everything correctly formatted to the client
    const merchant = {
        id: data.id,
        name: data.name,
        slug: data.slug,
        background_url: data.background_url,
        business_type: data.business_type,
        default_prep_time_min: data.default_prep_time_min,
        calculated_avg_prep_time: data.calculated_avg_prep_time,
        settings: Array.isArray(data.settings) ? data.settings[0] : data.settings
    }

    return (
        <WaitClient
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            merchant={merchant as any}
            ticketId={ticketId}
        />
    )
}
