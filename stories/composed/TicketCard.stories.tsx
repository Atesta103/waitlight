import type { Meta, StoryObj } from "@storybook/react"
import { TicketCard } from "@/components/composed/TicketCard"

const JOINED_AT = new Date(Date.now() - 12 * 60 * 1000).toISOString()
const CALLED_AT = new Date(Date.now() - 2 * 60 * 1000).toISOString()

const meta = {
    title: "Composed/TicketCard",
    component: TicketCard,
    tags: ["autodocs"],
    parameters: { layout: "padded" },
} satisfies Meta<typeof TicketCard>

export default meta
type Story = StoryObj<typeof meta>
type StoryRender = StoryObj

export const Waiting: Story = {
    args: {
        id: "ticket-1",
        customerName: "Marie Dupond",
        status: "waiting",
        position: 1,
        joinedAt: JOINED_AT,
        onCall: (id: string) => alert(`Call ${id}`),
        onCancel: (id: string) => alert(`Cancel ${id}`),
    },
}

export const Called: Story = {
    args: {
        id: "ticket-2",
        customerName: "Lucas Martin",
        status: "called",
        position: 2,
        joinedAt: CALLED_AT,
        onComplete: (id: string) => alert(`Complete ${id}`),
        onCancel: (id: string) => alert(`Cancel ${id}`),
    },
}

export const Done: Story = {
    args: {
        id: "ticket-3",
        customerName: "Pierre Bernard",
        status: "done",
        joinedAt: JOINED_AT,
    },
}

export const Cancelled: Story = {
    args: {
        id: "ticket-4",
        customerName: "Diana Petit",
        status: "cancelled",
        joinedAt: JOINED_AT,
    },
}

export const WithoutPosition: Story = {
    args: {
        id: "ticket-5",
        customerName: "Alice Simon",
        status: "waiting",
        joinedAt: JOINED_AT,
        onCall: () => {},
        onCancel: () => {},
    },
}

export const QueueList: StoryRender = {
    render: () => (
        <div className="flex w-full max-w-xl flex-col gap-3">
            <TicketCard
                id="1"
                customerName="Marie Dupond"
                status="called"
                position={1}
                joinedAt={new Date(Date.now() - 3 * 60 * 1000).toISOString()}
                onComplete={() => {}}
                onCancel={() => {}}
            />
            <TicketCard
                id="2"
                customerName="Lucas Martin"
                status="waiting"
                position={2}
                joinedAt={new Date(Date.now() - 10 * 60 * 1000).toISOString()}
                onCall={() => {}}
                onCancel={() => {}}
            />
            <TicketCard
                id="3"
                customerName="Pierre Bernard"
                status="waiting"
                position={3}
                joinedAt={new Date(Date.now() - 15 * 60 * 1000).toISOString()}
                onCall={() => {}}
                onCancel={() => {}}
            />
        </div>
    ),
}
