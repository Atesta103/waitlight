import type { Meta, StoryObj } from "@storybook/react"
import { SocialAuthButtons } from "@/components/composed/SocialAuthButtons"

const noop = async () => {
    await new Promise((r) => setTimeout(r, 1000))
}

const meta = {
    title: "Composed/SocialAuthButtons",
    component: SocialAuthButtons,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
    args: { onProvider: noop },
} satisfies Meta<typeof SocialAuthButtons>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: { label: "Continuer" },
}

export const SignIn: Story = {
    args: { label: "Se connecter" },
}

export const SignUp: Story = {
    args: { label: "S'inscrire" },
}

export const GoogleOnly: Story = {
    args: { label: "Continuer", enabledProviders: ["google"] },
}

export const Disabled: Story = {
    args: { label: "Continuer", disabled: true },
}
