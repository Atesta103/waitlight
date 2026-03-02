import { cn } from "@/lib/utils/cn"
import type { ReactNode } from "react"

type CardProps = {
    children: ReactNode
    className?: string
    as?: "div" | "section" | "article"
}

function Card({ children, className, as: Component = "div" }: CardProps) {
    return (
        <Component
            className={cn(
                "rounded-lg border border-border-default bg-surface-card p-4 shadow-sm",
                className,
            )}
        >
            {children}
        </Component>
    )
}

type CardHeaderProps = {
    children: ReactNode
    className?: string
}

function CardHeader({ children, className }: CardHeaderProps) {
    return (
        <div
            className={cn("mb-3 flex items-center justify-between", className)}
        >
            {children}
        </div>
    )
}

type CardContentProps = {
    children: ReactNode
    className?: string
}

function CardContent({ children, className }: CardContentProps) {
    return <div className={cn("", className)}>{children}</div>
}

export { Card, CardHeader, CardContent, type CardProps }
