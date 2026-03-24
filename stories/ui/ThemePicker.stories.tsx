"use client"

import type { Meta, StoryObj } from "@storybook/react"
import { ThemePicker } from "@/components/ui/ThemePicker"
import { DEFAULT_THEME, THEME_PRESETS } from "@/lib/utils/theme"
import type { MerchantTheme } from "@/lib/utils/theme"
import { useState } from "react"

const meta = {
    title: "UI/ThemePicker",
    component: ThemePicker,
    tags: ["autodocs"],
    parameters: { layout: "padded" },
} satisfies Meta<typeof ThemePicker>

export default meta
type StoryRender = StoryObj

function Preview({ initialTheme }: { initialTheme: MerchantTheme }) {
    const [theme, setTheme] = useState<MerchantTheme>(initialTheme)
    return (
        <div className="flex gap-8" style={theme.vars as React.CSSProperties}>
            <div className="w-56">
                <ThemePicker theme={theme} onChange={setTheme} />
            </div>
            <div className="flex flex-col gap-3 min-w-48">
                <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">
                    Aperçu
                </p>
                <div className="flex gap-2">
                    <button
                        type="button"
                        className="rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white"
                    >
                        Appeler
                    </button>
                    <button
                        type="button"
                        className="rounded-md border border-brand-primary px-4 py-2 text-sm font-medium text-brand-primary"
                    >
                        Annuler
                    </button>
                </div>
                <div className="rounded-lg border border-border-default bg-surface-card p-3 text-sm text-text-primary shadow-sm">
                    Carte de la file d'attente
                </div>
                <p className="text-xs font-mono text-text-secondary">
                    Thème actif : <strong>{theme.name}</strong> / {theme.font} / {theme.radius}
                </p>
            </div>
        </div>
    )
}

export const Default: StoryRender = {
    render: () => <Preview initialTheme={DEFAULT_THEME} />,
}

export const Indigo: StoryRender = {
    render: () => <Preview initialTheme={THEME_PRESETS[0]} />,
}

export const AllPresets: StoryRender = {
    render: () => (
        <div className="flex flex-wrap gap-6">
            {THEME_PRESETS.map((preset) => (
                <div key={preset.name} style={preset.vars as React.CSSProperties} className="flex flex-col gap-2">
                    <p className="text-xs text-text-secondary">{preset.name}</p>
                    <button
                        type="button"
                        className="rounded-md bg-brand-primary px-3 py-1.5 text-sm font-medium text-white"
                    >
                        {preset.name}
                    </button>
                </div>
            ))}
        </div>
    ),
}
