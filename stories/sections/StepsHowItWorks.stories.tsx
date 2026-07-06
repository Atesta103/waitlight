import type { Meta, StoryObj } from "@storybook/react"
import { StepsHowItWorks } from "@/components/sections/marketing/StepsHowItWorks"

const meta = {
    title: "Marketing/StepsHowItWorks",
    component: StepsHowItWorks,
    tags: ["autodocs"],
    parameters: { layout: "fullscreen" },
    args: {
        id: "comment-ca-marche",
    },
} satisfies Meta<typeof StepsHowItWorks>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
