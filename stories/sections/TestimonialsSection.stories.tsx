import type { Meta, StoryObj } from "@storybook/react"
import { TestimonialsSection } from "@/components/sections/marketing/TestimonialsSection"

const meta = {
    title: "Marketing/TestimonialsSection",
    component: TestimonialsSection,
    tags: ["autodocs"],
    parameters: { layout: "fullscreen" },
    args: {
        id: "temoignages",
    },
} satisfies Meta<typeof TestimonialsSection>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
