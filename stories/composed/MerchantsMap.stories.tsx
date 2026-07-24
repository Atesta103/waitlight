import type { Meta, StoryObj } from "@storybook/react"
import { MerchantsMap } from "@/components/composed/MerchantsMap"

const meta = {
    title: "Composed/MerchantsMap",
    component: MerchantsMap,
    tags: ["autodocs"],
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component:
                    "MapLibre GL + OpenFreeMap vector discovery map, one marker per nearby merchant. Open shops carry a live halo, closed ones are desaturated and hide the queue action. Renders client-side only (MapLibre touches `window`); use next/dynamic with ssr:false in app code.",
            },
        },
    },
    args: {
        center: { lat: 48.8566, lng: 2.3522 },
        userPosition: { lat: 48.8566, lng: 2.3522 },
        merchants: [
            {
                slug: "boulangerie-martin",
                name: "Boulangerie Martin",
                business_type: "food",
                logo_url: null,
                is_open: true,
                address: "12 Rue de la Paix, 75002 Paris",
                latitude: 48.857,
                longitude: 2.353,
                distance_km: 0.4,
            },
            {
                slug: "cabinet-dentaire-lumiere",
                name: "Cabinet Dentaire Lumière",
                business_type: "healthcare",
                logo_url: null,
                is_open: false,
                address: "5 Avenue de l'Opéra, 75001 Paris",
                latitude: 48.863,
                longitude: 2.335,
                distance_km: 1.8,
            },
        ],
    },
} satisfies Meta<typeof MerchantsMap>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    render: (args) => (
        <div style={{ height: "500px", width: "100%" }}>
            <MerchantsMap {...args} />
        </div>
    ),
}

export const Empty: Story = {
    args: { merchants: [] },
    render: (args) => (
        <div style={{ height: "500px", width: "100%" }}>
            <MerchantsMap {...args} />
        </div>
    ),
}
