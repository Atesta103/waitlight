import type { Meta, StoryObj } from "@storybook/react"
import { Textarea } from "@/components/ui/Textarea"

const meta = {
    title: "UI/Textarea",
    component: Textarea,
    tags: ["autodocs"],
    argTypes: {
        disabled: { control: "boolean" },
    },
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {
        label: "Message d'accueil",
        placeholder: "Bienvenue ! Votre commande sera prête dans quelques minutes…",
    },
}

export const WithHint: Story = {
    args: {
        label: "Message d'accueil",
        placeholder: "Bienvenue…",
        hint: "Affiché sur la page d'attente du client. Max 500 caractères.",
    },
}

export const WithError: Story = {
    args: {
        label: "Message d'accueil",
        defaultValue: "x",
        error: "Le message doit contenir au moins 10 caractères.",
    },
}

export const Disabled: Story = {
    args: {
        label: "Message d'accueil",
        defaultValue: "Bienvenue dans notre établissement.",
        disabled: true,
    },
}
