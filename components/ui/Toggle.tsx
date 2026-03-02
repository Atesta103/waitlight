"use client"

import { cn } from "@/lib/utils/cn"

type ToggleProps = {
    checked: boolean
    onChange: (checked: boolean) => void
    label: string
    disabled?: boolean
    className?: string
}

function Toggle({
    checked,
    onChange,
    label,
    disabled = false,
    className,
}: ToggleProps) {
    return (
        <label
            className={cn(
                "inline-flex cursor-pointer items-center gap-3",
                disabled && "cursor-not-allowed opacity-50",
                className,
            )}
        >
            <button
                role="switch"
                type="button"
                aria-checked={checked}
                aria-label={label}
                disabled={disabled}
                onClick={() => onChange(!checked)}
                className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
                    "focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:outline-none",
                    checked ? "bg-brand-primary" : "bg-border-default",
                )}
            >
                <span
                    aria-hidden="true"
                    className={cn(
                        "inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
                        checked ? "translate-x-6" : "translate-x-1",
                    )}
                />
            </button>
            <span className="text-sm text-text-primary">{label}</span>
        </label>
    )
}

export { Toggle, type ToggleProps }
