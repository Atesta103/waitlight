"use client"

import { useState } from "react"
import { QRCodeDisplay } from "@/components/composed/QRCodeDisplay"
import { QrModeToggle } from "@/components/composed/QrModeToggle"

type QrFullscreenDisplayProps = {
    slug: string
    size: number
    initialMode: "kiosk" | "assisted"
}

/**
 * Client wrapper for the fullscreen kiosk QR pages (`/qr`, `/dashboard/qr-display`).
 * Lets the merchant switch modes directly from the screen facing customers,
 * persisting the change so it's reflected everywhere else too.
 */
function QrFullscreenDisplay({ slug, size, initialMode }: QrFullscreenDisplayProps) {
    const [mode, setMode] = useState<"kiosk" | "assisted">(initialMode)

    return (
        <div className="flex flex-col items-center gap-3">
            {/* bare: no card chrome here — the QR code is the page itself on
                this fullscreen kiosk view, not a card sitting on it. Actions
                (regenerate + mode toggle) render side by side via footer,
                wrapping to their own line on narrow phones instead of
                overflowing (see QRCodeDisplay's actions row). */}
            <QRCodeDisplay
                key={mode}
                slug={slug}
                size={size}
                mode={mode}
                bare
                footer={<QrModeToggle mode={mode} onModeChange={setMode} className="print:hidden" />}
            />

            {/* Rotation explainer — kiosk mode only. Assisted mode has no
                equivalent copy here (see the same removal in QRCodeDisplay's
                own "QR à usage unique" label above the QR). */}
            {mode === "kiosk" && (
                <p className="max-w-xs text-center text-xs text-text-secondary print:hidden">
                    Le QR code se renouvelle automatiquement toutes les 15
                    secondes. Chaque code n&apos;est valable qu&apos;une
                    seule fois.
                </p>
            )}
        </div>
    )
}

export { QrFullscreenDisplay, type QrFullscreenDisplayProps }
