import type { Meta, StoryObj } from "@storybook/react"
import { CustomerWaitView } from "@/components/sections/CustomerWaitView"

const meta = {
    title: "Sections/CustomerWaitView",
    component: CustomerWaitView,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
    decorators: [
        (Story: React.ComponentType) => (
            <div className="w-screen max-w-sm mx-auto p-6 rounded-xl border border-border-default">
                <Story />
            </div>
        ),
    ],
    args: {
        customerName: "Marie",
        connectionState: "connected" as const,
        slug: "boulangerie-marie",
        ticketId: "ticket_001",
    },
} satisfies Meta<typeof CustomerWaitView>

export default meta
type Story = StoryObj<typeof meta>

export const Waiting: Story = {
    args: {
        status: "waiting",
        position: 3,
        totalWaiting: 9,
        estimatedWaitMinutes: 15,
    },
}

export const NextInLine: Story = {
    args: {
        status: "waiting",
        position: 0,
        totalWaiting: 1,
        estimatedWaitMinutes: 0,
    },
}

export const Called: Story = {
    args: {
        status: "called",
        position: null,
        totalWaiting: null,
        estimatedWaitMinutes: null,
    },
}

export const Done: Story = {
    args: {
        status: "done",
        position: null,
        totalWaiting: null,
        estimatedWaitMinutes: null,
    },
}

export const DoneCustomThankYou: Story = {
    args: {
        status: "done",
        position: null,
        totalWaiting: null,
        estimatedWaitMinutes: null,
        thankYouMessage: "Merci d'avoir joué chez nous ! N'hésitez pas à laisser un avis sur Google.",
    },
}

export const Cancelled: Story = {
    args: {
        status: "cancelled",
        position: null,
        totalWaiting: null,
        estimatedWaitMinutes: null,
    },
}

export const Offline: Story = {
    args: {
        status: "waiting",
        position: 3,
        totalWaiting: 9,
        estimatedWaitMinutes: 15,
        connectionState: "offline" as const,
    },
}

export const Reconnecting: Story = {
    args: {
        status: "waiting",
        position: 3,
        totalWaiting: 9,
        estimatedWaitMinutes: 15,
        connectionState: "reconnecting" as const,
    },
}

export const WithBackground: Story = {
    args: {
        status: "waiting",
        position: 3,
        totalWaiting: 9,
        estimatedWaitMinutes: 15,
        backgroundUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2000&auto=format&fit=crop",
    },
}
