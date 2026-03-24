import type { Meta } from "@storybook/react"
import { AdminDashboard } from "@/components/sections/AdminDashboard"

// AdminDashboard uses TanStack Query (useQuery) for subscriptions/stats
// Wrap in a QueryClientProvider via the global decorator in .storybook/preview.tsx
const meta = {
    title: "Sections/AdminDashboard",
    component: AdminDashboard,
    tags: ["autodocs"],
    parameters: {
        layout: "padded",
        docs: {
            description: {
                component:
                    "Full admin analytics dashboard. Requires a running Supabase instance for live data — renders static shell in Storybook.",
            },
        },
    },
} satisfies Meta<typeof AdminDashboard>

export default meta

export const Default = {
    args: {
        merchantId: "00000000-0000-0000-0000-000000000001",
        merchantName: "Boulangerie Martin",
    },
    render: () => (
        <AdminDashboard
            merchantId="00000000-0000-0000-0000-000000000001"
            merchantName="Boulangerie Martin"
        />
    ),
}
