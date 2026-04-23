"use client"

import type { ReactNode } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { duration, ease } from "@/lib/utils/motion"
import { cn } from "@/lib/utils/cn"

type SectionRevealProps = {
    children: ReactNode
    className?: string
    delay?: number
}

export function SectionReveal({
    children,
    className,
    delay = 0,
}: SectionRevealProps) {
    const prefersReduced = useReducedMotion()

    return (
        <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 20 }}
            whileInView={prefersReduced ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: duration.default, delay, ease: ease.default }}
            className={cn(className)}
        >
            {children}
        </motion.div>
    )
}
