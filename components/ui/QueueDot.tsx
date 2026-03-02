"use client"

import { cn } from "@/lib/utils/cn"

type QueueDotVariant = "ahead" | "you" | "behind"

type QueueDotProps = {
    variant: QueueDotVariant
    className?: string
}

function QueueDot({ variant, className }: QueueDotProps) {
    return (
        <span
            aria-hidden="true"
            className={cn(
                "block shrink-0 rounded-full transition-all",
                variant === "ahead" && "h-2.5 w-2.5 bg-text-disabled",
                variant === "behind" && "h-2 w-2 bg-border-default",
                variant === "you" && [
                    "relative h-4 w-4 bg-brand-primary",
                    // Pulsing ring
                    "before:absolute before:inset-0 before:rounded-full",
                    "before:animate-ping before:bg-brand-primary/40",
                ],
                className,
            )}
        />
    )
}

export { QueueDot, type QueueDotProps, type QueueDotVariant }
