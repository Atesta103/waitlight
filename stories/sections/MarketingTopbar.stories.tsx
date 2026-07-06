import type { Meta, StoryObj } from "@storybook/react"
import { MarketingTopbar } from "@/components/sections/marketing/MarketingTopbar"

const meta = {
    title: "Marketing/MarketingTopbar",
    component: MarketingTopbar,
    tags: ["autodocs"],
    parameters: { layout: "fullscreen" },
    args: {
        links: [
            { href: "#fonctionnalites", label: "Fonctionnalités" },
            { href: "#secteurs", label: "Secteurs" },
            { href: "#tarifs", label: "Tarifs" },
            { href: "#faq", label: "FAQ" },
        ],
    },
} satisfies Meta<typeof MarketingTopbar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
