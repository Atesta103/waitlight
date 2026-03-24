import type { Meta, StoryObj } from "@storybook/react"
import { QueuePositionCard } from "@/components/composed/QueuePositionCard"

const meta = {
    title: "Composed/QueuePositionCard",
    component: QueuePositionCard,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
} satisfies Meta<typeof QueuePositionCard>

export default meta
type Story = StoryObj<typeof meta>

export const Position3: Story = {
    args: { position: 3, totalWaiting: 9, estimatedMinutes: 15 },
}

export const NextInLine: Story = {
    args: { position: 1, totalWaiting: 3, estimatedMinutes: 5 },
}

export const YourTurn: Story = {
    args: { position: 0, totalWaiting: 0, estimatedMinutes: 0 },
}

export const ImmediateWait: Story = {
    args: { position: 1, totalWaiting: 2, estimatedMinutes: 0.5 },
}

export const LongQueue: Story = {
    args: { position: 12, totalWaiting: 20, estimatedMinutes: 60 },
}

export const NoData: Story = {
    args: { position: null, totalWaiting: null, estimatedMinutes: null },
}
