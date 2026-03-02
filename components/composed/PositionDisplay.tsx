"use client"

import { motion, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils/cn"
import { Skeleton } from "@/components/ui/Skeleton"
import { duration, ease } from "@/lib/utils/motion"

type PositionDisplayProps = {
    position: number | null
    className?: string
}

function PositionDisplay({ position, className }: PositionDisplayProps) {
    const prefersReduced = useReducedMotion()

    if (position === null) {
        return (
            <div className={cn("flex flex-col items-center gap-2", className)}>
                <Skeleton className="h-20 w-20 rounded-full" />
                <Skeleton className="h-4 w-32" />
            </div>
        )
    }

    return (
        <div className={cn("flex flex-col items-center gap-2", className)}>
            <motion.div
                key={position}
                initial={prefersReduced ? false : { scale: 1.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={
                    prefersReduced
                        ? { duration: 0 }
                        : { duration: duration.slow, ...ease.spring }
                }
                className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-primary text-3xl font-bold text-text-inverse"
                aria-live="polite"
                aria-atomic="true"
            >
                {position}
            </motion.div>
            <p className="text-sm text-text-secondary">
                {position === 0
                    ? "C'est votre tour !"
                    : position === 1
                      ? "1 personne devant vous"
                      : `${position} personnes devant vous`}
            </p>
        </div>
    )
}

export { PositionDisplay, type PositionDisplayProps }
