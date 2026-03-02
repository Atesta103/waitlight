"use client"

import { forwardRef, useId } from "react"
import { cn } from "@/lib/utils/cn"
import { ChevronDown } from "lucide-react"

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
    label: string
    error?: string
    hint?: string
    options: { value: string; label: string }[]
    placeholder?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    (
        { label, error, hint, options, placeholder, className, id, ...props },
        ref,
    ) => {
        const generatedId = useId()
        const selectId = id ?? generatedId
        const hintId = hint ? `${selectId}-hint` : undefined
        const errorId = error ? `${selectId}-error` : undefined
        const describedBy =
            [hintId, errorId].filter(Boolean).join(" ") || undefined

        return (
            <div className="flex flex-col gap-1.5">
                <label
                    htmlFor={selectId}
                    className="text-sm font-medium text-text-primary"
                >
                    {label}
                </label>

                <div className="relative">
                    <select
                        ref={ref}
                        id={selectId}
                        aria-describedby={describedBy}
                        aria-invalid={error ? true : undefined}
                        className={cn(
                            "h-11 w-full cursor-pointer appearance-none rounded-md border bg-surface-card px-3 pr-10 text-base transition-colors",
                            "text-text-primary",
                            "focus:border-border-focus focus:ring-2 focus:ring-border-focus/25 focus:outline-none",
                            error
                                ? "border-feedback-error"
                                : "border-border-default",
                            className,
                        )}
                        {...props}
                    >
                        {placeholder ? (
                            <option value="" disabled>
                                {placeholder}
                            </option>
                        ) : null}
                        {options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown
                        size={18}
                        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-text-secondary"
                        aria-hidden="true"
                    />
                </div>

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
Select.displayName = "Select"

export { Select, type SelectProps }
