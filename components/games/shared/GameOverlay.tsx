"use client"

import { GameResultModal, type GameOutcome } from "./GameResultModal"

interface GameOverlayProps {
    outcome: GameOutcome
    title: string
    subtitle?: string
    score?: number
    scoreLabel?: string
    onRestart: () => void
    className?: string
}

/** Thin wrapper kept for backwards-compat with solo games (Snake, Flappy, 2048). */
export function GameOverlay({ outcome, title, subtitle, score, scoreLabel, onRestart }: GameOverlayProps) {
    return (
        <GameResultModal
            outcome={outcome}
            title={title}
            subtitle={subtitle}
            score={score}
            scoreLabel={scoreLabel}
            onRestart={onRestart}
        />
    )
}
