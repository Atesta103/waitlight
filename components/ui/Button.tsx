"use client"

import { forwardRef } from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils/cn"

const variants = {
    primary:
        "bg-brand-primary text-text-inverse hover:bg-brand-primary-hover focus-visible:ring-border-focus",
    secondary:
        "bg-brand-secondary text-text-primary hover:bg-brand-secondary-hover focus-visible:ring-border-focus",
    ghost: "bg-transparent text-text-primary hover:bg-border-default focus-visible:ring-border-focus",
    destructive:
        "bg-feedback-error text-text-inverse hover:bg-red-600 focus-visible:ring-feedback-error",
} as const

const sizes = {
    sm: "h-9 min-w-9 px-3 text-sm gap-1.5",
    md: "h-11 min-w-11 px-4 text-base gap-2",
    lg: "h-13 min-w-13 px-6 text-lg gap-2.5",
} as const

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: keyof typeof variants
    size?: keyof typeof sizes
    isLoading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = "primary",
            size = "md",
            isLoading = false,
            disabled,
            children,
            className,
            ...props
        },
        ref,
    ) => {
        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={cn(
                    "inline-flex cursor-pointer items-center justify-center rounded-md font-medium transition-colors",
                    "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                    "disabled:pointer-events-none disabled:opacity-50",
                    variants[variant],
                    sizes[size],
                    className,
                )}
                {...props}
            >
                {isLoading ? (
                    <Loader2
                        className="animate-spin"
                        aria-hidden="true"
                        size={18}
                    />
                ) : null}
                {children}
            </button>
        )
    },
)
Button.displayName = "Button"

export { Button, type ButtonProps }
