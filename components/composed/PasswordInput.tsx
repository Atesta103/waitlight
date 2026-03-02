"use client"

import { forwardRef, useId, useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils/cn"

type PasswordInputProps = Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type"
> & {
    label: string
    error?: string
    hint?: string
}

/**
 * Molecule — Password field with show/hide visibility toggle.
 * Composes the Input atom's visual rules with local toggle state.
 * The `type` attribute is controlled internally — do not pass it.
 */
const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
    ({ label, error, hint, className, id, ...props }, ref) => {
        const [visible, setVisible] = useState(false)
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

                <div className="relative">
                    <input
                        ref={ref}
                        id={inputId}
                        type={visible ? "text" : "password"}
                        aria-describedby={describedBy}
                        aria-invalid={error ? true : undefined}
                        className={cn(
                            "h-11 w-full min-w-0 rounded-md border pr-11 pl-3 text-base transition-colors",
                            "bg-surface-card text-text-primary placeholder:text-text-disabled",
                            "focus:border-border-focus focus:ring-2 focus:ring-border-focus/25 focus:outline-none",
                            error
                                ? "border-feedback-error"
                                : "border-border-default",
                            className,
                        )}
                        {...props}
                    />

                    <button
                        type="button"
                        aria-label={
                            visible
                                ? "Masquer le mot de passe"
                                : "Afficher le mot de passe"
                        }
                        onClick={() => setVisible((v) => !v)}
                        className={cn(
                            "absolute inset-y-0 right-0 flex items-center px-3",
                            "text-text-secondary transition-colors hover:text-text-primary",
                            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-border-focus focus-visible:rounded-md",
                        )}
                        tabIndex={0}
                    >
                        {visible ? (
                            <EyeOff size={18} aria-hidden="true" />
                        ) : (
                            <Eye size={18} aria-hidden="true" />
                        )}
                    </button>
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
PasswordInput.displayName = "PasswordInput"

export { PasswordInput, type PasswordInputProps }
