import type { Meta, StoryObj } from "@storybook/react"
import { FaqSection } from "@/components/sections/marketing/FaqSection"

const meta = {
    title: "Marketing/FaqSection",
    component: FaqSection,
    tags: ["autodocs"],
    parameters: { layout: "fullscreen" },
    args: {
        id: "faq",
    },
} satisfies Meta<typeof FaqSection>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
