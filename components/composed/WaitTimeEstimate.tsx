import { Skeleton } from "@/components/ui/Skeleton"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils/cn"

type WaitTimeEstimateProps = {
    minutes: number | null
    className?: string
}

function WaitTimeEstimate({ minutes, className }: WaitTimeEstimateProps) {
    if (minutes === null) {
        return (
            <div className={cn("flex items-center gap-2", className)}>
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 w-28" />
            </div>
        )
    }

    const label =
        minutes < 1
            ? "Moins d'une minute"
            : minutes === 1
              ? "~1 minute"
              : `~${minutes} minutes`

    return (
        <div
            className={cn(
                "flex items-center gap-2 text-text-secondary",
                className,
            )}
        >
            <Clock size={18} aria-hidden="true" />
            <span className="text-sm font-medium">{label}</span>
        </div>
    )
}

export { WaitTimeEstimate, type WaitTimeEstimateProps }
