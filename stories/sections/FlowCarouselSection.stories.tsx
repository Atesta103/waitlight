import type { Meta, StoryObj } from "@storybook/react"
import { FlowCarouselSection } from "@/components/sections/marketing/FlowCarouselSection"

const meta = {
    title: "Marketing/FlowCarouselSection",
    component: FlowCarouselSection,
    tags: ["autodocs"],
    parameters: { layout: "fullscreen" },
    args: {
        id: "demo",
    },
} satisfies Meta<typeof FlowCarouselSection>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
