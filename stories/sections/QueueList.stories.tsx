import type { Meta } from "@storybook/react"
import { QueueList } from "@/components/sections/QueueList"
import type { QueueItem } from "@/lib/actions/queue"

const now = new Date()
const ago = (m: number) => new Date(now.getTime() - m * 60_000).toISOString()

const mockItems: QueueItem[] = [
    {
        id: "ticket-01",
        customer_name: "Marie Dupont",
        entry_source: "qr",
        status: "called",
        joined_at: ago(15),
        called_at: ago(2),
        done_at: null,
        merchant_id: "mock-merchant",
    },
    {
        id: "ticket-02",
        customer_name: "Jean Martin",
        entry_source: "manual",
        status: "waiting",
        joined_at: ago(10),
        called_at: null,
        done_at: null,
        merchant_id: "mock-merchant",
    },
    {
        id: "ticket-03",
        customer_name: "Sophie Bernard",
        entry_source: "qr",
        status: "waiting",
        joined_at: ago(7),
        called_at: null,
        done_at: null,
        merchant_id: "mock-merchant",
    },
    {
        id: "ticket-04",
        customer_name: "Lucas Petit",
        entry_source: "qr",
        status: "waiting",
        joined_at: ago(3),
        called_at: null,
        done_at: null,
        merchant_id: "mock-merchant",
    },
]

const meta = {
    title: "Sections/QueueList",
    component: QueueList,
    tags: ["autodocs"],
    parameters: {
        layout: "padded",
        docs: {
            description: {
                component:
                    "Live queue organism. Uses TanStack Query + Supabase Realtime. In Storybook, passes initialItems so it renders without a real Supabase connection.",
            },
        },
    },
} satisfies Meta<typeof QueueList>

export default meta

export const WithTickets = {
    args: { merchantId: "mock-merchant" },
    render: () => (
        <QueueList merchantId="mock-merchant" initialItems={mockItems} />
    ),
}

export const Empty = {
    args: { merchantId: "mock-merchant" },
    render: () => (
        <QueueList merchantId="mock-merchant" initialItems={[]} />
    ),
}

export const CalledOnly = {
    args: { merchantId: "mock-merchant" },
    render: () => (
        <QueueList
            merchantId="mock-merchant"
            initialItems={[mockItems[0]!]}
        />
    ),
}
