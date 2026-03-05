import type { Metadata } from "next"
import { QRCodeDisplay } from "@/components/composed/QRCodeDisplay"

export const metadata: Metadata = {
    title: "QR Code — Wait-Light",
}

type QrFullscreenPageProps = {
    searchParams: Promise<{ slug?: string }>
}

/**
 * Fullscreen QR page — opens in a new tab, no header or chrome.
 * Designed for kiosk display: merchants open this on a screen facing customers.
 *
 * Usage: /qr?slug=<merchant-slug>
 * No auth required — the QR code only exposes the public join URL.
 */
export default async function QrFullscreenPage({
    searchParams,
}: QrFullscreenPageProps) {
    const { slug } = await searchParams

    if (!slug) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-surface-base">
                <p className="text-sm text-text-secondary">
                    Paramètre <code className="font-mono">slug</code> manquant.
                </p>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-surface-base px-4">
            <QRCodeDisplay slug={slug} size={300} />

            <p className="max-w-xs text-center text-xs text-text-secondary">
                Le QR code se renouvelle automatiquement toutes les
                15&nbsp;secondes. Chaque code n&apos;est valable qu&apos;une
                seule fois.
            </p>
        </div>
    )
}
