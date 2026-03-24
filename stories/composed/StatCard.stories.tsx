import type { Meta, StoryObj } from "@storybook/react"
import { StatCard } from "@/components/composed/StatCard"
import { Users } from "lucide-react"

const meta = {
    title: "Composed/StatCard",
    component: StatCard,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
} satisfies Meta<typeof StatCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: { label: "Clients servis aujourd'hui", value: 42 },
}

export const TrendUp: Story = {
    args: {
        label: "Clients servis aujourd'hui",
        value: 42,
        trend: "up",
        trendLabel: "+12% vs hier",
        icon: <Users size={18} />,
    },
}

export const TrendDown: Story = {
    args: {
        label: "Temps moyen d'attente",
        value: "8 min",
        trend: "down",
        trendLabel: "-2 min vs hier",
    },
}

export const Neutral: Story = {
    args: {
        label: "Taux d'abandon",
        value: "5%",
        trend: "neutral",
        trendLabel: "Stable",
    },
}

export const AllCards: Story = {
    args: { label: "Placeholder", value: 0 },
    render: () => (
        <div className="grid grid-cols-2 gap-4 w-[480px]">
            <StatCard label="Clients servis" value={42} trend="up" trendLabel="+12% vs hier" icon={<Users size={18} />} />
            <StatCard label="Temps moyen" value="8 min" trend="down" trendLabel="-2 min" />
            <StatCard label="Taux d'abandon" value="5%" trend="neutral" trendLabel="Stable" />
            <StatCard label="Heure de pointe" value="12h" />
        </div>
    ),
}
