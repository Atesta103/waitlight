import { cn } from "@/lib/utils/cn"

const sizes = {
    sm: {
        root: "h-4 w-7 gap-0.5",
        bar: "w-1.5 rounded-full",
        heights: ["h-3", "h-4", "h-2.5", "h-3.5"],
    },
    md: {
        root: "h-6 w-10 gap-1",
        bar: "w-2 rounded-full",
        heights: ["h-4", "h-6", "h-3.5", "h-5"],
    },
    lg: {
        root: "h-10 w-16 gap-1.5",
        bar: "w-3 rounded-full",
        heights: ["h-7", "h-10", "h-6", "h-8"],
    },
} as const

type SpinnerProps = {
    size?: keyof typeof sizes
    className?: string
    label?: string
    decorative?: boolean
}

function Spinner({
    size = "md",
    className,
    label = "Chargement…",
    decorative = false,
}: SpinnerProps) {
    return (
        <span
            role={decorative ? undefined : "status"}
            aria-hidden={decorative ? true : undefined}
            className={cn("inline-flex items-center justify-center text-brand-primary", sizes[size].root, className)}
        >
            {sizes[size].heights.map((height, index) => (
                <span
                    key={`${height}-${index}`}
                    className={cn(
                        "animate-waitlight-loader bg-current",
                        sizes[size].bar,
                        height,
                    )}
                    style={{ animationDelay: `${index * 120}ms` }}
                    aria-hidden="true"
                />
            ))}
            {decorative ? null : <span className="sr-only">{label}</span>}
        </span>
    )
}

export { Spinner, type SpinnerProps }
