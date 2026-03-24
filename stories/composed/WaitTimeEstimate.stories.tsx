import type { Meta, StoryObj } from "@storybook/react"
import { WaitTimeEstimate } from "@/components/composed/WaitTimeEstimate"

const meta = {
    title: "Composed/WaitTimeEstimate",
    component: WaitTimeEstimate,
    tags: ["autodocs"],
    argTypes: {
        minutes: { control: { type: "number", min: -1 } },
    },
} satisfies Meta<typeof WaitTimeEstimate>

export default meta
type Story = StoryObj<typeof meta>
type StoryRender = StoryObj

export const Loading: Story = {
    args: { minutes: null },
}

export const LessThanOneMinute: Story = {
    args: { minutes: 0 },
}

export const OneMinute: Story = {
    args: { minutes: 1 },
}

export const FiveMinutes: Story = {
    args: { minutes: 5 },
}

export const TenMinutes: Story = {
    args: { minutes: 10 },
}

export const AllStates: StoryRender = {
    render: () => (
        <div className="flex flex-col gap-3">
            <WaitTimeEstimate minutes={null} />
            <WaitTimeEstimate minutes={0} />
            <WaitTimeEstimate minutes={1} />
            <WaitTimeEstimate minutes={8} />
        </div>
    ),
}
