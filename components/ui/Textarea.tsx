"use client"

import { forwardRef, useId } from "react"
import { cn } from "@/lib/utils/cn"

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label: string
    error?: string
    hint?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, hint, className, id, ...props }, ref) => {
        const generatedId = useId()
        const textareaId = id ?? generatedId
        const hintId = hint ? `${textareaId}-hint` : undefined
        const errorId = error ? `${textareaId}-error` : undefined
        const describedBy =
            [hintId, errorId].filter(Boolean).join(" ") || undefined

        return (
            <div className="flex flex-col gap-1.5">
                <label
                    htmlFor={textareaId}
                    className="text-sm font-medium text-text-primary"
                >
                    {label}
                </label>

                <textarea
                    ref={ref}
                    id={textareaId}
                    aria-describedby={describedBy}
                    aria-invalid={error ? true : undefined}
                    className={cn(
                        "min-h-24 rounded-md border px-3 py-2 text-base transition-colors",
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
Textarea.displayName = "Textarea"

export { Textarea, type TextareaProps }
