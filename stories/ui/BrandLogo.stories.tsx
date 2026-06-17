import type { Meta, StoryObj } from "@storybook/react"
import { BrandLogo } from "@/components/ui/BrandLogo"

const meta = {
    title: "UI/BrandLogo",
    component: BrandLogo,
    tags: ["autodocs"],
    argTypes: {
        variant: {
            control: "select",
            options: ["primary", "reverse", "mono", "light"],
        },
        showText: { control: "boolean" },
    },
} satisfies Meta<typeof BrandLogo>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
    args: {
        variant: "primary",
        showText: true,
    },
}

export const MarkOnly: Story = {
    args: {
        variant: "primary",
        showText: false,
    },
}

export const Mono: Story = {
    args: {
        variant: "mono",
        showText: true,
    },
}

export const Variants: Story = {
    render: () => (
        <div className="grid gap-4">
            <div className="rounded-xl border border-border-default bg-surface-card p-5">
                <BrandLogo variant="primary" />
            </div>
            <div className="rounded-xl border border-border-default bg-surface-card p-5">
                <BrandLogo variant="mono" />
            </div>
            <div className="rounded-xl bg-brand-primary p-5">
                <BrandLogo variant="light" />
            </div>
            <div className="rounded-xl bg-text-primary p-5">
                <BrandLogo variant="reverse" />
            </div>
        </div>
    ),
}
