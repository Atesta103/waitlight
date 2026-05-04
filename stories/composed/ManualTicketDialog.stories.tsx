import type { Meta, StoryObj } from "@storybook/react"
import { ManualTicketDialog } from "@/components/composed/ManualTicketDialog"

const meta = {
    title: "Composed/ManualTicketDialog",
    component: ManualTicketDialog,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
    args: {
        businessType: "retail",
        isSubmitting: false,
        onCreate: async () => ({
            data: {
                id: "ticket-1",
            },
        }),
    },
} satisfies Meta<typeof ManualTicketDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Healthcare: Story = {
    args: {
        businessType: "healthcare",
    },
}
