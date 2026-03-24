import type { Meta, StoryObj } from "@storybook/react"
import { StatsPanel } from "@/components/sections/StatsPanel"

const hourlyData = [
    { hour: "8h", count: 2 },
    { hour: "9h", count: 5 },
    { hour: "10h", count: 12 },
    { hour: "11h", count: 18 },
    { hour: "12h", count: 25 },
    { hour: "13h", count: 15 },
    { hour: "14h", count: 8 },
    { hour: "15h", count: 10 },
    { hour: "16h", count: 14 },
    { hour: "17h", count: 20 },
    { hour: "18h", count: 16 },
    { hour: "19h", count: 6 },
]

const meta = {
    title: "Sections/StatsPanel",
    component: StatsPanel,
    tags: ["autodocs"],
    parameters: { layout: "padded" },
    args: {
        servedToday: 42,
        servedTrend: "+12% vs hier",
        avgWaitMinutes: 8,
        avgWaitTrend: "-2 min",
        abandonRate: 5,
        abandonTrend: "Stable",
        peakHour: "12h",
        hourlyData,
    },
} satisfies Meta<typeof StatsPanel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const HighAbandonment: Story = {
    args: {
        abandonRate: 22,
        abandonTrend: "+7% vs hier",
    },
}

export const QuietDay: Story = {
    args: {
        servedToday: 8,
        servedTrend: "-40% vs hier",
        avgWaitMinutes: 3,
        avgWaitTrend: "-5 min",
        hourlyData: hourlyData.map((d) => ({ ...d, count: Math.floor(d.count * 0.2) })),
    },
}
