import type { Meta, StoryObj } from "@storybook/react"
import { ImagePlaceholder } from "@/components/sections/marketing/ImagePlaceholder"

const meta = {
    title: "Marketing/ImagePlaceholder",
    component: ImagePlaceholder,
    tags: ["autodocs"],
    parameters: { layout: "padded" },
    args: {
        label: "Capture d'écran du tableau de bord",
    },
} satisfies Meta<typeof ImagePlaceholder>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithCustomHint: Story = {
    args: {
        hint: "Remplacez par une capture réelle du produit",
    },
}
