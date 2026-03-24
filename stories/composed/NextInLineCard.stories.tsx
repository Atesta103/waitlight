import type { Meta, StoryObj } from "@storybook/react"
import { NextInLineCard } from "@/components/composed/NextInLineCard"

const meta = {
    title: "Composed/NextInLineCard",
    component: NextInLineCard,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
} satisfies Meta<typeof NextInLineCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
