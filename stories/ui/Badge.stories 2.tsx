import type { Meta, StoryObj } from "@storybook/react"
import { Badge } from "@/components/ui/Badge"

const meta = {
    title: "UI/Badge",
    component: Badge,
    tags: ["autodocs"],
    argTypes: {
        status: {
            control: "select",
            options: ["waiting", "called", "done", "cancelled"],
        },
        showIcon: { control: "boolean" },
    },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Waiting: Story = {
    args: { status: "waiting", showIcon: true },
}

export const Called: Story = {
    args: { status: "called", showIcon: true },
}

export const Done: Story = {
    args: { status: "done", showIcon: true },
}

export const Cancelled: Story = {
    args: { status: "cancelled", showIcon: true },
}

export const WithoutIcon: Story = {
    args: { status: "waiting", showIcon: false },
}

export const CustomLabel: Story = {
    args: { status: "called", showIcon: true, children: "Votre tour !" },
}

export const AllStatuses: Story = {
    args: { status: "waiting" },
    render: () => (
        <div className="flex flex-wrap gap-2">
            <Badge status="waiting" />
            <Badge status="called" />
            <Badge status="done" />
            <Badge status="cancelled" />
        </div>
    ),
}
