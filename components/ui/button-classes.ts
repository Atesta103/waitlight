import { cn } from "@/lib/utils/cn"

export const buttonVariants = {
    primary:
        "bg-brand-primary text-[var(--color-text-on-primary)] hover:bg-brand-primary-hover hover:text-[var(--color-text-on-primary)] focus-visible:ring-border-focus",
    secondary:
        "bg-brand-secondary text-text-primary hover:bg-brand-secondary-hover focus-visible:ring-border-focus",
    ghost: "bg-transparent text-text-primary hover:bg-border-default hover:bg-surface-hover focus-visible:ring-border-focus",
    destructive:
        "bg-feedback-error text-text-inverse hover:bg-red-600 focus-visible:ring-feedback-error",
} as const

export const buttonSizes = {
    sm: "h-9 min-w-9 px-3 text-sm gap-1.5",
    md: "h-11 min-w-11 px-4 text-base gap-2",
    lg: "h-13 min-w-13 px-6 text-lg gap-2.5",
} as const

export function getButtonClasses({
    variant = "primary",
    size = "md",
    className,
}: {
    variant?: keyof typeof buttonVariants
    size?: keyof typeof buttonSizes
    className?: string
} = {}) {
    return cn(
        "inline-flex cursor-pointer items-center justify-center rounded-md font-medium transition-colors",
        "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        "disabled:pointer-events-none disabled:opacity-50",
        buttonVariants[variant],
        buttonSizes[size],
        className
    )
}
