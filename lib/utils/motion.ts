import type { Variants } from "framer-motion"

export const duration = {
    fast: 0.15,
    default: 0.3,
    slow: 0.5,
} as const

export const ease = {
    default: "easeInOut" as const,
    spring: { type: "spring" as const, stiffness: 300, damping: 30 },
}

export const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: duration.default } },
}

export const listItem: Variants = {
    hidden: { opacity: 0, y: 8 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.05, duration: duration.default },
    }),
}
