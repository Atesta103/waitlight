import type { Meta, StoryObj } from "@storybook/react"
import { ConnectionStatus } from "@/components/composed/ConnectionStatus"

const meta = {
    title: "Composed/ConnectionStatus",
    component: ConnectionStatus,
    tags: ["autodocs"],
    argTypes: {
        state: {
            control: "select",
            options: ["connected", "reconnecting", "offline"],
        },
    },
} satisfies Meta<typeof ConnectionStatus>

export default meta
type Story = StoryObj<typeof meta>
type StoryRender = StoryObj

export const Connected: Story = {
    args: { state: "connected" },
}

export const Reconnecting: Story = {
    args: { state: "reconnecting" },
}

export const Offline: Story = {
    args: { state: "offline" },
}

export const AllStates: StoryRender = {
    render: () => (
        <div className="flex flex-col gap-2 w-72">
            <ConnectionStatus state="connected" />
            <ConnectionStatus state="reconnecting" />
            <ConnectionStatus state="offline" />
        </div>
    ),
}
