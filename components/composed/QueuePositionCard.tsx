"use client"

import { useRef, useEffect, useState, useLayoutEffect } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { QueueDot } from "@/components/ui/QueueDot"
import { Skeleton } from "@/components/ui/Skeleton"
import { StatusBanner } from "./StatusBanner"
import { Clock, ChevronUp, CalendarClock, BellRing } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { getBusinessWording } from "@/lib/utils/business-wording"

type QueuePositionCardProps = {
    /** 1-based position (1 = next to be called, 0 = "it's your turn") */
    position: number | null
    /** total people currently waiting (including you) */
    totalWaiting: number | null
    /** estimated wait in minutes */
    estimatedMinutes: number | null
    businessType?: string | null
    className?: string
}

const MAX_DOTS_AHEAD = 5
const MAX_DOTS_BEHIND = 3

/* ─── Helper: displays the wall-clock time when the customer should be called ───
 * Date.now() is called only on the client (useEffect) to avoid SSR/hydration mismatch.
 */
function EstimatedClockTime({ minutes }: { minutes: number }) {
    // useLayoutEffect: not subject to react-hooks/set-state-in-effect,
    // runs after paint (client only) — avoids SSR/hydration mismatch.
    const [formatted, setFormatted] = useState("")

    useLayoutEffect(() => {
        const eta = new Date(Date.now() + minutes * 60_000)
        // eslint-disable-next-line react-hooks/set-state-in-effect -- useLayoutEffect is intentional: reads Date.now() after mount to avoid SSR hydration mismatch
        setFormatted(
            eta.toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            }),
        )
    }, [minutes])

    if (!formatted) return null

    return (
        <div
            className="flex items-center gap-1.5 rounded-md bg-brand-secondary/15 px-2 py-1 text-xs font-medium text-brand-primary"
            aria-label={`Heure estimée de votre passage : ${formatted}`}
        >
            <CalendarClock size={13} aria-hidden="true" />
            <span>Votre tour vers {formatted}</span>
        </div>
    )
}

/* ─── Helper: color-coded time pill based on urgency ──────────────────────── */
function TimePill({ minutes }: { minutes: number }) {
    // Urgency thresholds
    const isImmediate = minutes < 1          // < 1 min  → pulsing red
    const isUrgent   = minutes <= 5          // ≤ 5 min  → orange
    // > 10 min stays with the default secondary style

    const label = isImmediate
        ? "Moins d'une minute"
        : minutes === 1
          ? "~1 minute"
          : `~${minutes} min`

    return (
        <div
            className={cn(
                "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium",
                isImmediate
                    ? "animate-pulse bg-feedback-error/15 text-feedback-error"
                    : isUrgent
                      ? "bg-feedback-warning/15 text-feedback-warning"
                      : "text-text-secondary",
            )}
        >
            <Clock size={13} aria-hidden="true" />
            <span>{label}</span>
        </div>
    )
}


