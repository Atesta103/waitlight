"use client"

import { forwardRef, useId } from "react"
import { cn } from "@/lib/utils/cn"

type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> & {
    label: string
    error?: string
    hint?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, hint, className, id, ...props }, ref) => {
        const generatedId = useId()
        const inputId = id ?? generatedId
        const hintId = hint ? `${inputId}-hint` : undefined
        const errorId = error ? `${inputId}-error` : undefined
        const describedBy =
            [hintId, errorId].filter(Boolean).join(" ") || undefined

        return (
            <div className="flex flex-col gap-1.5">
                <label
                    htmlFor={inputId}
                    className="text-sm font-medium text-text-primary"
                >
                    {label}
                </label>

                <input
                    ref={ref}
                    id={inputId}
                    aria-describedby={describedBy}
                    aria-invalid={error ? true : undefined}
                    className={cn(
                        "h-11 min-w-0 rounded-md border px-3 text-base transition-colors",
                        "bg-surface-card text-text-primary placeholder:text-text-disabled",
                        "focus:border-border-focus focus:ring-2 focus:ring-border-focus/25 focus:outline-none",
                        error
                            ? "border-feedback-error"
                            : "border-border-default",
                        className,
                    )}
                    {...props}
                />

                {hint && !error ? (
                    <p id={hintId} className="text-sm text-text-secondary">
                        {hint}
                    </p>
                ) : null}

                {error ? (
                    <p
                        id={errorId}
                        className="text-sm text-feedback-error"
                        role="alert"
                    >
                        {error}
                    </p>
                ) : null}
            </div>
        )
    },
)
Input.displayName = "Input"

export { Input, type InputProps }
