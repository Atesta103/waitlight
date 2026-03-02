"use client"

import { cn } from "@/lib/utils/cn"

type EmptyStateProps = {
    icon: React.ReactNode
    title: string
    description?: string
    action?: React.ReactNode
    className?: string
}

function EmptyState({
    icon,
    title,
    description,
    action,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center gap-3 py-12 text-center",
                className,
            )}
        >
            <div className="rounded-full bg-border-default/50 p-4 text-text-secondary">
                {icon}
            </div>
            <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
            {description ? (
                <p className="max-w-sm text-sm text-text-secondary">
                    {description}
                </p>
            ) : null}
            {action ? <div className="mt-2">{action}</div> : null}
        </div>
    )
}

export { EmptyState, type EmptyStateProps }
