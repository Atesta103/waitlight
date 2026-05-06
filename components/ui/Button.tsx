"use client"

import { forwardRef } from "react"
import { Spinner } from "./Spinner"
import { buttonVariants, buttonSizes, getButtonClasses } from "./button-classes"

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
                className={getButtonClasses({ variant, size, className })}
                {...props}
            >
                {isLoading ? (
                    <Spinner size="sm" label="Chargement" className="text-current" />
                ) : (
                    children
                )}
            </button>
        )
    },
)
Button.displayName = "Button"

export { Button, type ButtonProps }
