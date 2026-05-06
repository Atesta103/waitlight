"use client"

import { forwardRef } from "react"
import { Spinner } from "./Spinner"
import { buttonVariants, buttonSizes, getButtonClasses } from "./button-classes"
import { cn } from "@/lib/utils/cn"

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: keyof typeof buttonVariants
    size?: keyof typeof buttonSizes
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
                className={cn(getButtonClasses({ variant, size, className }), "relative")}
                {...props}
            >
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Spinner size="sm" label="Chargement" className="text-current" />
                    </div>
                )}
                <span className={cn(
                    "flex items-center justify-center gap-inherit w-full h-full",
                    isLoading ? "opacity-0" : "opacity-100"
                )} style={{ gap: 'inherit' }}>
                    {children}
                </span>
            </button>
        )
    },
)
Button.displayName = "Button"

export { Button, type ButtonProps }
