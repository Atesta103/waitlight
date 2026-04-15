import type { Meta, StoryObj } from "@storybook/react"
import { ColorPicker } from "@/components/ui/ColorPicker"
import { useState } from "react"

const meta = {
    title: "UI/ColorPicker",
    component: ColorPicker,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {
        value: { control: "color" },
    },
} satisfies Meta<typeof ColorPicker>

export default meta
type Story = StoryObj<typeof meta>

// Internal wrapper to manage state in Storybook
const ColorPickerWithState = (props: React.ComponentProps<typeof ColorPicker>) => {
    const [color, setColor] = useState(props.value || "#4F46E5")
    return (
        <div className="w-[300px]">
            <ColorPicker
                {...props}
                value={color}
                onChange={(e) => setColor(e.target.value)}
            />
        </div>
    )
}

export const Default: Story = {
    render: (args) => <ColorPickerWithState {...args} />,
    args: {
        label: "Couleur de la marque",
        hint: "Choisissez la couleur principale de votre établissement.",
        value: "#4F46E5",
    },
}

export const LightColor: Story = {
    render: (args) => <ColorPickerWithState {...args} />,
    args: {
        label: "Couleur claire",
        hint: "Le texte passera automatiquement en noir pour le contraste.",
        value: "#FDE047", // Yellow
    },
}

export const WithError: Story = {
    render: (args) => <ColorPickerWithState {...args} />,
    args: {
        label: "Couleur de la marque",
        error: "Couleur invalide.",
        value: "#4F46E5",
    },
}