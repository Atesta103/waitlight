"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { BellRing, Clock3, Hash } from "lucide-react"
import { Card } from "@/components/ui/Card"
import { Skeleton } from "@/components/ui/Skeleton"
import { cn } from "@/lib/utils/cn"
import { duration, ease } from "@/lib/utils/motion"

type QueueStatusStripProps = {
    position: number | null
    status?: "waiting" | "called" | "done" | "cancelled"
    className?: string
}

function QueueStatusStrip({ position, status, className }: QueueStatusStripProps) {
    const prefersReduced = useReducedMotion()

    if (position === null && status !== "called") {
        return (
            <Card
                className={cn(
                    "flex items-center gap-3 border-2 border-border-default/80 bg-surface-card/95 py-3",
                    className,
                )}
            >
                <Skeleton className="h-11 w-11 rounded-2xl" />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48 max-w-full" />
                </div>
            </Card>
        )
    }

    const resolvedPosition = position ?? 0
    const isCalled = status === "called"
    const isNextUp = !isCalled && resolvedPosition === 0
    const aheadCount = isNextUp ? 0 : resolvedPosition

    const title = isCalled
        ? "C'est votre tour"
        : isNextUp || resolvedPosition === 1
          ? "Vous êtes le/la prochain-e"
          : `Place ${resolvedPosition} dans la file`

    const subtitle = isCalled
        ? "Gardez cet onglet ouvert pendant que vous jouez."
        : isNextUp
          ? "Préparez-vous, on va vous appeler d'un instant à l'autre."
          : aheadCount === 1
            ? "1 personne devant vous"
            : `${aheadCount} personnes devant vous`

    const toneClass = isCalled
        ? "border-feedback-success-bg bg-feedback-success-bg text-feedback-success"
        : "border-border-default bg-surface-card text-text-primary"

    return (
        <section aria-live="polite" aria-atomic="true">
            <Card
                className={cn(
                    "flex items-center gap-3 border-2 py-3 shadow-sm",
                    toneClass,
                    className,
                )}
                as="div"
            >
                <motion.div
                    key={resolvedPosition}
                    initial={prefersReduced ? false : { scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={prefersReduced ? { duration: 0 } : { duration: duration.default, ...ease.spring }}
                    className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border text-sm font-bold",
                        isCalled
                            ? "border-feedback-success/20 bg-surface-card text-feedback-success"
                            : "border-brand-primary/15 bg-brand-primary/10 text-brand-primary",
                    )}
                >
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                            key={resolvedPosition}
                            initial={prefersReduced ? false : { y: 6, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={prefersReduced ? undefined : { y: -6, opacity: 0 }}
                            transition={prefersReduced ? { duration: 0 } : { duration: duration.fast }}
                            className="flex items-center justify-center"
                        >
                            {isCalled ? (
                                <BellRing size={18} aria-hidden="true" />
                            ) : (
                                <Hash size={18} aria-hidden="true" />
                            )}
                        </motion.span>
                    </AnimatePresence>
                </motion.div>

                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-text-primary">
                        {title}
                    </p>
                    <p className="truncate text-xs text-text-secondary">{subtitle}</p>
                </div>

                <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-surface-base px-2.5 py-1 text-xs font-medium text-text-secondary">
                    <Clock3 size={12} aria-hidden="true" />
                    <span>
                        {isCalled ? "Maintenant" : isNextUp ? "Prochain" : `#${resolvedPosition}`}
                    </span>
                </div>
            </Card>
        </section>
    )
}

export { QueueStatusStrip, type QueueStatusStripProps }