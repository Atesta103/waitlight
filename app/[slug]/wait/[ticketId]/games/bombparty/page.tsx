"use client"

import { use } from "react"
import { GameShell } from "@/components/games/shared/GameShell"
import { BombPartyLobby } from "@/components/games/bombparty/BombPartyLobby"

type Props = {
    params: Promise<{ slug: string; ticketId: string }>
}

export default function BombPartyPage({ params }: Props) {
    const { slug, ticketId } = use(params)
    return (
        <GameShell title="Bomb Party">
            <BombPartyLobby merchantId={slug} ticketId={ticketId} />
        </GameShell>
    )
}
