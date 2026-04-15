import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { z } from "zod"
import { WaitClient } from "./WaitClient"

type WaitPageProps = {
    params: Promise<{ slug: string; ticketId: string }>
}

// Explicit type that matches WaitClient's Merchant type.
// The `calculated_avg_prep_time` column is added by migration 20260305000001.
// Until Supabase types are regenerated, we cast to this type manually.
type MerchantRow = {
    id: string
    name: string
    slug: string
    default_prep_time_min: number
    calculated_avg_prep_time: number | null
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
        .select("id, name, slug, default_prep_time_min, calculated_avg_prep_time")
        .eq("slug", slug)
        .single()

    if (!data) {
        notFound()
    }

    // Cast to explicit type — column exists after migration 20260305000001
    const merchant = data as unknown as MerchantRow

    return (
        <WaitClient
            merchant={merchant}
            ticketId={ticketId}
        />
    )
}
