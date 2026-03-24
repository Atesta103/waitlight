import type { Meta } from "@storybook/react"
import { UserMenu } from "@/components/composed/UserMenu"

// UserMenu uses next/navigation (useRouter) — next-intl / router mock not configured.
// Wrap in a decorator that provides a dummy router context via storybook-nextjs-intl
// or simply note the limitation in the story description.
const meta = {
    title: "Composed/UserMenu",
    component: UserMenu,
    tags: ["autodocs"],
    parameters: {
        layout: "padded",
        docs: {
            description: {
                component:
                    "Dropdown avatar menu. Navigation actions (Settings, Sign out) require a real Next.js router — they are no-ops in Storybook.",
            },
        },
    },
} satisfies Meta<typeof UserMenu>

export default meta

export const Default = {
    args: { name: "Marie Dupont" },
    render: () => <UserMenu name="Marie Dupont" />,
}

export const SingleName = {
    args: { name: "Pierre" },
    render: () => <UserMenu name="Pierre" />,
}

export const LongName = {
    args: { name: "Alexandrina Beauchamp-Thibault" },
    render: () => <UserMenu name="Alexandrina Beauchamp-Thibault" />,
}
