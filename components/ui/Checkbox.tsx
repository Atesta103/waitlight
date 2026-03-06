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
                        "group flex cursor-pointer items-start gap-3 rounded-xl border border-border-default/50 bg-surface-card p-4 transition-all shadow-sm",
                        "hover:border-brand-primary/20 hover:bg-brand-primary/5 active:scale-[0.98]",
                        error && "border-feedback-error/30 bg-feedback-error/5",
                        props.disabled &&
                            "cursor-not-allowed opacity-50 hover:bg-transparent active:scale-100",
                        className,
                    )}
                >
                    <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                        <input
                            ref={ref}
                            id={inputId}
                            type="checkbox"
                            aria-describedby={errorId}
                            aria-invalid={error ? true : undefined}
                            className={cn(
                                "peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 transition-all",
                                "focus-visible:ring-2 focus-visible:ring-border-focus/25 focus-visible:outline-none",
                                error
                                    ? "border-feedback-error"
                                    : "border-border-default group-hover:border-brand-primary/40",
                                "checked:border-brand-primary checked:bg-brand-primary",
                            )}
                            {...props}
                        />
                        <Check
                            size={12}
                            strokeWidth={3}
                            className="pointer-events-none absolute hidden text-text-inverse peer-checked:block"
                            aria-hidden="true"
                        />
                    </span>
                    <div className="flex flex-col gap-1">
                        <span className="text-sm leading-5 font-medium text-text-primary">
                            {label}
                        </span>
                        {error ? (
                            <p
                                id={errorId}
                                className="text-xs font-semibold text-feedback-error"
                                role="alert"
                            >
                                {error}
                            </p>
                        ) : null}
                    </div>
                </label>
            </div>
        )

    },
)
Checkbox.displayName = "Checkbox"

export { Checkbox, type CheckboxProps }
