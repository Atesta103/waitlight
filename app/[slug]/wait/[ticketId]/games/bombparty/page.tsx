import { GameShell } from "@/components/games/shared/GameShell"
import { BombPartyLobby } from "@/components/games/bombparty/BombPartyLobby"
import { createClient } from "@/lib/supabase/server"

type Props = {
    params: Promise<{ slug: string; ticketId: string }>
}

export default async function BombPartyPage({ params }: Props) {
    const { slug, ticketId } = await params
    const supabase = await createClient()
    const { data: ticket } = await supabase
        .from("queue_items")
        .select("customer_name")
        .eq("id", ticketId)
        .single()

    return (
        <GameShell title="Bomb Party">
            <BombPartyLobby
                merchantId={slug}
                ticketId={ticketId}
                myName={ticket?.customer_name ?? "Joueur"}
            />
        </GameShell>
    )
}
