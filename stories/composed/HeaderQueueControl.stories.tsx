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
    args: { initialIsOpen: true, merchantSlug: "boulangerie-martin", merchantId: "123" },
    render: () => (
        <HeaderQueueControl
            initialIsOpen={true}
            merchantSlug="boulangerie-martin"
            merchantId="123"
        />
    ),
}

export const Closed = {
    args: { initialIsOpen: false, merchantSlug: "boulangerie-martin", merchantId: "123" },
    render: () => (
        <HeaderQueueControl
            initialIsOpen={false}
            merchantSlug="boulangerie-martin"
            merchantId="123"
        />
    ),
}
