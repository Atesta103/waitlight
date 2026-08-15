import type { Meta } from "@storybook/react"
import { DashboardShell } from "@/components/composed/DashboardShell"

// DashboardShell uses next/navigation (usePathname) to decide whether the
// current route gets the fixed-height/internal-scroll shell (queue,
// settings) or a real page-scroll shell (analytics). Storybook has no router,
// so usePathname resolves to null here — stories below show the default
// (non-analytics) fixed-height shell only.
const meta = {
    title: "Composed/DashboardShell",
    component: DashboardShell,
    tags: ["autodocs"],
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component:
                    "Dashboard app shell: fixed header + scroll region, varied by route. Requires a Next.js router for the route-aware behavior — always renders the default (fixed-height) shell in Storybook.",
            },
        },
    },
} satisfies Meta<typeof DashboardShell>

export default meta

export const Default = {
    render: () => (
        <div style={{ height: "500px" }}>
            <DashboardShell
                header={
                    <header className="border-b border-border-default bg-surface-card px-4 py-3 text-sm font-medium text-text-primary">
                        En-tête du tableau de bord
                    </header>
                }
                style={{}}
            >
                <div className="rounded-lg border border-border-default bg-surface-card p-6 text-text-primary">
                    Contenu de la page
                </div>
            </DashboardShell>
        </div>
    ),
}
