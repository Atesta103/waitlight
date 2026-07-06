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
        <div className="flex flex-col items-center gap-6">
            <QRCodeDisplay key={mode} slug={slug} size={size} mode={mode} />

            <p className="max-w-xs text-center text-xs text-text-secondary print:hidden">
                {mode === "assisted"
                    ? "Ce QR code est à usage unique. Il se renouvelle automatiquement après chaque scan."
                    : "Le QR code se renouvelle automatiquement toutes les 15 secondes. Chaque code n'est valable qu'une seule fois."}
            </p>

            <QrModeToggle mode={mode} onModeChange={setMode} className="print:hidden" />
        </div>
    )
}

export { QrFullscreenDisplay, type QrFullscreenDisplayProps }