function QueuePositionCard({
    position,
    totalWaiting,
    estimatedMinutes,
    businessType,
    className,
}: QueuePositionCardProps) {
    const prefersReduced = useReducedMotion()
    const wording = getBusinessWording(businessType)
    const prevPositionRef = useRef<number | null>(null)
    const [showAdvance, setShowAdvance] = useState(false)
    const [direction, setDirection] = useState<1 | -1>(1)

    // Detect forward movement to briefly show the ↑ badge and track direction
    useEffect(() => {
        const prev = prevPositionRef.current
        let t1: ReturnType<typeof setTimeout>
        let t2: ReturnType<typeof setTimeout>

        if (prev !== null && position !== null && position < prev) {
            // Defer to avoid synchronous setState inside effect
            t1 = setTimeout(() => {
                setShowAdvance(true)
                setDirection(-1)
            }, 0)
            t2 = setTimeout(() => setShowAdvance(false), 1800)
            prevPositionRef.current = position
            return () => { clearTimeout(t1); clearTimeout(t2) }
        } else if (position !== null) {
            t1 = setTimeout(() => setDirection(1), 0)
            return () => clearTimeout(t1)
        }
        prevPositionRef.current = position
    }, [position])

    if (position === null || totalWaiting === null) {
        return (
            <div className={cn("flex items-center gap-6", className)}>
                <div className="flex flex-col items-center gap-1.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton
                            key={i}
                            className={cn(
                                "rounded-full",
                                i === 2 ? "h-4 w-4" : "h-2.5 w-2.5",
                            )}
                        />
                    ))}
                </div>
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-20" />
                </div>
            </div>
        )
    }

    // ── Special layout when customer is first in line ────────────────────────
    if (position === 0) {
        return (
            <motion.div
                key="next-up"
                initial={prefersReduced ? false : { opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={prefersReduced ? { duration: 0 } : { type: "spring", stiffness: 350, damping: 25 }}
                className={cn(
                    "flex w-full flex-col items-center gap-4 rounded-2xl border border-feedback-success-bg bg-feedback-success-bg px-6 py-8 text-center",
                    className,
                )}
                aria-live="polite"
            >
                <motion.div
                    animate={prefersReduced ? {} : { scale: [1, 1.15, 1] }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-card"
                >
                    <BellRing size={28} className="text-feedback-success" aria-hidden="true" />
                </motion.div>

                <div className="flex flex-col gap-1">
                    <p className="text-lg font-bold text-text-primary">
                        Vous êtes le/la prochain-e !
                    </p>
                    <p className="text-sm text-text-secondary">
                        Restez prêt·e, on va vous appeler d&apos;un instant à l&apos;autre.
                    </p>
                </div>

                <div
                    className="flex items-center gap-1.5 animate-pulse rounded-full bg-surface-card px-3 py-1.5 text-xs font-semibold text-feedback-success"
                >
                    <Clock size={12} aria-hidden="true" />
                    <span>D&apos;un instant à l&apos;autre…</span>
                </div>
            </motion.div>
        )
    }

    // People strictly ahead
    const aheadCount = position
    // People behind you
    const behindCount = Math.max(0, (totalWaiting || position) - position)

    // Dots to render above your dot
    const dotsAhead = Math.min(aheadCount, MAX_DOTS_AHEAD)
    const hasMoreAhead = aheadCount > MAX_DOTS_AHEAD

    // Dots to render below your dot
    const dotsBehind = Math.min(behindCount, MAX_DOTS_BEHIND)
    const hasMoreBehind = behindCount > MAX_DOTS_BEHIND

    return (
        <div className="flex w-full flex-col gap-6">
            {position <= 1 && (
                <StatusBanner
                    variant="next"
                    title={position === 0 ? "Vous êtes le/la prochain-e !" : "Préparez-vous !"}
                    description={
                        position === 0
                            ? "On va bientôt vous appeler."
                            : "Il ne reste qu'une personne avant vous."
                    }
                />
            )}
            <div className={cn("flex items-center gap-6", className)}>
                {/* ─── Rail ─── */}
            <div className="flex flex-col items-center gap-1.5">
                {hasMoreAhead && (
                    <span className="text-[10px] leading-none text-text-disabled">
                        ···
                    </span>
                )}
                {Array.from({ length: dotsAhead }).map((_, i) => (
                    <QueueDot key={`ahead-${i}`} variant="ahead" />
                ))}

                {/* Your dot */}
                <motion.div
                    layout={!prefersReduced}
                    transition={
                        prefersReduced
                            ? { duration: 0 }
                            : { type: "spring", stiffness: 300, damping: 28 }
                    }
                >
                    <QueueDot variant="you" />
                </motion.div>

                {Array.from({ length: dotsBehind }).map((_, i) => (
                    <QueueDot key={`behind-${i}`} variant="behind" />
                ))}
                {hasMoreBehind && (
                    <span className="text-[10px] leading-none text-text-disabled">
                        ···
                    </span>
                )}
            </div>

            {/* ─── Info panel ─── */}
            <div className="flex flex-col gap-1">
                {/* Rank number — odometer animation */}
                <div className="relative flex items-end gap-2">
                    <div
                        className="overflow-hidden"
                        style={{ height: "2.5rem" }}
                        aria-live="polite"
                        aria-atomic="true"
                    >
                        <AnimatePresence mode="popLayout" initial={false}>
                            <motion.div
                                key={position}
                                initial={
                                    prefersReduced
                                        ? false
                                        : {
                                            y: direction > 0 ? 40 : -40,
                                            opacity: 0,
                                        }
                                }
                                animate={{ y: 0, opacity: 1 }}
                                exit={
                                    prefersReduced
                                        ? undefined
                                        : {
                                            y: direction > 0 ? -40 : 40,
                                            opacity: 0,
                                        }
                                }
                                transition={
                                    prefersReduced
                                        ? { duration: 0 }
                                        : {
                                            type: "spring",
                                            stiffness: 400,
                                            damping: 35,
                                        }
                                }
                                className="text-4xl font-bold leading-10 text-text-primary"
                            >
                                {position}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Advance badge */}
                    <AnimatePresence>
                        {showAdvance && !prefersReduced && (
                            <motion.div
                                initial={{ opacity: 0, x: -6 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 6 }}
                                transition={{ duration: 0.25 }}
                                className="mb-1 flex items-center gap-0.5 rounded-full bg-feedback-success-bg px-2 py-0.5 text-xs font-semibold text-feedback-success"
                                aria-live="polite"
                            >
                                <ChevronUp size={12} aria-hidden="true" />
                                vous avancez !
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Label */}
                <p className="text-sm font-medium text-text-secondary">
                    {aheadCount === 1
                        ? `1 ${wording.singular} devant vous`
                        : `${aheadCount} ${wording.plural} devant vous`}
                </p>

                {/* Wait time + estimated clock time */}
                {/* position === 0 means the customer is next in line */}
                {position === 0 ? (
                    <div
                        className="flex items-center gap-1.5 animate-pulse rounded-md bg-feedback-success/15 px-2 py-1 text-xs font-semibold text-feedback-success"
                        aria-live="polite"
                    >
                        <Clock size={13} aria-hidden="true" />
                        <span>D&apos;un instant à l&apos;autre…</span>
                    </div>
                ) : estimatedMinutes !== null ? (
                    <>
                        <TimePill minutes={estimatedMinutes} />
                        {estimatedMinutes >= 1 && (
                            <EstimatedClockTime minutes={estimatedMinutes} />
                        )}
                    </>
                ) : null}

                {/* Queue depth label */}
                {totalWaiting > 1 && (
                    <p className="text-xs text-text-disabled">
                        {totalWaiting} {wording.plural} au total
                    </p>
                )}
            </div>
            </div>
        </div>
    )
}

export { QueuePositionCard, type QueuePositionCardProps }
