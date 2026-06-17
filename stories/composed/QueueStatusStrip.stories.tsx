import type { Meta, StoryObj } from "@storybook/react"
import { QueueStatusStrip } from "@/components/composed/QueueStatusStrip"

const meta = {
    title: "Composed/QueueStatusStrip",
    component: QueueStatusStrip,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
} satisfies Meta<typeof QueueStatusStrip>

export default meta
type Story = StoryObj<typeof meta>

export const Loading: Story = {
    args: { position: null },
}

export const Waiting: Story = {
    args: { position: 4, status: "waiting" },
}

export const NextInLine: Story = {
    args: { position: 1, status: "waiting" },
}

export const NextUp: Story = {
    args: { position: 0, status: "waiting" },
}

export const Called: Story = {
    args: { position: 0, status: "called" },
}