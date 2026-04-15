import { GameShell } from "@/components/games/shared/GameShell"
import { Connect4Lobby } from "@/components/games/connect4/Connect4Lobby"
import { createClient } from "@/lib/supabase/server"

type Props = {
    params: Promise<{ slug: string; ticketId: string }>
}

export default async function Connect4Page({ params }: Props) {
    const { slug, ticketId } = await params
    const supabase = await createClient()
    const { data: ticket } = await supabase
        .from("queue_items")
        .select("customer_name")
        .eq("id", ticketId)
        .single()

    return (
        <GameShell title="Puissance 4">
            <Connect4Lobby
                merchantId={slug}
                ticketId={ticketId}
                myName={ticket?.customer_name ?? "Joueur"}
            />
        </GameShell>
    )
}
