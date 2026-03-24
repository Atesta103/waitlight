import type { Meta, StoryObj } from "@storybook/react"
import { Input } from "@/components/ui/Input"

const meta = {
    title: "UI/Input",
    component: Input,
    tags: ["autodocs"],
    argTypes: {
        disabled: { control: "boolean" },
    },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: { label: "Nom du client", placeholder: "Marie Dupond" },
}

export const WithHint: Story = {
    args: {
        label: "Email",
        placeholder: "vous@exemple.fr",
        hint: "Utilisé uniquement pour la confirmation.",
        type: "email",
    },
}

export const WithError: Story = {
    args: {
        label: "Nom du client",
        placeholder: "Marie Dupond",
        error: "Ce champ est obligatoire.",
        defaultValue: "",
    },
}

export const Disabled: Story = {
    args: {
        label: "Slug",
        defaultValue: "boulangerie-martin",
        disabled: true,
    },
}

export const Password: Story = {
    args: {
        label: "Mot de passe",
        placeholder: "••••••••",
        type: "password",
    },
}
