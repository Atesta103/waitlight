"use client"

import { useRef } from "react"
import { cn } from "@/lib/utils/cn"
import {
    THEME_PRESETS,
    DEFAULT_THEME,
    FONT_LABELS,
    RADIUS_SCALES,
    buildCustomTheme,
    type MerchantTheme,
    type FontChoice,
    type RadiusScale,
} from "@/lib/utils/theme"

type ThemePickerProps = {
    theme: MerchantTheme
    onChange: (theme: MerchantTheme) => void
    className?: string
}

const FONT_OPTIONS: FontChoice[] = [
    "geist",
    "inter",
    "outfit",
    "sora",
    "merriweather",
]
const RADIUS_OPTIONS: RadiusScale[] = ["sharp", "rounded"]
const RADIUS_LABELS: Record<RadiusScale, string> = {
    sharp: "↑",
    rounded: "◉",
    pill: "⬭",
}

function ThemePicker({ theme, onChange, className }: ThemePickerProps) {
    const colorRef = useRef<HTMLInputElement>(null)
    const currentPrimary =
        (theme.vars["--color-brand-primary"] as string) ?? "#6366f1"

    /* Apply a full preset */
    function applyPreset(preset: MerchantTheme) {
        onChange(preset)
    }

    /* Apply only the color, keeping current font + radius */
    function applyCustomColor(hex: string) {
        onChange(buildCustomTheme(hex, theme.font, theme.radius))
    }

    /* Apply only the font, keeping current color + radius */
    function applyFont(font: FontChoice) {
        const t = buildCustomTheme(currentPrimary, font, theme.radius)
        t.name = theme.name === "Personnalisé" ? "Personnalisé" : theme.name
        onChange(t)
    }

    /* Apply only the radius, keeping current color + font */
    function applyRadius(radius: RadiusScale) {
        const t = buildCustomTheme(currentPrimary, theme.font, radius)
        t.name = theme.name === "Personnalisé" ? "Personnalisé" : theme.name
        onChange(t)
    }

    return (
        <div className={cn("flex flex-col gap-4", className)}>
            {/* ─── Header ─── */}
            <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">
                    Thème
                </p>
                <button
                    onClick={() => applyPreset(DEFAULT_THEME)}
                    className="cursor-pointer text-[10px] text-text-disabled underline-offset-2 hover:underline hover:text-text-secondary transition-colors"
                    type="button"
                    title="Réinitialiser au thème par défaut"
                >
                    Reset
                </button>
            </div>

            {/* ─── Colour presets ─── */}
            <div>
                <p className="mb-2 text-[10px] uppercase tracking-widest text-text-disabled">
                    Couleur
                </p>
                <div className="flex flex-wrap gap-2">
                    {THEME_PRESETS.map((preset) => {
                        const isActive = theme.name === preset.name
                        const color = preset.vars[
                            "--color-brand-primary"
                        ] as string
                        return (
                            <button
                                key={preset.name}
                                type="button"
                                title={preset.name}
                                aria-label={`Preset ${preset.name}`}
                                aria-pressed={isActive}
                                onClick={() => applyPreset(preset)}
                                style={{ backgroundColor: color }}
                                className={cn(
                                    "cursor-pointer h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
                                    isActive
                                        ? "border-text-primary scale-110 shadow-sm"
                                        : "border-transparent",
                                )}
                            />
                        )
                    })}

                    {/* Custom colour swatch */}
                    <button
                        type="button"
                        title="Couleur personnalisée"
                        aria-label="Choisir une couleur personnalisée"
                        onClick={() => colorRef.current?.click()}
                        className={cn(
                            "cursor-pointer relative h-6 w-6 overflow-hidden rounded-full border-2 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
                            theme.name === "Personnalisé" &&
                                !THEME_PRESETS.some(
                                    (p) => p.name === theme.name,
                                )
                                ? "border-text-primary scale-110"
                                : "border-dashed border-border-default",
                        )}
                        style={
                            theme.name === "Personnalisé"
                                ? { backgroundColor: currentPrimary }
                                : {}
                        }
                    >
                        {theme.name !== "Personnalisé" && (
                            <span className="text-text-disabled text-xs leading-none">
                                +
                            </span>
                        )}
                        <input
                            ref={colorRef}
                            type="color"
                            aria-label="Couleur personnalisée"
                            defaultValue={currentPrimary}
                            onChange={(e) => applyCustomColor(e.target.value)}
                            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        />
                    </button>
                </div>
            </div>

            {/* ─── Font ─── */}
            <div>
                <p className="mb-2 text-[10px] uppercase tracking-widest text-text-disabled">
                    Typographie
                </p>
                <div className="flex flex-col gap-1">
                    {FONT_OPTIONS.map((font) => (
                        <button
                            key={font}
                            type="button"
                            aria-pressed={theme.font === font}
                            onClick={() => applyFont(font)}
                            className={cn(
                                "cursor-pointer rounded px-2 py-1 text-left text-xs transition-colors",
                                theme.font === font
                                    ? "bg-brand-primary/10 font-semibold text-brand-primary"
                                    : "text-text-secondary hover:bg-surface-base",
                            )}
                        >
                            {FONT_LABELS[font]}
                        </button>
                    ))}
                </div>
            </div>

            {/* ─── Radius ─── */}
            <div>
                <p className="mb-2 text-[10px] uppercase tracking-widest text-text-disabled">
                    Arrondis
                </p>
                <div className="flex gap-1.5">
                    {RADIUS_OPTIONS.map((r) => (
                        <button
                            key={r}
                            type="button"
                            aria-pressed={theme.radius === r}
                            onClick={() => applyRadius(r)}
                            title={r}
                            className={cn(
                                "cursor-pointer flex h-8 flex-1 items-center justify-center text-sm transition-colors border",
                                r === "sharp" && "rounded-[2px]",
                                r === "rounded" && "rounded-md",
                                r === "pill" && "rounded-full",
                                theme.radius === r
                                    ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                                    : "border-border-default text-text-secondary hover:bg-surface-base",
                            )}
                        >
                            {RADIUS_LABELS[r]}
                        </button>
                    ))}
                </div>
            </div>

            {/* ─── Active theme name ─── */}
            <p className="text-[10px] text-text-disabled">
                Thème actif :{" "}
                <span className="font-medium text-text-secondary">
                    {theme.name}
                </span>
            </p>
        </div>
    )
}

export { ThemePicker, type ThemePickerProps }
