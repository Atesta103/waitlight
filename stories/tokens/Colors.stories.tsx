import type { Meta, StoryObj } from "@storybook/react"

const meta = {
    title: "Design Tokens/Colors",
    tags: ["autodocs"],
} satisfies Meta

export default meta
type Story = StoryObj

const COLOR_GROUPS = [
    {
        label: "Brand",
        tokens: [
            { name: "brand-primary", css: "--color-brand-primary", hex: "#6366f1" },
            { name: "brand-primary-hover", css: "--color-brand-primary-hover", hex: "#4f46e5" },
            { name: "brand-secondary", css: "--color-brand-secondary", hex: "#a5b4fc" },
            { name: "brand-secondary-hover", css: "--color-brand-secondary-hover", hex: "#818cf8" },
        ],
    },
    {
        label: "Status",
        tokens: [
            { name: "status-waiting", css: "--color-status-waiting", hex: "#f59e0b" },
            { name: "status-waiting-bg", css: "--color-status-waiting-bg", hex: "#fef3c7" },
            { name: "status-called", css: "--color-status-called", hex: "#10b981" },
            { name: "status-called-bg", css: "--color-status-called-bg", hex: "#d1fae5" },
            { name: "status-done", css: "--color-status-done", hex: "#6b7280" },
            { name: "status-done-bg", css: "--color-status-done-bg", hex: "#f3f4f6" },
            { name: "status-cancelled", css: "--color-status-cancelled", hex: "#ef4444" },
            { name: "status-cancelled-bg", css: "--color-status-cancelled-bg", hex: "#fee2e2" },
        ],
    },
    {
        label: "Surfaces",
        tokens: [
            { name: "surface-base", css: "--color-surface-base", hex: "#f9fafb" },
            { name: "surface-card", css: "--color-surface-card", hex: "#ffffff" },
        ],
    },
    {
        label: "Text",
        tokens: [
            { name: "text-primary", css: "--color-text-primary", hex: "#111827" },
            { name: "text-secondary", css: "--color-text-secondary", hex: "#6b7280" },
            { name: "text-disabled", css: "--color-text-disabled", hex: "#d1d5db" },
            { name: "text-inverse", css: "--color-text-inverse", hex: "#ffffff" },
        ],
    },
    {
        label: "Borders",
        tokens: [
            { name: "border-default", css: "--color-border-default", hex: "#e5e7eb" },
            { name: "border-focus", css: "--color-border-focus", hex: "#6366f1" },
        ],
    },
    {
        label: "Feedback",
        tokens: [
            { name: "feedback-error", css: "--color-feedback-error", hex: "#ef4444" },
            { name: "feedback-error-bg", css: "--color-feedback-error-bg", hex: "#fee2e2" },
            { name: "feedback-success", css: "--color-feedback-success", hex: "#10b981" },
            { name: "feedback-success-bg", css: "--color-feedback-success-bg", hex: "#d1fae5" },
            { name: "feedback-warning", css: "--color-feedback-warning", hex: "#f59e0b" },
            { name: "feedback-warning-bg", css: "--color-feedback-warning-bg", hex: "#fef3c7" },
            { name: "feedback-info", css: "--color-feedback-info", hex: "#3b82f6" },
            { name: "feedback-info-bg", css: "--color-feedback-info-bg", hex: "#dbeafe" },
        ],
    },
]

function Swatch({
    name,
    css,
    hex,
}: {
    name: string
    css: string
    hex: string
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <div
                className="h-12 w-full rounded-lg border border-border-default shadow-sm"
                style={{ backgroundColor: `var(${css}, ${hex})` }}
            />
            <p className="text-xs font-medium text-text-primary truncate">{name}</p>
            <p className="text-xs text-text-disabled font-mono">{hex}</p>
        </div>
    )
}

export const AllColors: Story = {
    render: () => (
        <div className="flex flex-col gap-10 p-6 w-full max-w-3xl">
            {COLOR_GROUPS.map((group) => (
                <div key={group.label}>
                    <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-text-secondary">
                        {group.label}
                    </h2>
                    <div className="grid grid-cols-4 gap-4 sm:grid-cols-6 md:grid-cols-8">
                        {group.tokens.map((t) => (
                            <Swatch key={t.name} {...t} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    ),
}
