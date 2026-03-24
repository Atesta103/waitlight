"use client"

import { Card, CardContent } from "@/components/ui/Card"
import { cn } from "@/lib/utils/cn"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

type StatCardProps = {
    label: string
    value: string | number
    trend?: "up" | "down" | "neutral"
    trendLabel?: string
    icon?: React.ReactNode
    className?: string
}

function StatCard({
    label,
    value,
    trend,
    trendLabel,
    icon,
    className,
}: StatCardProps) {
    const TrendIcon =
        trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus

    const trendColor =
        trend === "up"
            ? "text-feedback-success"
            : trend === "down"
              ? "text-feedback-error"
              : "text-text-secondary"

    return (
        <Card className={cn("", className)}>
            <CardContent>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <p className="text-sm text-text-secondary">{label}</p>
                        <p className="text-2xl font-bold text-text-primary">
                            {value}
                        </p>
                        {trend && trendLabel ? (
                            <div
                                className={cn(
                                    "flex items-center gap-1 text-xs",
                                    trendColor,
                                )}
                            >
                                <TrendIcon size={14} aria-hidden="true" />
                                <span>{trendLabel}</span>
                            </div>
                        ) : null}
                    </div>
                    {icon ? (
                        <div className="rounded-lg bg-brand-secondary/20 p-2 text-brand-primary">
                            {icon}
                        </div>
                    ) : null}
                </div>
            </CardContent>
        </Card>
    )
}

export { StatCard, type StatCardProps }
