import { createClient } from "@/lib/supabase/server"
import { GameLobby } from "@/components/games/GameLobby"

type GamesPageProps = {
    params: Promise<{ slug: string; ticketId: string }>
}

export default async function GamesPage({ params }: GamesPageProps) {
    const { slug, ticketId } = await params
    const supabase = await createClient()
    const { data: merchant } = await supabase
        .from("merchants")
        .select("id, name")
        .eq("slug", slug)
        .single()

    if (!merchant) return <div className="p-8 text-center text-text-secondary">Commerce introuvable</div>

    return (
        <GameLobby
            merchantId={merchant.id}
            ticketId={ticketId}
            slug={slug}
        />
    )
}
