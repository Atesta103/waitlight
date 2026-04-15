"use client"

import { forwardRef, useId } from "react"
import { cn } from "@/lib/utils/cn"
import { getContrastYIQ, isValidHexCode } from "@/lib/utils/color"

type ColorPickerProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
    label: string
    error?: string
    hint?: string
}

const PRESET_COLORS = [
    "#4F46E5", // Indigo (Wait-Light par défaut)
    "#0EA5E9", // Sky
    "#10B981", // Emerald
    "#F59E0B", // Amber
    "#F97316", // Orange
    "#EF4444", // Red
    "#8B5CF6", // Violet
    "#EC4899", // Pink
    "#14B8A6", // Teal
    "#09090B", // Noir
]

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

                <div className="flex flex-col gap-3">
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

                        <input
                            type="text"
                            value={typeof value === 'string' ? value.toUpperCase() : '#4F46E5'}
                            onChange={onChange}
                            aria-label="Code couleur hexadécimal"
                            maxLength={7}
                            className={cn(
                                "flex h-11 min-w-0 flex-1 px-3 text-base uppercase tabular-nums rounded-md border shadow-sm transition-colors",
                                "bg-surface-card text-text-primary focus:border-border-focus focus:ring-2 focus:ring-border-focus/25 focus:outline-none",
                                error ? "border-feedback-error" : "border-border-default"
                            )}
                        />
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                        {PRESET_COLORS.map((color) => {
                            const isSelected = typeof value === 'string' && value.toUpperCase() === color.toUpperCase()
                            return (
                                <button
                                    key={color}
                                    type="button"
                                    aria-label={`Sélectionner la couleur ${color}`}
                                    aria-pressed={isSelected}
                                    onClick={() => {
                                        if (onChange) {
                                            const event = {
                                                target: { value: color }
                                            } as React.ChangeEvent<HTMLInputElement>
                                            onChange(event)
                                        }
                                    }}
                                    className={cn(
                                        "h-8 w-8 cursor-pointer rounded-full border shadow-sm transition-transform hover:scale-110",
                                        isSelected 
                                            ? "ring-2 ring-border-focus ring-offset-2 border-transparent" 
                                            : "border-border-default hover:border-gray-400"
                                    )}
                                    style={{ backgroundColor: color }}
                                />
                            )
                        })}
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