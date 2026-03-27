"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
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
            <header className="flex items-center gap-3 px-4 py-3 bg-surface-card border-b border-border-default">
                <button
                    onClick={() => router.push(`/${slug}/wait/${ticketId}`)}
                    className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-surface-base transition-colors"
                    aria-label="Retour à la salle d'attente"
                >
                    <ArrowLeft className="w-5 h-5 text-text-primary" />
                </button>
                <div>
                    <h1 className="text-lg font-semibold text-text-primary">Jeux</h1>
                    <p className="text-xs text-text-secondary">Patiente en t'amusant !</p>
                </div>
            </header>

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
