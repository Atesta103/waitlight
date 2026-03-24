import type { Meta, StoryObj } from "@storybook/react"
import { Select } from "@/components/ui/Select"

const PREP_OPTIONS = [
    { value: "3", label: "3 minutes" },
    { value: "5", label: "5 minutes" },
    { value: "10", label: "10 minutes" },
    { value: "15", label: "15 minutes" },
]

const meta = {
    title: "UI/Select",
    component: Select,
    tags: ["autodocs"],
    argTypes: {
        disabled: { control: "boolean" },
    },
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {
        label: "Temps de préparation",
        options: PREP_OPTIONS,
        placeholder: "Choisir…",
    },
}

export const WithHint: Story = {
    args: {
        label: "Temps de préparation",
        options: PREP_OPTIONS,
        hint: "Utilisé pour estimer l'attente des clients.",
        defaultValue: "5",
    },
}

export const WithError: Story = {
    args: {
        label: "Temps de préparation",
        options: PREP_OPTIONS,
        error: "Ce champ est obligatoire.",
    },
}

export const Disabled: Story = {
    args: {
        label: "Temps de préparation",
        options: PREP_OPTIONS,
        defaultValue: "5",
        disabled: true,
    },
}
