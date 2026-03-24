import type { Meta, StoryObj } from "@storybook/react"
import { PasswordInput } from "@/components/composed/PasswordInput"

const meta = {
    title: "Composed/PasswordInput",
    component: PasswordInput,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
    args: { label: "Mot de passe" },
} satisfies Meta<typeof PasswordInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: { placeholder: "••••••••" },
}

export const WithHint: Story = {
    args: {
        placeholder: "••••••••",
        hint: "Minimum 8 caractères, avec une majuscule et un chiffre.",
    },
}

export const WithError: Story = {
    args: {
        placeholder: "••••••••",
        error: "Le mot de passe est incorrect.",
    },
}

export const WithLabelAction: Story = {
    args: {
        placeholder: "••••••••",
        labelAction: (
            <button
                type="button"
                className="text-xs text-brand-primary hover:underline"
                onClick={() => alert("Mot de passe oublié ?")}
            >
                Mot de passe oublié ?
            </button>
        ),
    },
}
