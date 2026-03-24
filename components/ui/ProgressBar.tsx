import { cn } from "@/lib/utils/cn"

type ProgressBarProps = {
    value: number
    max?: number
    label?: string
    showValue?: boolean
    variant?: "default" | "success" | "warning" | "error"
    size?: "sm" | "md" | "lg"
    className?: string
}

const variantStyles = {
    default: "bg-brand-primary",
    success: "bg-feedback-success",
    warning: "bg-feedback-warning",
    error: "bg-feedback-error",
} as const

const sizeStyles = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
} as const

function ProgressBar({
    value,
    max = 100,
    label,
    showValue = false,
    variant = "default",
    size = "md",
    className,
}: ProgressBarProps) {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100))

    return (
        <div className={cn("flex flex-col gap-2.5", className)}>
            {label || showValue ? (
                <div className="flex items-center justify-between text-sm">
                    {label ? (
                        <span className="font-medium text-text-primary">
                            {label}
                        </span>
                    ) : null}
                    {showValue ? (
                        <span className="text-text-secondary">
                            {value}/{max}
                        </span>
                    ) : null}
                </div>
            ) : null}
            <div
                role="progressbar"
                aria-valuenow={value}
                aria-valuemin={0}
                aria-valuemax={max}
                aria-label={label ?? "Progression"}
                className={cn(
                    "w-full overflow-hidden rounded-full bg-border-default",
                    sizeStyles[size],
                )}
            >
                <div
                    className={cn(
                        "h-full rounded-full transition-all duration-300 ease-out",
                        variantStyles[variant],
                    )}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    )
}

export { ProgressBar, type ProgressBarProps }
