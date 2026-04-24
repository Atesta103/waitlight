import type { Meta, StoryObj } from "@storybook/react"
import { DashboardHeader } from "@/components/sections/DashboardHeader"

const meta = {
    title: "Sections/DashboardHeader",
    component: DashboardHeader,
    tags: ["autodocs"],
    parameters: { layout: "padded" },
    args: {
        merchantName: "Boulangerie Martin",
        merchantSlug: "boulangerie-martin",
        isOpen: true,
        waitingCount: 5,
        onToggleOpen: () => {},
    },
} satisfies Meta<typeof DashboardHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Open: Story = {}

export const Closed: Story = {
    args: { merchantSlug: "boulangerie-martin", isOpen: false, waitingCount: 0 },
}

export const HighTraffic: Story = {
    args: { merchantSlug: "boulangerie-martin", isOpen: true, waitingCount: 24 },
}

export const NoClients: Story = {
    args: { merchantSlug: "boulangerie-martin", isOpen: true, waitingCount: 0 },
}
