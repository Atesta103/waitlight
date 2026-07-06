import type { Meta, StoryObj } from "@storybook/react"
import { ProblemSolutionSection } from "@/components/sections/marketing/ProblemSolutionSection"

const meta = {
    title: "Marketing/ProblemSolutionSection",
    component: ProblemSolutionSection,
    tags: ["autodocs"],
    parameters: { layout: "fullscreen" },
    args: {
        id: "probleme",
    },
} satisfies Meta<typeof ProblemSolutionSection>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
