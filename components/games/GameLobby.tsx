"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, Gamepad2 } from "lucide-react"
import { GAMES } from "./shared/types"
import { cn } from "@/lib/utils/cn"

interface GameLobbyProps {
    merchantId: string
    ticketId: string
    slug: string
}

export function GameLobby({ ticketId, slug }: GameLobbyProps) {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-surface-base flex flex-col">
            {/* Header */}
            <div className="px-4 pt-4">
                <header className="flex items-center gap-3 rounded-xl border border-border-default bg-surface-card px-4 py-3">
                    <button
                        onClick={() => router.push(`/${slug}/wait/${ticketId}`)}
                        className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface-base transition-colors shrink-0"
                        aria-label="Retour à la salle d'attente"
                    >
                        <ArrowLeft className="w-5 h-5 text-text-primary" />
                    </button>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-primary">
                        <Gamepad2 size={15} className="text-white" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                        <h1 className="font-semibold text-text-primary truncate">Jeux</h1>
                        <p className="text-xs text-text-secondary">Patiente en t'amusant !</p>
                    </div>
                </header>
            </div>

            {/* Game grid */}
            <main className="flex-1 p-4">
                <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                    {GAMES.map((game) => (
                        <button
                            key={game.id}
                            onClick={() => router.push(`/${slug}/wait/${ticketId}/games/${game.id}`)}
                            className={cn(
                                "bg-surface-card border border-border-default rounded-2xl p-4 flex flex-col gap-2",
                                "text-left hover:border-brand-primary hover:shadow-md transition-all",
                                "active:scale-95",
                            )}
                        >
                            {/* Emoji */}
                            <div className="text-4xl leading-none">{game.emoji}</div>

                            {/* Title */}
                            <div className="font-semibold text-text-primary text-sm">{game.title}</div>

                            {/* Description */}
                            <div className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                                {game.description}
                            </div>

                            {/* Badges */}
                            <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
                                <span
                                    className={cn(
                                        "text-xs px-2 py-0.5 rounded-full font-medium",
                                        game.mode === "solo"
                                            ? "bg-indigo-100 text-indigo-700"
                                            : "bg-amber-100 text-amber-700",
                                    )}
                                >
                                    {game.mode === "solo" ? "Solo" : "Multijoueur"}
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-surface-base text-text-secondary border border-border-default">
                                    {game.avgDuration}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </main>
        </div>
    )
}
