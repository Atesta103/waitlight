import type { Meta } from "@storybook/react"
import { QRCodeDisplay } from "@/components/composed/QRCodeDisplay"

const meta = {
    title: "Composed/QRCodeDisplay",
    component: QRCodeDisplay,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
} satisfies Meta<typeof QRCodeDisplay>

export default meta

// QRCodeDisplay fetches a rotating HMAC token from the server.
// In Storybook it falls back gracefully to the plain join URL when
// the server action is unavailable — no mock needed.
export const Default = {
    args: { slug: "boulangerie-martin", size: 220 },
    render: () => (
        <QRCodeDisplay slug="boulangerie-martin" size={220} />
    ),
}

export const Large = {
    args: { slug: "boulangerie-martin", size: 280 },
    render: () => (
        <QRCodeDisplay slug="boulangerie-martin" size={280} />
    ),
}

export const Small = {
    args: { slug: "boulangerie-martin", size: 160 },
    render: () => (
        <QRCodeDisplay slug="boulangerie-martin" size={160} />
    ),
}
