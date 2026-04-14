"use client"

import { motion, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils/cn"
import { BellRing } from "lucide-react"

type NextInLineCardProps = {
    className?: string
}

function NextInLineCard({ className }: NextInLineCardProps) {
    const prefersReduced = useReducedMotion()

    return (
        <div className={cn("flex flex-col items-center gap-4 text-center", className)}>
            <motion.div
                initial={prefersReduced ? false : { scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={
                    prefersReduced
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 300, damping: 20 }
                }
                className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary"
                aria-hidden="true"
            >
                <BellRing size={48} className="animate-pulse" />
            </motion.div>
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold text-text-primary">
                    Vous êtes le/la prochain-e !
                </h2>
                <p className="text-sm font-medium text-text-secondary">
                    Préparez-vous, on va bientôt vous appeler.
                </p>
            </div>
        </div>
    )
}

export { NextInLineCard, type NextInLineCardProps }
