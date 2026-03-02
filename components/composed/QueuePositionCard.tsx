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

function QueuePositionCard({
    position,
    totalWaiting,
    estimatedMinutes,
    className,
}: QueuePositionCardProps) {
    const prefersReduced = useReducedMotion()
    const prevPositionRef = useRef<number | null>(null)
    const [showAdvance, setShowAdvance] = useState(false)

    // Detect forward movement to briefly show the ↑ badge
    useEffect(() => {
        const prev = prevPositionRef.current
        if (prev !== null && position !== null && position < prev) {
            setShowAdvance(true)
            const t = setTimeout(() => setShowAdvance(false), 1800)
            return () => clearTimeout(t)
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

    // People strictly ahead (position 1 = 0 ahead, position 4 = 3 ahead)
    const aheadCount = Math.max(0, position - 1)
    // People behind you
    const behindCount = Math.max(0, totalWaiting - position)

    // Dots to render above your dot
    const dotsAhead = Math.min(aheadCount, MAX_DOTS_AHEAD)
    const hasMoreAhead = aheadCount > MAX_DOTS_AHEAD

    // Dots to render below your dot
    const dotsBehind = Math.min(behindCount, MAX_DOTS_BEHIND)
    const hasMoreBehind = behindCount > MAX_DOTS_BEHIND

    const isYourTurn = position === 0

    const direction =
        prevPositionRef.current !== null &&
        position < (prevPositionRef.current ?? position)
            ? -1
            : 1

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
                    <QueueDot variant={isYourTurn ? "ahead" : "you"} />
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
                                {isYourTurn ? "🎉" : position}
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
                    {isYourTurn
                        ? "C'est votre tour !"
                        : aheadCount === 0
                          ? "Vous êtes le prochain !"
                          : aheadCount === 1
                            ? "1 personne devant vous"
                            : `${aheadCount} personnes devant vous`}
                </p>

                {/* Wait time + estimated clock time */}
                {estimatedMinutes !== null && !isYourTurn && (
                    <>
                        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                            <Clock size={13} aria-hidden="true" />
                            <span>
                                {estimatedMinutes < 1
                                    ? "Moins d'une minute"
                                    : estimatedMinutes === 1
                                      ? "~1 minute"
                                      : `~${estimatedMinutes} min`}
                            </span>
                        </div>
                        {estimatedMinutes >= 1 && (
                            <EstimatedClockTime minutes={estimatedMinutes} />
                        )}
                    </>
                )}

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
