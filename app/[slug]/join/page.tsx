import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { JoinClient } from "./JoinClient"

type JoinPageProps = {
    params: Promise<{ slug: string }>
    searchParams: Promise<{ t?: string }>
}

/**
 * Server component for /[slug]/join.
 * Fetches merchant data by slug and delegates to client component.
 */
export default async function JoinPage({ params, searchParams }: JoinPageProps) {
    const { slug } = await params
    const { t: token } = await searchParams

    const supabase = await createClient()

    const { data: merchant } = await supabase
        .from("merchants")
        .select("id, name, slug, is_open, logo_url")
        .eq("slug", slug)
        .single()

    if (!merchant) {
        notFound()
    }

    // Fetch settings for welcome message
    const { data: settings } = await supabase
        .from("settings")
        .select("welcome_message, max_capacity")
        .eq("merchant_id", merchant.id)
        .single()

    return (

        <JoinClient
            merchant={merchant}
            settings={settings}
            token={token ?? null}
        />
    )
}
