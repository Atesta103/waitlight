import type { Meta, StoryObj } from "@storybook/react"
import { WaitTimePicker } from "@/components/composed/WaitTimePicker"

const meta = {
    title: "Composed/WaitTimePicker",
    component: WaitTimePicker,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
} satisfies Meta<typeof WaitTimePicker>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithAverage: Story = {
    args: { queueAvgMinutes: 12 },
}

export const NoAverage: Story = {
    args: { queueAvgMinutes: null },
}
