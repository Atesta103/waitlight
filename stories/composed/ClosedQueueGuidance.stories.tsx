import type { Meta, StoryObj } from "@storybook/react"
import { ClosedQueueGuidance } from "@/components/composed/ClosedQueueGuidance"

const meta = {
    title: "Composed/ClosedQueueGuidance",
    component: ClosedQueueGuidance,
    tags: ["autodocs"],
    parameters: { layout: "padded" },
    args: {
        customerLabelPlural: "clients",
        onOpenQueue: () => {},
        isOpening: false,
    },
} satisfies Meta<typeof ClosedQueueGuidance>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Opening: Story = {
    args: { isOpening: true },
}

export const HealthcareWording: Story = {
    args: { customerLabelPlural: "patients" },
}
