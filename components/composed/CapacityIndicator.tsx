"use client"

import { Card, CardContent } from "@/components/ui/Card"
import { ProgressBar } from "@/components/ui/ProgressBar"
import { cn } from "@/lib/utils/cn"
import { Users } from "lucide-react"

type CapacityIndicatorProps = {
    current: number
    max: number
    className?: string
}

function CapacityIndicator({
    current,
    max,
    className,
}: CapacityIndicatorProps) {
    const percentage = max > 0 ? (current / max) * 100 : 0
    const variant =
        percentage >= 90 ? "error" : percentage >= 70 ? "warning" : "default"
    const statusLabel =
        percentage >= 100
            ? "File complète"
            : percentage >= 90
              ? "Presque plein"
              : percentage >= 70
                ? "Bien rempli"
                : "Places disponibles"

    return (
        <Card className={cn("", className)}>
            <CardContent>
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                            <Users
                                size={18}
                                className="text-text-secondary"
                                aria-hidden="true"
                            />
                            <span className="text-sm font-medium text-text-primary">
                                Capacité de la file
                            </span>
                        </div>
                        <span
                            className={cn(
                                "text-xs font-medium",
                                variant === "error"
                                    ? "text-feedback-error"
                                    : variant === "warning"
                                      ? "text-feedback-warning"
                                      : "text-text-secondary",
                            )}
                        >
                            {statusLabel}
                        </span>
                    </div>

                    <ProgressBar
                        value={current}
                        max={max}
                        variant={variant}
                        showValue
                        size="md"
                    />
                </div>
            </CardContent>
        </Card>
    )
}

export { CapacityIndicator, type CapacityIndicatorProps }
