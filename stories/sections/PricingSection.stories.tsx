import type { Meta, StoryObj } from "@storybook/react"
import { PricingSection } from "@/components/sections/marketing/PricingSection"

const meta = {
    title: "Marketing/PricingSection",
    component: PricingSection,
    tags: ["autodocs"],
    parameters: { layout: "fullscreen" },
    args: {
        id: "tarifs",
    },
} satisfies Meta<typeof PricingSection>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
