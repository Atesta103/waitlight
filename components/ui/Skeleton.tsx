import { cn } from "@/lib/utils/cn"

type SkeletonProps = {
    className?: string
}

function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            aria-hidden="true"
            className={cn("skeleton-shimmer rounded-md", className)}
        />
    )
}

export { Skeleton, type SkeletonProps }
