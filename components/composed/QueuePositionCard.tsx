"use client"

import { useRef, useEffect, useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { QueueDot } from "@/components/ui/QueueDot"
import { Skeleton } from "@/components/ui/Skeleton"
import { Clock, ChevronUp, CalendarClock } from "lucide-react"
import { cn } from "@/lib/utils/cn"

type QueuePositionCardProps = {
    /** 1-based position (1 = next to be called, 0 = "it's your turn") */
    position: number | null
    /** total people currently waiting (including you) */
    totalWaiting: number | null
    /** estimated wait in minutes */
    estimatedMinutes: number | null
    className?: string
}

const MAX_DOTS_AHEAD = 5
const MAX_DOTS_BEHIND = 3

/* ─── Helper: displays the wall-clock time when the customer should be called ───
 * Date.now() is called only on the client (useEffect) to avoid SSR/hydration mismatch.
 */
function EstimatedClockTime({ minutes }: { minutes: number }) {
    const [formatted, setFormatted] = useState<string | null>(null)

    useEffect(() => {
        const eta = new Date(Date.now() + minutes * 60_000)
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
    className,
}: QueuePositionCardProps) {
    const prefersReduced = useReducedMotion()
    const prevPositionRef = useRef<number | null>(null)
    const [showAdvance, setShowAdvance] = useState(false)
    const [direction, setDirection] = useState<1 | -1>(1)

    // Detect forward movement to briefly show the ↑ badge and track direction
    useEffect(() => {
        const prev = prevPositionRef.current
        if (prev !== null && position !== null && position < prev) {
            setShowAdvance(true)
            setDirection(-1)
            const t = setTimeout(() => setShowAdvance(false), 1800)
            prevPositionRef.current = position
            return () => clearTimeout(t)
        } else if (position !== null) {
            setDirection(1)
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
                        ? "1 personne devant vous"
                        : `${aheadCount} personnes devant vous`}
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
                        {totalWaiting} personnes au total
                    </p>
                )}
            </div>
        </div>
    )
}

export { QueuePositionCard, type QueuePositionCardProps }
