import type { Meta, StoryObj } from "@storybook/react"
import { UseCasesGrid } from "@/components/sections/marketing/UseCasesGrid"

const meta = {
    title: "Marketing/UseCasesGrid",
    component: UseCasesGrid,
    tags: ["autodocs"],
    parameters: { layout: "fullscreen" },
    args: {
        id: "secteurs",
    },
} satisfies Meta<typeof UseCasesGrid>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
