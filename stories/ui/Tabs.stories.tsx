import type { Meta, StoryObj } from "@storybook/react"
import { Tabs } from "@/components/ui/Tabs"
import { Settings, BarChart, Users } from "lucide-react"

const meta = {
    title: "UI/Tabs",
    component: Tabs,
    tags: ["autodocs"],
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>
type StoryRender = StoryObj

export const TwoTabs: Story = {
    args: {
        tabs: [
            { value: "queue", label: "File d'attente" },
            { value: "analytics", label: "Analytique" },
        ],
        defaultValue: "queue",
    },
}

export const ThreeTabs: Story = {
    args: {
        tabs: [
            { value: "clients", label: "Clients" },
            { value: "payments", label: "Paiements" },
            { value: "invoices", label: "Factures" },
        ],
        defaultValue: "clients",
    },
}

export const WithIcons: StoryRender = {
    render: () => (
        <Tabs
            tabs={[
                { value: "queue", label: "File", icon: <Users size={14} /> },
                { value: "analytics", label: "Stats", icon: <BarChart size={14} /> },
                { value: "settings", label: "Réglages", icon: <Settings size={14} /> },
            ]}
            defaultValue="queue"
        />
    ),
}
