import { GameShell } from "@/components/games/shared/GameShell"
import { TicTacToeLobby } from "@/components/games/tictactoe/TicTacToeLobby"
import { createClient } from "@/lib/supabase/server"

type Props = {
    params: Promise<{ slug: string; ticketId: string }>
}

export default async function TicTacToePage({ params }: Props) {
    const { slug, ticketId } = await params
    const supabase = await createClient()
    const { data: ticket } = await supabase
        .from("queue_items")
        .select("customer_name")
        .eq("id", ticketId)
        .single()

    return (
        <GameShell title="Tic-Tac-Toe Évaporation">
            <TicTacToeLobby
                merchantId={slug}
                ticketId={ticketId}
                myName={ticket?.customer_name ?? "Joueur"}
            />
        </GameShell>
    )
}
