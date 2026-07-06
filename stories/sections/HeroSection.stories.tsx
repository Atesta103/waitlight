import type { Meta, StoryObj } from "@storybook/react"
import { HeroSection } from "@/components/sections/marketing/HeroSection"

const meta = {
    title: "Marketing/HeroSection",
    component: HeroSection,
    tags: ["autodocs"],
    parameters: { layout: "fullscreen" },
    args: {
        id: "hero",
    },
} satisfies Meta<typeof HeroSection>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
