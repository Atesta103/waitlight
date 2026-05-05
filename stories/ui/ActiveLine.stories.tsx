import type { Meta, StoryObj } from "@storybook/react"
import { ActiveLine } from "@/components/ui/ActiveLine"

const meta = {
    title: "UI/ActiveLine",
    component: ActiveLine,
    tags: ["autodocs"],
    argTypes: {
        value: { control: { type: "range", min: 1, max: 6 } },
        max: { control: { type: "range", min: 1, max: 6 } },
    },
} satisfies Meta<typeof ActiveLine>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {
        value: 2,
        max: 4,
        label: "Progression",
    },
    decorators: [
        (Story) => (
            <div className="w-96">
                <Story />
            </div>
        ),
    ],
}

export const Start: Story = {
    args: {
        value: 1,
        max: 4,
        label: "Début",
    },
    decorators: Default.decorators,
}

export const Complete: Story = {
    args: {
        value: 4,
        max: 4,
        label: "Terminé",
    },
    decorators: Default.decorators,
}

export const Steps: Story = {
    args: {
        value: 1,
        max: 4,
        label: "Étapes",
    },
    render: () => (
        <div className="flex w-96 flex-col gap-6">
            <ActiveLine value={1} max={4} label="Étape 1 sur 4" />
            <ActiveLine value={2} max={4} label="Étape 2 sur 4" />
            <ActiveLine value={3} max={4} label="Étape 3 sur 4" />
            <ActiveLine value={4} max={4} label="Étape 4 sur 4" />
        </div>
    ),
}
