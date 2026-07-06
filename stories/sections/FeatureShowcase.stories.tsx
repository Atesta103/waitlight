import type { Meta, StoryObj } from "@storybook/react"
import { FeatureShowcase } from "@/components/sections/marketing/FeatureShowcase"

const meta = {
    title: "Marketing/FeatureShowcase",
    component: FeatureShowcase,
    tags: ["autodocs"],
    parameters: { layout: "fullscreen" },
    args: {
        id: "showcase",
    },
} satisfies Meta<typeof FeatureShowcase>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
