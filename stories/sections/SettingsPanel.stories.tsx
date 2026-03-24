import type { Meta, StoryObj } from "@storybook/react"
import { SettingsPanel } from "@/components/sections/SettingsPanel"

// SettingsPanel saves via server actions (updateMerchantIdentityAction etc.)
// These will silently fail in Storybook — the UI still renders correctly.
const meta = {
    title: "Sections/SettingsPanel",
    component: SettingsPanel,
    tags: ["autodocs"],
    parameters: {
        layout: "padded",
        docs: {
            description: {
                component:
                    "Full settings page. Server actions (save/delete logo) are no-ops in Storybook.",
            },
        },
    },
    args: {
        initialData: {
            merchantName: "Boulangerie Martin",
            slug: "boulangerie-martin",
            logoUrl: null,
            defaultPrepTimeMin: 5,
            maxCapacity: 20,
            welcomeMessage: "Bienvenue ! Prenez un numéro et profitez de votre temps libre.",
            notificationsEnabled: true,
            autoCloseEnabled: false,
            calculatedAvgPrepTime: 8,
            avgPrepComputedAt: "2026-03-24T10:00:00Z",
        },
    },
} satisfies Meta<typeof SettingsPanel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithLogo: Story = {
    args: {
        initialData: {
            merchantName: "Café de la Place",
            slug: "cafe-de-la-place",
            logoUrl: "https://api.dicebear.com/9.x/shapes/svg?seed=cafe",
            defaultPrepTimeMin: 3,
            maxCapacity: 15,
            welcomeMessage: "Bonjour !",
            notificationsEnabled: false,
            autoCloseEnabled: true,
            calculatedAvgPrepTime: null,
            avgPrepComputedAt: null,
        },
    },
}
