"use client"

import { useState } from "react"
import { MultiplayerLobby } from "@/components/games/shared/MultiplayerLobby"
import { TicTacToeGame } from "./TicTacToeGame"

interface TicTacToeLobbyProps {
    merchantId: string
    ticketId: string
    myName: string
}

export function TicTacToeLobby({ merchantId, ticketId, myName }: TicTacToeLobbyProps) {
    const [game, setGame] = useState<{ roomCode: string; playerNum: 1 | 2 } | null>(null)

    if (game) {
        return (
            <TicTacToeGame
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
            gameType="tictactoe"
            gameEmoji="⭕"
            gameTitle="Tic-Tac-Toe Évaporation"
            gameDescription="Aligne 3 pièces pour gagner. Mais chaque joueur ne peut en avoir que 3 — la plus ancienne s'évapore !"
            merchantId={merchantId}
            ticketId={ticketId}
            onGameStart={(roomCode, playerNum) => setGame({ roomCode, playerNum })}
        />
    )
}
