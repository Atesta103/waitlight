import type { Meta, StoryObj } from "@storybook/react"
import { QrModeToggle } from "@/components/composed/QrModeToggle"

const meta = {
    title: "Composed/QrModeToggle",
    component: QrModeToggle,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
    args: {
        mode: "kiosk",
        onModeChange: () => {},
    },
} satisfies Meta<typeof QrModeToggle>

export default meta
type Story = StoryObj<typeof meta>

export const Kiosk: Story = {}

export const Assisted: Story = {
    args: { mode: "assisted" },
}
