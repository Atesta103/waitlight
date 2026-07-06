import type { Meta, StoryObj } from "@storybook/react"
import { MarketingFooter } from "@/components/sections/marketing/MarketingFooter"

const meta = {
    title: "Marketing/MarketingFooter",
    component: MarketingFooter,
    tags: ["autodocs"],
    parameters: { layout: "fullscreen" },
} satisfies Meta<typeof MarketingFooter>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
