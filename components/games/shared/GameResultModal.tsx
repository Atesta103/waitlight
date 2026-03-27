"use client"

import { motion, useReducedMotion } from "framer-motion"
import { useRouter } from "next/navigation"

export type GameOutcome = "win" | "lose" | "draw"

interface GameResultModalProps {
    outcome: GameOutcome
    title: string
    subtitle?: string
    score?: number
    scoreLabel?: string
    onRestart?: () => void
    restartLabel?: string
    onExit?: () => void
    exitLabel?: string
}

const PARTICLE_COLORS = [
    "#818cf8", "#f472b6", "#34d399", "#fbbf24",
    "#60a5fa", "#f87171", "#a78bfa", "#fb923c",
    "#4ade80", "#e879f9",
]

function WinParticles() {
    return (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {PARTICLE_COLORS.map((color, i) => {
                const angle = (i / PARTICLE_COLORS.length) * Math.PI * 2
                const dist = 55 + (i % 3) * 18
                return (
                    <motion.div
                        key={i}
                        className="absolute rounded-full"
                        style={{ background: color, width: i % 2 === 0 ? 10 : 7, height: i % 2 === 0 ? 10 : 7 }}
                        initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                        animate={{
                            x: Math.cos(angle) * dist,
                            y: Math.sin(angle) * dist,
                            scale: [0, 1.4, 1],
                            opacity: [1, 1, 0],
                        }}
                        transition={{ duration: 0.65, delay: 0.15 + i * 0.04, ease: "easeOut" }}
                    />
                )
            })}
        </div>
    )
}

export function GameResultModal({
    outcome,
    title,
    subtitle,
    score,
    scoreLabel = "Score",
    onRestart,
    restartLabel = "Rejouer",
    onExit,
    exitLabel,
}: GameResultModalProps) {
    const router = useRouter()
    const prefersReduced = useReducedMotion()

    const emoji = outcome === "win" ? "🏆" : outcome === "draw" ? "🤝" : "💥"
    const defaultExitLabel = exitLabel ?? "Retour aux jeux"

    const handleExit = () => {
        if (onExit) onExit()
        else router.back()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0">
            {/* Backdrop */}
            <motion.div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
            />

            {/* Card */}
            <motion.div
                className="relative w-full max-w-sm bg-surface-card rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-5 overflow-hidden"
                initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 72, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 340, damping: 26, delay: 0.06 }}
            >
                {/* Emoji + burst particles */}
                <div className="relative flex items-center justify-center w-28 h-28">
                    {outcome === "win" && !prefersReduced && <WinParticles />}
                    <motion.span
                        className="text-7xl select-none relative z-10"
                        initial={prefersReduced ? {} : { scale: 0, rotate: -15 }}
                        animate={prefersReduced ? {} : {
                            scale: [0, 1.35, 0.9, 1.1, 1],
                            rotate: [-15, 8, -4, 4, 0],
                        }}
                        transition={{ delay: 0.18, duration: 0.55, ease: "easeOut" }}
                    >
                        {emoji}
                    </motion.span>
                </div>

                {/* Title */}
                <motion.div
                    className="flex flex-col items-center gap-1.5 text-center"
                    initial={prefersReduced ? {} : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.32, duration: 0.25 }}
                >
                    <h2 className="text-2xl font-bold text-text-primary">{title}</h2>
                    {subtitle && (
                        <p className="text-sm text-text-secondary">{subtitle}</p>
                    )}
                </motion.div>

                {/* Score */}
                {score !== undefined && (
                    <motion.div
                        className="flex flex-col items-center bg-surface-base rounded-2xl px-10 py-3 w-full"
                        initial={prefersReduced ? {} : { opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 22 }}
                    >
                        <span className="text-4xl font-bold text-brand-primary">{score}</span>
                        <span className="text-xs text-text-secondary mt-0.5">{scoreLabel}</span>
                    </motion.div>
                )}

                {/* Actions */}
                <motion.div
                    className="flex flex-col gap-2.5 w-full mt-1"
                    initial={prefersReduced ? {} : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.44, duration: 0.22 }}
                >
                    {onRestart && (
                        <button
                            onClick={onRestart}
                            className="w-full py-3.5 bg-brand-primary text-white rounded-xl font-semibold text-sm active:opacity-80 transition-opacity"
                        >
                            {restartLabel}
                        </button>
                    )}
                    <button
                        onClick={handleExit}
                        className="w-full py-3.5 bg-surface-base border border-border-default text-text-secondary rounded-xl font-semibold text-sm active:opacity-80 transition-opacity"
                    >
                        {defaultExitLabel}
                    </button>
                </motion.div>
            </motion.div>
        </div>
    )
}
