"use client"

import { Card } from "@/components/ui/Card"
import { cn } from "@/lib/utils/cn"
import type { ReactNode } from "react"

type StatusBannerVariant = "called" | "done" | "closed" | "full" | "error" | "next"

type StatusBannerProps = {
    variant: StatusBannerVariant
    title: string
    description?: string
    children?: ReactNode
    className?: string
}

const variantConfig: Record<
    StatusBannerVariant,
    { className: string }
> = {
    called: {
        className:
            "border-status-called bg-status-called-bg text-status-called",
    },
    next: {
        className:
            "border-brand-primary bg-brand-primary/10 text-brand-primary",
    },
    done: {
        className: "border-status-done bg-status-done-bg text-status-done",
    },
    closed: {
        className:
            "border-status-waiting bg-status-waiting-bg text-status-waiting",
    },
    full: {
        className:
            "border-feedback-warning bg-feedback-warning-bg text-feedback-warning",
    },
    error: {
        className:
            "border-feedback-error bg-feedback-error-bg text-feedback-error",
    },
}

function StatusBanner({
    variant,
    title,
    description,
    children,
    className,
}: StatusBannerProps) {
    const config = variantConfig[variant]

    return (
        <Card
            className={cn(
                "flex flex-col items-center gap-3 border-2 py-8 text-center",
                config.className,
                className,
            )}
        >
            <h2 className="text-xl font-bold">{title}</h2>
            {description ? (
                <p className="max-w-sm text-sm opacity-80">{description}</p>
            ) : null}
            {children}
        </Card>
    )
}

export { StatusBanner, type StatusBannerProps, type StatusBannerVariant }
