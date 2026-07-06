import type { Meta, StoryObj } from "@storybook/react"
import { SectionReveal } from "@/components/sections/marketing/SectionReveal"

const meta = {
    title: "Marketing/SectionReveal",
    component: SectionReveal,
    tags: ["autodocs"],
    parameters: {
        layout: "padded",
        docs: {
            description: {
                component:
                    "Scroll-triggered fade/slide-in wrapper used around marketing sections. Respects prefers-reduced-motion.",
            },
        },
    },
} satisfies Meta<typeof SectionReveal>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {
        children: (
            <div className="rounded-2xl border border-border-default bg-surface-card p-8 text-center text-text-primary">
                Contenu révélé au scroll
            </div>
        ),
    },
}

export const Delayed: Story = {
    args: {
        delay: 0.3,
        children: (
            <div className="rounded-2xl border border-border-default bg-surface-card p-8 text-center text-text-primary">
                Apparaît avec un délai de 300ms
            </div>
        ),
    },
}
