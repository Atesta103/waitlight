"use client"

import { forwardRef, useId } from "react"
import { cn } from "@/lib/utils/cn"
import { getContrastYIQ, isValidHexCode } from "@/lib/utils/color"

type ColorPickerProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
    label: string
    error?: string
    hint?: string
}

const ColorPicker = forwardRef<HTMLInputElement, ColorPickerProps>(
    ({ label, error, hint, className, id, value, onChange, ...props }, ref) => {
        const generatedId = useId()
        const inputId = id ?? generatedId
        const hintId = hint ? `${inputId}-hint` : undefined
        const errorId = error ? `${inputId}-error` : undefined
        const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined

        // Determine text color based on the selected hex background color
        let previewTextColor = "text-white"
        const hex = typeof value === "string" ? value : undefined
        if (hex && isValidHexCode(hex)) {
            previewTextColor = getContrastYIQ(hex) === "white" ? "text-white" : "text-black"
        }

        return (
            <div className="flex flex-col gap-1.5">
                <label
                    htmlFor={inputId}
                    className="text-sm font-medium text-text-primary"
                >
                    {label}
                </label>

                <div className="flex items-center gap-3">
                    <div 
                        className={cn(
                            "relative flex h-11 w-11 shrink-0 overflow-hidden rounded-md border shadow-sm transition-colors",
                            error ? "border-feedback-error" : "border-border-default",
                            className
                        )}
                    >
                        <input
                            ref={ref}
                            id={inputId}
                            type="color"
                            aria-describedby={describedBy}
                            aria-invalid={error ? true : undefined}
                            value={value}
                            onChange={onChange}
                            className="absolute -left-2 -top-2 h-16 w-16 cursor-pointer opacity-0"
                            {...props}
                        />
                        <div 
                            className="absolute inset-0 pointer-events-none flex items-center justify-center font-medium"
                            style={{ backgroundColor: typeof value === 'string' ? value : '#4F46E5' }}
                        >
                            <span className={cn("text-xs font-semibold", previewTextColor)}>A</span>
                        </div>
                    </div>

                    <div className={cn(
                        "flex h-11 flex-1 items-center px-3 rounded-md border shadow-sm transition-colors",
                        error ? "border-feedback-error" : "border-border-default",
                        "bg-surface-card text-text-primary"
                    )}>
                        <span className="text-base uppercase tabular-nums">
                            {typeof value === 'string' ? value : '#4F46E5'}
                        </span>
                    </div>
                </div>

                {hint && !error ? (
                    <p id={hintId} className="text-sm text-text-secondary">
                        {hint}
                    </p>
                ) : null}

                {error ? (
                    <p id={errorId} className="text-sm text-feedback-error" role="alert">
                        {error}
                    </p>
                ) : null}
            </div>
        )
    }
)
ColorPicker.displayName = "ColorPicker"

export { ColorPicker, type ColorPickerProps }