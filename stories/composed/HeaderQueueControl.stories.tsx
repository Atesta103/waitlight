import type { Meta } from "@storybook/react"
import { HeaderQueueControl } from "@/components/composed/HeaderQueueControl"

const meta = {
    title: "Composed/HeaderQueueControl",
    component: HeaderQueueControl,
    tags: ["autodocs"],
    parameters: { layout: "padded" },
} satisfies Meta<typeof HeaderQueueControl>

export default meta

export const Open = {
    args: { isOpen: true, waitingCount: 5, merchantSlug: "boulangerie-martin" },
    render: () => (
        <HeaderQueueControl
            isOpen={true}
            waitingCount={5}
            merchantSlug="boulangerie-martin"
            onToggle={() => {}}
        />
    ),
}

export const Closed = {
    args: { isOpen: false, waitingCount: 0, merchantSlug: "boulangerie-martin" },
    render: () => (
        <HeaderQueueControl
            isOpen={false}
            waitingCount={0}
            merchantSlug="boulangerie-martin"
            onToggle={() => {}}
        />
    ),
}
