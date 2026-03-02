import { cn } from "@/lib/utils/cn"
import { Loader2 } from "lucide-react"

const sizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-10 w-10",
} as const

type SpinnerProps = {
    size?: keyof typeof sizes
    className?: string
    label?: string
}

function Spinner({
    size = "md",
    className,
    label = "Chargement…",
}: SpinnerProps) {
    return (
        <span
            role="status"
            className={cn("inline-flex items-center justify-center", className)}
        >
            <Loader2
                className={cn("animate-spin text-brand-primary", sizes[size])}
                aria-hidden="true"
            />
            <span className="sr-only">{label}</span>
        </span>
    )
}

export { Spinner, type SpinnerProps }
