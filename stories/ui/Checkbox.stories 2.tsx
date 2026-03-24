import type { Meta, StoryObj } from "@storybook/react"
import { Checkbox } from "@/components/ui/Checkbox"

const meta = {
    title: "UI/Checkbox",
    component: Checkbox,
    tags: ["autodocs"],
    argTypes: {
        disabled: { control: "boolean" },
    },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Unchecked: Story = {
    args: { label: "Activer les notifications", defaultChecked: false },
}

export const Checked: Story = {
    args: { label: "Activer les notifications", defaultChecked: true },
}

export const WithError: Story = {
    args: {
        label: "Accepter les conditions d'utilisation",
        error: "Vous devez accepter les conditions.",
    },
}

export const Disabled: Story = {
    args: {
        label: "Option indisponible",
        disabled: true,
    },
}

export const DisabledChecked: Story = {
    args: {
        label: "Option indisponible (active)",
        disabled: true,
        defaultChecked: true,
    },
}
