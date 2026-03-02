"use client"

import { Card } from "@/components/ui/Card"
import { cn } from "@/lib/utils/cn"
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    XCircle,
    PartyPopper,
} from "lucide-react"
import type { ReactNode } from "react"

type StatusBannerVariant = "called" | "done" | "closed" | "full" | "error"

type StatusBannerProps = {
    variant: StatusBannerVariant
    title: string
    description?: string
    children?: ReactNode
    className?: string
}

const variantConfig: Record<
    StatusBannerVariant,
    { icon: React.ElementType; className: string }
> = {
    called: {
        icon: PartyPopper,
        className:
            "border-status-called bg-status-called-bg text-status-called",
    },
    done: {
        icon: CheckCircle2,
        className: "border-status-done bg-status-done-bg text-status-done",
    },
    closed: {
        icon: Clock,
        className:
            "border-status-waiting bg-status-waiting-bg text-status-waiting",
    },
    full: {
        icon: AlertCircle,
        className:
            "border-feedback-warning bg-feedback-warning-bg text-feedback-warning",
    },
    error: {
        icon: XCircle,
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
    const Icon = config.icon

    return (
        <Card
            className={cn(
                "flex flex-col items-center gap-3 border-2 py-8 text-center",
                config.className,
                className,
            )}
        >
            <Icon size={40} aria-hidden="true" />
            <h2 className="text-xl font-bold">{title}</h2>
            {description ? (
                <p className="max-w-sm text-sm opacity-80">{description}</p>
            ) : null}
            {children}
        </Card>
    )
}

export { StatusBanner, type StatusBannerProps, type StatusBannerVariant }
