import type { Meta, StoryObj } from "@storybook/react"
import { AddressAutocomplete } from "@/components/composed/AddressAutocomplete"

const meta = {
    title: "Composed/AddressAutocomplete",
    component: AddressAutocomplete,
    tags: ["autodocs"],
    parameters: {
        layout: "padded",
        docs: {
            description: {
                component:
                    "Address autocomplete backed by the free, keyless api-adresse.data.gouv.fr (French addresses only). Type at least 3 characters to search.",
            },
        },
    },
    args: {
        onSelect: () => {},
    },
} satisfies Meta<typeof AddressAutocomplete>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const PreFilled: Story = {
    args: {
        initialValue: "12 Rue de la Paix, 75002 Paris",
    },
}
