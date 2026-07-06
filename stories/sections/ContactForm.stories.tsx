import type { Meta, StoryObj } from "@storybook/react"
import { ContactForm } from "@/components/sections/marketing/ContactForm"

const meta = {
    title: "Marketing/ContactForm",
    component: ContactForm,
    tags: ["autodocs"],
    parameters: {
        layout: "padded",
        docs: {
            description: {
                component:
                    "Contact form with Zod validation. Submits via a server action that's a no-op in Storybook — validation and the idle state still render correctly.",
            },
        },
    },
} satisfies Meta<typeof ContactForm>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
