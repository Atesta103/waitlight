"use client"

import { use } from "react"
import { GameShell } from "@/components/games/shared/GameShell"
import { PongLobby } from "@/components/games/pong/PongLobby"

type Props = {
    params: Promise<{ slug: string; ticketId: string }>
}

export default function PongPage({ params }: Props) {
    const { slug, ticketId } = use(params)
    return (
        <GameShell title="Pong">
            <PongLobby merchantId={slug} ticketId={ticketId} />
        </GameShell>
    )
}
