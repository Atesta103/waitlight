"use client"

import { forwardRef, useId } from "react"
import { cn } from "@/lib/utils/cn"
import { Check } from "lucide-react"

type CheckboxProps = Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type"
> & {
    label: string
    error?: string
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    ({ label, error, className, id, ...props }, ref) => {
        const generatedId = useId()
        const inputId = id ?? generatedId
        const errorId = error ? `${inputId}-error` : undefined

        return (
            <div className="flex flex-col gap-1">
                <label
                    htmlFor={inputId}
                    className={cn(
                        "group flex cursor-pointer items-start gap-3",
                        props.disabled && "cursor-not-allowed opacity-50",
                    )}
                >
                    <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                        <input
                            ref={ref}
                            id={inputId}
                            type="checkbox"
                            aria-describedby={errorId}
                            aria-invalid={error ? true : undefined}
                            className={cn(
                                "peer h-5 w-5 cursor-pointer appearance-none rounded border transition-colors",
                                "focus-visible:ring-2 focus-visible:ring-border-focus/25 focus-visible:outline-none",
                                error
                                    ? "border-feedback-error"
                                    : "border-border-default",
                                "checked:border-brand-primary checked:bg-brand-primary",
                                className,
                            )}
                            {...props}
                        />
                        <Check
                            size={14}
                            className="pointer-events-none absolute hidden text-text-inverse peer-checked:block"
                            aria-hidden="true"
                        />
                    </span>

                    <span className="text-sm leading-5 text-text-primary">
                        {label}
                    </span>
                </label>

                {error ? (
                    <p
                        id={errorId}
                        className="ml-8 text-sm text-feedback-error"
                        role="alert"
                    >
                        {error}
                    </p>
                ) : null}
            </div>
        )
    },
)
Checkbox.displayName = "Checkbox"

export { Checkbox, type CheckboxProps }
