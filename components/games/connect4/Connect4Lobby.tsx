"use client"

import { useState } from "react"
import { MultiplayerLobby } from "@/components/games/shared/MultiplayerLobby"
import { Connect4Game } from "./Connect4Game"

interface Connect4LobbyProps {
    merchantId: string
    ticketId: string
    myName: string
}

export function Connect4Lobby({ merchantId, ticketId, myName }: Connect4LobbyProps) {
    const [game, setGame] = useState<{ roomCode: string; playerNum: 1 | 2 } | null>(null)

    if (game) {
        return (
            <Connect4Game
                merchantId={merchantId}
                roomCode={game.roomCode}
                playerNum={game.playerNum}
                myName={myName}
                onExit={() => setGame(null)}
            />
        )
    }

    return (
        <MultiplayerLobby
            gameType="connect4"
            gameEmoji="🔴"
            gameTitle="Puissance 4"
            gameDescription="Aligne 4 jetons avant ton adversaire. Rouge = Joueur 1, Jaune = Joueur 2."
            merchantId={merchantId}
            ticketId={ticketId}
            onGameStart={(roomCode, playerNum) => setGame({ roomCode, playerNum })}
        />
    )
}
