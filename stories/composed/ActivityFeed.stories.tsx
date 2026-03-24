import type { Meta, StoryObj } from "@storybook/react"
import { ActivityFeed } from "@/components/composed/ActivityFeed"

const meta = {
    title: "Composed/ActivityFeed",
    component: ActivityFeed,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
} satisfies Meta<typeof ActivityFeed>

export default meta
type Story = StoryObj<typeof meta>

const mockItems = [
    {
        id: "a1",
        action: "joined" as const,
        customerName: "Marie Dupont",
        timestamp: "2026-03-02T10:00:00.000Z",
    },
    {
        id: "a2",
        action: "called" as const,
        customerName: "Jean Martin",
        timestamp: "2026-03-02T09:55:00.000Z",
    },
    {
        id: "a3",
        action: "completed" as const,
        customerName: "Sophie Bernard",
        timestamp: "2026-03-02T09:50:00.000Z",
    },
    {
        id: "a4",
        action: "cancelled" as const,
        customerName: "Luc Petit",
        timestamp: "2026-03-02T09:45:00.000Z",
    },
]

export const Default: Story = {
    args: { items: mockItems },
}

export const Empty: Story = {
    args: { items: [] },
}

export const SingleItem: Story = {
    args: { items: [mockItems[0]] },
}
