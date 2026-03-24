import type { Meta, StoryObj } from "@storybook/react"
import { AuthErrorBanner } from "@/components/composed/AuthErrorBanner"

const meta = {
    title: "Composed/AuthErrorBanner",
    component: AuthErrorBanner,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
} satisfies Meta<typeof AuthErrorBanner>

export default meta
type Story = StoryObj<typeof meta>

export const InvalidCredentials: Story = {
    args: { message: "Adresse e-mail ou mot de passe incorrect." },
}

export const EmailTaken: Story = {
    args: { message: "Cette adresse e-mail est déjà utilisée par un autre compte." },
}

export const NetworkError: Story = {
    args: { message: "Une erreur réseau est survenue. Veuillez réessayer." },
}
