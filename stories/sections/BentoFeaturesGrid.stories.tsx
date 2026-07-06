import type { Meta, StoryObj } from "@storybook/react"
import { BentoFeaturesGrid } from "@/components/sections/marketing/BentoFeaturesGrid"

const meta = {
    title: "Marketing/BentoFeaturesGrid",
    component: BentoFeaturesGrid,
    tags: ["autodocs"],
    parameters: { layout: "fullscreen" },
    args: {
        id: "fonctionnalites",
    },
} satisfies Meta<typeof BentoFeaturesGrid>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
