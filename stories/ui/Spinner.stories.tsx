import type { Meta, StoryObj } from "@storybook/react"
import { Spinner } from "@/components/ui/Spinner"

const meta = {
    title: "UI/Spinner",
    component: Spinner,
    tags: ["autodocs"],
    argTypes: {
        size: {
            control: "select",
            options: ["sm", "md", "lg"],
        },
    },
} satisfies Meta<typeof Spinner>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: { size: "md" },
}

export const Small: Story = {
    args: { size: "sm" },
}

export const Large: Story = {
    args: { size: "lg" },
}

export const AllSizes: Story = {
    render: () => (
        <div className="flex items-center gap-6">
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
        </div>
    ),
}
