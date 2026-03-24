import type { Meta, StoryObj } from "@storybook/react"
import { ProgressBar } from "@/components/ui/ProgressBar"

const meta = {
    title: "UI/ProgressBar",
    component: ProgressBar,
    tags: ["autodocs"],
    argTypes: {
        variant: {
            control: "select",
            options: ["default", "success", "warning", "error"],
        },
        size: {
            control: "select",
            options: ["sm", "md", "lg"],
        },
        value: { control: { type: "range", min: 0, max: 100 } },
        showValue: { control: "boolean" },
    },
} satisfies Meta<typeof ProgressBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: { value: 60, label: "Progression" },
}

export const Empty: Story = {
    args: { value: 0, label: "Vide" },
}

export const Full: Story = {
    args: { value: 100, label: "Complet", variant: "success" },
}

export const Warning: Story = {
    args: { value: 75, label: "Presque plein", variant: "warning", showValue: true },
}

export const Error: Story = {
    args: { value: 92, label: "File saturée", variant: "error", showValue: true },
}

export const Small: Story = {
    args: { value: 50, size: "sm" },
}

export const Large: Story = {
    args: { value: 50, size: "lg", label: "Grande barre", showValue: true },
}

export const AllVariants: Story = {
    args: { value: 60 },
    render: () => (
        <div className="flex w-72 flex-col gap-4">
            <ProgressBar value={60} label="Default" variant="default" />
            <ProgressBar value={85} label="Success" variant="success" />
            <ProgressBar value={70} label="Warning" variant="warning" />
            <ProgressBar value={92} label="Error" variant="error" />
        </div>
    ),
}
