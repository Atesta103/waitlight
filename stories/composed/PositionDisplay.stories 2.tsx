import type { Meta, StoryObj } from "@storybook/react"
import { PositionDisplay } from "@/components/composed/PositionDisplay"

const meta = {
    title: "Composed/PositionDisplay",
    component: PositionDisplay,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
} satisfies Meta<typeof PositionDisplay>

export default meta
type Story = StoryObj<typeof meta>

export const Loading: Story = {
    args: { position: null },
}

export const Position1: Story = {
    args: { position: 1 },
}

export const Position5: Story = {
    args: { position: 5 },
}

export const YourTurn: Story = {
    args: { position: 0 },
}
