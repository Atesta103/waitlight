"use client"

import { use } from "react"
import { GameShell } from "@/components/games/shared/GameShell"
import { Game2048 } from "@/components/games/2048/Game2048"

type Props = {
    params: Promise<{ slug: string; ticketId: string }>
}

export default function Game2048Page({ params }: Props) {
    const { slug: _slug, ticketId: _ticketId } = use(params)
    return (
        <GameShell title="2048">
            <Game2048 />
        </GameShell>
    )
}
