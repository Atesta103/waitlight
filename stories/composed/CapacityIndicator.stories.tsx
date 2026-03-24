import type { Meta, StoryObj } from "@storybook/react"
import { CapacityIndicator } from "@/components/composed/CapacityIndicator"

const meta = {
    title: "Composed/CapacityIndicator",
    component: CapacityIndicator,
    tags: ["autodocs"],
    argTypes: {
        current: { control: { type: "number", min: 0, max: 50 } },
        max: { control: { type: "number", min: 1, max: 50 } },
    },
} satisfies Meta<typeof CapacityIndicator>

export default meta
type Story = StoryObj<typeof meta>
type StoryRender = StoryObj

export const Low: Story = {
    args: { current: 5, max: 30 },
}

export const Medium: Story = {
    args: { current: 21, max: 30 },
}

export const AlmostFull: Story = {
    args: { current: 27, max: 30 },
}

export const Full: Story = {
    args: { current: 30, max: 30 },
}

export const AllLevels: StoryRender = {
    render: () => (
        <div className="flex w-80 flex-col gap-4">
            <CapacityIndicator current={5} max={30} />
            <CapacityIndicator current={21} max={30} />
            <CapacityIndicator current={27} max={30} />
            <CapacityIndicator current={30} max={30} />
        </div>
    ),
}
