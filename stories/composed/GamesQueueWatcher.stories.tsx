import type { Meta, StoryObj } from "@storybook/react"
import { GamesQueueWatcher } from "@/components/composed/GamesQueueWatcher"

const meta = {
    title: "Composed/GamesQueueWatcher",
    component: GamesQueueWatcher,
    tags: ["autodocs"],
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component:
                    "Customer queue watcher overlay. The story uses initial query data and disables realtime so it renders without a live Supabase connection.",
            },
        },
    },
    decorators: [
        (Story: React.ComponentType) => (
            <div className="min-h-64 bg-surface-base p-6">
                <Story />
            </div>
        ),
    ],
    args: {
        merchantId: "00000000-0000-0000-0000-000000000001",
        ticketId: "00000000-0000-0000-0000-000000000101",
        customerName: "Marie",
        notificationChannels: {
            sound: false,
            vibrate: false,
            toast: true,
            push: false,
        },
        notificationSound: "arpeggio",
        businessType: "food",
        initialTicket: {
            status: "waiting",
            customer_name: "Marie",
        },
        initialPosition: 3,
        disableRealtime: true,
    },
} satisfies Meta<typeof GamesQueueWatcher>

export default meta
type Story = StoryObj<typeof meta>

export const Waiting: Story = {}

export const Called: Story = {
    args: {
        initialTicket: {
            status: "called",
            customer_name: "Marie",
        },
        initialPosition: 0,
    },
}
