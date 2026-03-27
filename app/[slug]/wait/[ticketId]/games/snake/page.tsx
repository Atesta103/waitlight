"use client"

import { use } from "react"
import { GameShell } from "@/components/games/shared/GameShell"
import { SnakeGame } from "@/components/games/snake/SnakeGame"

type Props = {
    params: Promise<{ slug: string; ticketId: string }>
}

export default function SnakePage({ params }: Props) {
    const { slug: _slug, ticketId: _ticketId } = use(params)
    return (
        <GameShell title="Snake">
            <SnakeGame />
        </GameShell>
    )
}
