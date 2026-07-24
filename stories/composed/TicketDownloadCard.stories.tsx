import type { Meta, StoryObj } from "@storybook/react"
import { TicketDownloadCard } from "@/components/composed/TicketDownloadCard"
import { buildRecoverUrl } from "@/lib/utils/ticket-download"

const meta = {
    title: "Composed/TicketDownloadCard",
    component: TicketDownloadCard,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
    args: {
        merchantName: "TESTA CROUSTY",
        merchantLogoUrl: null,
        merchantBrandColor: "#EA580C",
        customerName: "Alex",
        position: 3,
        arrivalTimeIso: new Date().toISOString(),
        recoveryCode: "4F2K",
        recoverUrl: buildRecoverUrl({
            baseUrl: "https://waitlight.app",
            slug: "testa-crousty",
            customerName: "Alex",
            code: "4F2K",
        }),
    },
} satisfies Meta<typeof TicketDownloadCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithLogo: Story = {
    args: {
        merchantLogoUrl: "https://picsum.photos/seed/waitlight/80/80",
    },
}

export const NoPosition: Story = {
    args: { position: null },
}

export const LongNames: Story = {
    args: {
        merchantName: "Boulangerie-Pâtisserie de la Grande Place du Village",
        customerName: "Anne-Charlotte",
    },
}
