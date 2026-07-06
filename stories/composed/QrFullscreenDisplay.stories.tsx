import type { Meta, StoryObj } from "@storybook/react"
import { QrFullscreenDisplay } from "@/components/composed/QrFullscreenDisplay"

const meta = {
    title: "Composed/QrFullscreenDisplay",
    component: QrFullscreenDisplay,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
    args: {
        slug: "boulangerie-martin",
        size: 280,
        initialMode: "kiosk",
    },
} satisfies Meta<typeof QrFullscreenDisplay>

export default meta
type Story = StoryObj<typeof meta>

export const Kiosk: Story = {}

export const Assisted: Story = {
    args: { initialMode: "assisted" },
}
