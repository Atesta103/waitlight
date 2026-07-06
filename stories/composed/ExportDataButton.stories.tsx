import type { Meta, StoryObj } from "@storybook/react"
import { ExportDataButton } from "@/components/composed/ExportDataButton"

const meta = {
    title: "Composed/ExportDataButton",
    component: ExportDataButton,
    tags: ["autodocs"],
    parameters: {
        layout: "centered",
        docs: {
            description: {
                component:
                    "GDPR data export trigger. Calls a server action that's a no-op in Storybook — the button and error state still render correctly.",
            },
        },
    },
} satisfies Meta<typeof ExportDataButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
