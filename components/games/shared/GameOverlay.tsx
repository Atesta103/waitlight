"use client"

import { motion, useReducedMotion } from "framer-motion"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils/cn"

interface GameOverlayProps {
    title: string
    subtitle?: string
    score?: number
    scoreLabel?: string
    onRestart: () => void
    className?: string
}

export function GameOverlay({
    title,
    subtitle,
    score,
    scoreLabel = "Score",
    onRestart,
    className,
}: GameOverlayProps) {
    const router = useRouter()
    const prefersReduced = useReducedMotion()

    return (
        <motion.div
            className={cn(
                "absolute inset-0 flex flex-col items-center justify-center",
                "bg-black/70 backdrop-blur-sm rounded-lg z-10",
                className,
            )}
            initial={prefersReduced ? { opacity: 1 } : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
        >
            <div className="bg-surface-card rounded-2xl p-8 mx-4 flex flex-col items-center gap-4 shadow-xl max-w-xs w-full">
                <h2 className="text-2xl font-bold text-text-primary">{title}</h2>

                {subtitle && (
                    <p className="text-sm text-text-secondary text-center">{subtitle}</p>
                )}

                {score !== undefined && (
                    <div className="flex flex-col items-center">
                        <span className="text-4xl font-bold text-brand-primary">{score}</span>
                        <span className="text-xs text-text-secondary mt-1">{scoreLabel}</span>
                    </div>
                )}

                <div className="flex flex-col gap-2 w-full mt-2">
                    <button
                        onClick={onRestart}
                        className="w-full py-3 bg-brand-primary text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
                    >
                        Rejouer
                    </button>
                    <button
                        onClick={() => router.back()}
                        className="w-full py-3 bg-surface-base text-text-secondary rounded-xl font-semibold text-sm hover:bg-surface-card border border-border-default transition-colors"
                    >
                        Retour aux jeux
                    </button>
                </div>
            </div>
        </motion.div>
    )
}
