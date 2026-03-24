import type { Meta, StoryObj } from "@storybook/react"
import { Divider } from "@/components/ui/Divider"

const meta = {
    title: "UI/Divider",
    component: Divider,
    tags: ["autodocs"],
    parameters: { layout: "padded" },
} satisfies Meta<typeof Divider>

export default meta
type Story = StoryObj<typeof meta>

export const Plain: Story = {
    args: {},
}

export const WithLabel: Story = {
    args: { label: "ou continuer avec" },
}

export const InContext: Story = {
    render: () => (
        <div className="flex w-72 flex-col gap-4">
            <p className="text-sm text-text-secondary">Email / Mot de passe</p>
            <Divider label="ou continuer avec" />
            <p className="text-center text-sm text-text-secondary">Google / Apple</p>
        </div>
    ),
}
