"use client"

import { useState } from "react"
import { MultiplayerLobby } from "@/components/games/shared/MultiplayerLobby"
import { BombPartyGame } from "./BombPartyGame"

interface BombPartyLobbyProps {
    merchantId: string
    ticketId: string
}

export function BombPartyLobby({ merchantId, ticketId }: BombPartyLobbyProps) {
    const [game, setGame] = useState<{ roomCode: string; playerNum: 1 | 2 } | null>(null)

    if (game) {
        return (
            <BombPartyGame
                merchantId={merchantId}
                roomCode={game.roomCode}
                playerNum={game.playerNum}
                onExit={() => setGame(null)}
            />
        )
    }

    return (
        <MultiplayerLobby
            gameType="bombparty"
            gameEmoji="💣"
            gameTitle="Bomb Party"
            gameDescription="Trouve un mot contenant la syllabe affichée avant que la bombe explose ! 3 vies chacun."
            merchantId={merchantId}
            ticketId={ticketId}
            onGameStart={(roomCode, playerNum) => setGame({ roomCode, playerNum })}
        />
    )
}
