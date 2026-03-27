import type { Meta, StoryObj } from "@storybook/react"
import { QueueDot } from "@/components/ui/QueueDot"

const meta = {
    title: "UI/QueueDot",
    component: QueueDot,
    tags: ["autodocs"],
    argTypes: {
        variant: {
            control: "select",
            options: ["ahead", "you", "behind"],
        },
    },
} satisfies Meta<typeof QueueDot>

export default meta
type Story = StoryObj<typeof meta>
type StoryRender = StoryObj

export const Ahead: Story = {
    args: { variant: "ahead" },
}

export const You: Story = {
    args: { variant: "you" },
}

export const Behind: Story = {
    args: { variant: "behind" },
}

export const QueueVisualization: StoryRender = {
    render: () => (
        <div className="flex flex-col items-center gap-2">
            <QueueDot variant="ahead" />
            <QueueDot variant="ahead" />
            <QueueDot variant="you" />
            <QueueDot variant="behind" />
            <QueueDot variant="behind" />
        </div>
    ),
}
