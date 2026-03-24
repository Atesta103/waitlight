import type { Meta, StoryObj } from "@storybook/react"
import { NotificationSandbox } from "@/components/composed/NotificationSandbox"

const meta = {
    title: "Composed/NotificationSandbox",
    component: NotificationSandbox,
    tags: ["autodocs"],
    parameters: {
        layout: "padded",
        docs: {
            description: {
                component:
                    "Interactive sandbox to test all notification channels (sound, vibration, toast, push). Browser notification permission is required for Push OS.",
            },
        },
    },
} satisfies Meta<typeof NotificationSandbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: { customerName: "Marie" },
}

export const CustomName: Story = {
    args: { customerName: "Jean-Baptiste" },
}
