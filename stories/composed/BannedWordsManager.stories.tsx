import type { Meta, StoryObj } from "@storybook/react"
import { BannedWordsManager } from "@/components/composed/BannedWordsManager"

const meta = {
    title: "Composed/BannedWordsManager",
    component: BannedWordsManager,
    tags: ["autodocs"],
    parameters: {
        layout: "padded",
        docs: {
            description: {
                component:
                    "Full CRUD UI for a merchant's banned words list. Fetches via server actions — these are no-ops in Storybook, the empty/loading state still renders correctly.",
            },
        },
    },
} satisfies Meta<typeof BannedWordsManager>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
