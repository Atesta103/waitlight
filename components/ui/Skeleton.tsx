import { cn } from "@/lib/utils/cn"

type SkeletonProps = {
    className?: string
}

function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            aria-hidden="true"
            className={cn(
                "animate-pulse rounded-md bg-border-default",
                className,
            )}
        />
    )
}

export { Skeleton, type SkeletonProps }
