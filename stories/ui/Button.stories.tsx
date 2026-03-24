import type { Meta, StoryObj } from "@storybook/react"
import { Button } from "@/components/ui/Button"
import { Mail, Plus, Trash2 } from "lucide-react"

const meta = {
    title: "UI/Button",
    component: Button,
    tags: ["autodocs"],
    argTypes: {
        variant: {
            control: "select",
            options: ["primary", "secondary", "ghost", "destructive"],
        },
        size: {
            control: "select",
            options: ["sm", "md", "lg"],
        },
        isLoading: { control: "boolean" },
        disabled: { control: "boolean" },
    },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
    args: { children: "Appeler", variant: "primary", size: "md" },
}

export const Secondary: Story = {
    args: { children: "Annuler", variant: "secondary", size: "md" },
}

export const Ghost: Story = {
    args: { children: "Ignorer", variant: "ghost", size: "md" },
}

export const Destructive: Story = {
    args: { children: "Supprimer le compte", variant: "destructive", size: "md" },
}

export const Small: Story = {
    args: { children: "Sm", variant: "primary", size: "sm" },
}

export const Large: Story = {
    args: { children: "Ouvrir la file", variant: "primary", size: "lg" },
}

export const Loading: Story = {
    args: { children: "Enregistrement…", variant: "primary", isLoading: true },
}

export const Disabled: Story = {
    args: { children: "Indisponible", variant: "primary", disabled: true },
}

export const WithIcon: Story = {
    args: {
        children: (
            <>
                <Mail size={16} />
                Envoyer
            </>
        ),
        variant: "primary",
    },
}

export const IconOnly: Story = {
    args: {
        children: <Plus size={18} />,
        variant: "primary",
        size: "md",
        "aria-label": "Ajouter",
    },
}

export const AllVariants: Story = {
    render: () => (
        <div className="flex flex-wrap gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">
                <Trash2 size={16} />
                Destructive
            </Button>
        </div>
    ),
}

export const AllSizes: Story = {
    render: () => (
        <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Petit</Button>
            <Button size="md">Moyen</Button>
            <Button size="lg">Grand</Button>
        </div>
    ),
}
