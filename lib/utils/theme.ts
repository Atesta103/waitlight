/**
 * Wait-Light merchant theme system.
 *
 * A MerchantTheme is a plain record of CSS custom-property overrides.
 * Apply it to any wrapper element via the `style` prop to scope the
 * brand to that subtree — all Tailwind utilities that reference these
 * vars will automatically pick up the new values.
 */

export type RadiusScale = "sharp" | "rounded" | "pill"
export type FontChoice = "geist" | "inter" | "outfit" | "sora" | "merriweather"

export type MerchantTheme = {
    /** Display name shown in the picker */
    name: string
    /** CSS custom-property overrides to inject on the wrapper element */
    vars: Record<string, string>
    /** Which font preset is active */
    font: FontChoice
    /** Which radius scale is active */
    radius: RadiusScale
}

/* ─── Radius scales ─── */
export const RADIUS_SCALES: Record<
    RadiusScale,
    { sm: string; md: string; lg: string }
> = {
    sharp: { sm: "0.125rem", md: "0.25rem", lg: "0.375rem" },
    rounded: { sm: "0.375rem", md: "0.5rem", lg: "0.75rem" },
    pill: { sm: "9999px", md: "9999px", lg: "9999px" },
}

/* ─── Font stacks ─── */
// The CSS variables (--font-inter, --font-outfit, …) are injected by
// next/font in app/design-system/layout.tsx. Geist is injected by the root
// layout via next/font as --font-geist-sans.
export const FONT_STACKS: Record<FontChoice, string> = {
    geist: "var(--font-geist-sans), system-ui, sans-serif",
    inter: "var(--font-inter), 'Inter', system-ui, sans-serif",
    outfit: "var(--font-outfit), 'Outfit', system-ui, sans-serif",
    sora: "var(--font-sora), 'Sora', system-ui, sans-serif",
    merriweather: "var(--font-merriweather), 'Merriweather', Georgia, serif",
}

export const FONT_LABELS: Record<FontChoice, string> = {
    geist: "Geist",
    inter: "Inter",
    outfit: "Outfit",
    sora: "Sora",
    merriweather: "Merriweather",
}

/* ─── Helper: build var record from brand color + scale ─── */
function brandVars(
    primary: string,
    primaryHover: string,
    secondary: string,
    secondaryHover: string,
): Record<string, string> {
    return {
        "--color-brand-primary": primary,
        "--color-brand-primary-hover": primaryHover,
        "--color-brand-secondary": secondary,
        "--color-brand-secondary-hover": secondaryHover,
        "--color-border-focus": primary,
    }
}

function radiusVars(scale: RadiusScale): Record<string, string> {
    const r = RADIUS_SCALES[scale]
    return {
        "--radius-sm": r.sm,
        "--radius-md": r.md,
        "--radius-lg": r.lg,
    }
}

/* ─── Presets ─── */
export const THEME_PRESETS: MerchantTheme[] = [
    {
        name: "Indigo",
        font: "geist",
        radius: "rounded",
        vars: {
            ...brandVars("#6366f1", "#4f46e5", "#a5b4fc", "#818cf8"),
            ...radiusVars("rounded"),
        },
    },
    {
        name: "Emerald",
        font: "inter",
        radius: "rounded",
        vars: {
            ...brandVars("#10b981", "#059669", "#6ee7b7", "#34d399"),
            ...radiusVars("rounded"),
        },
    },
    {
        name: "Rose",
        font: "sora",
        radius: "rounded",
        vars: {
            ...brandVars("#f43f5e", "#e11d48", "#fda4af", "#fb7185"),
            ...radiusVars("rounded"),
        },
    },
    {
        name: "Amber",
        font: "outfit",
        radius: "pill",
        vars: {
            ...brandVars("#f59e0b", "#d97706", "#fcd34d", "#fbbf24"),
            ...radiusVars("pill"),
        },
    },
    {
        name: "Violet",
        font: "geist",
        radius: "rounded",
        vars: {
            ...brandVars("#8b5cf6", "#7c3aed", "#c4b5fd", "#a78bfa"),
            ...radiusVars("rounded"),
        },
    },
    {
        name: "Sky",
        font: "inter",
        radius: "sharp",
        vars: {
            ...brandVars("#0ea5e9", "#0284c7", "#7dd3fc", "#38bdf8"),
            ...radiusVars("sharp"),
        },
    },
    {
        name: "Élégant",
        font: "merriweather",
        radius: "sharp",
        vars: {
            ...brandVars("#1e293b", "#0f172a", "#94a3b8", "#64748b"),
            ...radiusVars("sharp"),
        },
    },
]

/** Default theme applied on first load: black brand, Outfit font, rounded corners */
export const DEFAULT_THEME: MerchantTheme = {
    name: "Noir",
    font: "outfit",
    radius: "rounded",
    vars: {
        ...brandVars("#09090b", "#27272a", "#71717a", "#52525b"),
        ...radiusVars("rounded"),
    },
}

/** Derive the CSS vars to apply to a wrapper element from a full theme */
export function themeToStyle(theme: MerchantTheme): React.CSSProperties {
    return {
        ...theme.vars,
        fontFamily: FONT_STACKS[theme.font],
    } as React.CSSProperties
}

/** Build a custom theme from individual sliders/pickers */
export function buildCustomTheme(
    primary: string,
    font: FontChoice,
    radius: RadiusScale,
): MerchantTheme {
    // Naive hover: darken by shifting the hex slightly — we just use a fixed
    // small offset since we can't import a color library.
    const hover = primary // caller can override separately if needed
    return {
        name: "Personnalisé",
        font,
        radius,
        vars: {
            "--color-brand-primary": primary,
            "--color-brand-primary-hover": hover,
            "--color-brand-secondary": primary + "66", // 40 % opacity hex trick
            "--color-brand-secondary-hover": primary + "99",
            "--color-border-focus": primary,
            ...radiusVars(radius),
        },
    }
}
