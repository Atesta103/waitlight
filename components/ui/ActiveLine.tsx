import { cn } from "@/lib/utils/cn"

type ActiveLineProps = {
    value: number
    max: number
    className?: string
    label?: string
}

function ActiveLine({ value, max, className, label = "Progression" }: ActiveLineProps) {
    const safeMax = Math.max(1, max)
    const clamped = Math.min(safeMax, Math.max(1, value))
    const percentage = safeMax === 1 ? 100 : ((clamped - 1) / (safeMax - 1)) * 100

    return (
        <div
            role="progressbar"
            aria-label={label}
            aria-valuemin={1}
            aria-valuemax={safeMax}
            aria-valuenow={clamped}
            className={cn("relative h-9 w-full", className)}
        >
            <div className="absolute left-4 right-4 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-border-default" />
            <div
                className="absolute left-4 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-brand-primary transition-[width] duration-300 ease-out"
                style={{ width: `calc((100% - 2rem) * ${percentage / 100})` }}
            />
            <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between">
                {Array.from({ length: safeMax }, (_, index) => {
                    const isActive = index + 1 <= clamped
                    return (
                        <span
                            key={`dot-${index}`}
                            className={cn(
                                "h-8 w-8 rounded-full border-2 transition-colors duration-300",
                                isActive
                                    ? "border-brand-primary bg-brand-primary"
                                    : "border-border-default bg-surface-card",
                            )}
                            aria-hidden="true"
                        />
                    )
                })}
            </div>
        </div>
    )
}

export { ActiveLine, type ActiveLineProps }
