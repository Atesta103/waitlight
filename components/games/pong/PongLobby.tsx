"use client"

import { useState } from "react"
import { MultiplayerLobby } from "@/components/games/shared/MultiplayerLobby"
import { PongGame } from "./PongGame"

interface PongLobbyProps {
    merchantId: string
    ticketId: string
}

export function PongLobby({ merchantId, ticketId }: PongLobbyProps) {
    const [game, setGame] = useState<{ roomCode: string; playerNum: 1 | 2 } | null>(null)

    if (game) {
        return (
            <PongGame
                merchantId={merchantId}
                roomCode={game.roomCode}
                playerNum={game.playerNum}
                onExit={() => setGame(null)}
            />
        )
    }

    return (
        <MultiplayerLobby
            gameType="pong"
            gameEmoji="🏓"
            gameTitle="Pong"
            gameDescription="Affronte un autre joueur en temps réel. Raquette du bas vs raquette du haut."
            merchantId={merchantId}
            ticketId={ticketId}
            onGameStart={(roomCode, playerNum) => setGame({ roomCode, playerNum })}
        />
    )
}
