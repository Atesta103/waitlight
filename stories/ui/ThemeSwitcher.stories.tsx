import type { Meta, StoryObj } from "@storybook/react"
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher"

const meta = {
    title: "UI/ThemeSwitcher",
    component: ThemeSwitcher,
    parameters: {
        layout: "centered",
    },
} satisfies Meta<typeof ThemeSwitcher>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
