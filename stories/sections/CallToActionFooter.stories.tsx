import type { Meta, StoryObj } from "@storybook/react"
import { CallToActionFooter } from "@/components/sections/marketing/CallToActionFooter"

const meta = {
    title: "Marketing/CallToActionFooter",
    component: CallToActionFooter,
    tags: ["autodocs"],
    parameters: { layout: "fullscreen" },
    args: {
        id: "cta",
    },
} satisfies Meta<typeof CallToActionFooter>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
