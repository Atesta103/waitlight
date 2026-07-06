import type { Meta, StoryObj } from "@storybook/react"
import { UpgradeModal } from "@/components/composed/UpgradeModal"

const meta = {
    title: "Composed/UpgradeModal",
    component: UpgradeModal,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
    args: {
        open: true,
        onClose: () => {},
    },
} satisfies Meta<typeof UpgradeModal>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
