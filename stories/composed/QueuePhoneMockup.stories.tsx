import type { Meta, StoryObj } from "@storybook/react"
import { QueuePhoneMockup } from "@/components/composed/QueuePhoneMockup"

const meta = {
    title: "Composed/QueuePhoneMockup",
    component: QueuePhoneMockup,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
    args: {
        name: "Boulangerie Martin",
        welcomeMessage: "Bienvenue ! Merci de patienter, nous vous accueillerons très bientôt.",
        thankYouTitle: "Merci de votre visite !",
        thankYouMessage: "",
    },
} satisfies Meta<typeof QueuePhoneMockup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const CustomThankYou: Story = {
    args: {
        thankYouTitle: "À très bientôt !",
        thankYouMessage: "N'hésitez pas à nous laisser un avis en ligne.",
    },
}
