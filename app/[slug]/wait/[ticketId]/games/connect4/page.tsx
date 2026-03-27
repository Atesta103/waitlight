"use client"

import { use } from "react"
import { GameShell } from "@/components/games/shared/GameShell"
import { Connect4Lobby } from "@/components/games/connect4/Connect4Lobby"

type Props = {
    params: Promise<{ slug: string; ticketId: string }>
}

export default function Connect4Page({ params }: Props) {
    const { slug, ticketId } = use(params)
    return (
        <GameShell title="Puissance 4">
            <Connect4Lobby merchantId={slug} ticketId={ticketId} />
        </GameShell>
    )
}
