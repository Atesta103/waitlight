import type { Meta } from "@storybook/react"
import { AnalyticsDashboard } from "@/components/sections/AnalyticsDashboard"
import type { AnalyticsRow } from "@/lib/actions/analytics"

// Realistic mock data spanning the week
const mockData: AnalyticsRow[] = [
    // Monday peak at noon
    { day_of_week: 1, hour: 9, ticket_count: 4, avg_wait_minutes: 6 },
    { day_of_week: 1, hour: 10, ticket_count: 8, avg_wait_minutes: 8 },
    { day_of_week: 1, hour: 11, ticket_count: 15, avg_wait_minutes: 10 },
    { day_of_week: 1, hour: 12, ticket_count: 22, avg_wait_minutes: 12 },
    { day_of_week: 1, hour: 13, ticket_count: 18, avg_wait_minutes: 11 },
    { day_of_week: 1, hour: 14, ticket_count: 10, avg_wait_minutes: 7 },
    { day_of_week: 1, hour: 15, ticket_count: 7, avg_wait_minutes: 5 },
    { day_of_week: 1, hour: 16, ticket_count: 12, avg_wait_minutes: 8 },
    { day_of_week: 1, hour: 17, ticket_count: 20, avg_wait_minutes: 14 },
    // Wednesday
    { day_of_week: 3, hour: 10, ticket_count: 6, avg_wait_minutes: 5 },
    { day_of_week: 3, hour: 11, ticket_count: 9, avg_wait_minutes: 7 },
    { day_of_week: 3, hour: 12, ticket_count: 14, avg_wait_minutes: 9 },
    { day_of_week: 3, hour: 13, ticket_count: 11, avg_wait_minutes: 8 },
    // Friday
    { day_of_week: 5, hour: 12, ticket_count: 28, avg_wait_minutes: 18 },
    { day_of_week: 5, hour: 13, ticket_count: 24, avg_wait_minutes: 16 },
    { day_of_week: 5, hour: 17, ticket_count: 19, avg_wait_minutes: 13 },
    { day_of_week: 5, hour: 18, ticket_count: 23, avg_wait_minutes: 15 },
    // Saturday
    { day_of_week: 6, hour: 9, ticket_count: 12, avg_wait_minutes: 9 },
    { day_of_week: 6, hour: 10, ticket_count: 20, avg_wait_minutes: 11 },
    { day_of_week: 6, hour: 11, ticket_count: 30, avg_wait_minutes: 20 },
    { day_of_week: 6, hour: 12, ticket_count: 35, avg_wait_minutes: 25 },
]

const meta = {
    title: "Sections/AnalyticsDashboard",
    component: AnalyticsDashboard,
    tags: ["autodocs"],
    parameters: {
        layout: "padded",
        docs: {
            description: {
                component:
                    "Analytics dashboard with heatmap and rush curve. Uses initialData for SSR — queries fall back gracefully in Storybook.",
            },
        },
    },
} satisfies Meta<typeof AnalyticsDashboard>

export default meta

export const WithData = {
    args: { merchantId: "00000000-0000-0000-0000-000000000001" },
    render: () => (
        <AnalyticsDashboard
            merchantId="00000000-0000-0000-0000-000000000001"
            initialData={mockData}
        />
    ),
}

export const Empty = {
    args: { merchantId: "00000000-0000-0000-0000-000000000001" },
    render: () => (
        <AnalyticsDashboard
            merchantId="00000000-0000-0000-0000-000000000001"
            initialData={[]}
        />
    ),
}
