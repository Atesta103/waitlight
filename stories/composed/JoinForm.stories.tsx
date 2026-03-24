import type { Meta, StoryObj } from "@storybook/react"
import { JoinForm } from "@/components/composed/JoinForm"

const meta = {
    title: "Composed/JoinForm",
    component: JoinForm,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
    args: {
        onSubmit: (data: { customerName: string; consent: boolean }) =>
            alert(JSON.stringify(data, null, 2)),
    },
} satisfies Meta<typeof JoinForm>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Loading: Story = {
    args: { isLoading: true },
}
