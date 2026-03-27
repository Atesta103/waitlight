"use client"

import { use } from "react"
import { GameShell } from "@/components/games/shared/GameShell"
import { FlappyGame } from "@/components/games/flappy/FlappyGame"

type Props = {
    params: Promise<{ slug: string; ticketId: string }>
}

export default function FlappyPage({ params }: Props) {
    const { slug: _slug, ticketId: _ticketId } = use(params)
    return (
        <GameShell title="Flappy Bird">
            <FlappyGame />
        </GameShell>
    )
}
