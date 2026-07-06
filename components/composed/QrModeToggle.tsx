"use client"

import { useState, useTransition } from "react"
import { QrCode } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { updateQrModeAction } from "@/lib/actions/settings"

type QrModeToggleProps = {
    mode: "kiosk" | "assisted"
    onModeChange: (mode: "kiosk" | "assisted") => void
    className?: string
}

/**
 * Toggles the merchant's live QR display mode and persists it to
 * `settings.qr_mode`, so every screen (dashboard, fullscreen kiosk display)
 * reflects the same current mode instead of drifting from the saved default.
 */
function QrModeToggle({ mode, onModeChange, className }: QrModeToggleProps) {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    const handleToggle = () => {
        const next = mode === "kiosk" ? "assisted" : "kiosk"
        onModeChange(next)
        startTransition(async () => {
            const result = await updateQrModeAction(next)
            if ("error" in result) {
                setError(result.error)
                onModeChange(mode) // rollback
            } else {
                setError(null)
            }
        })
    }

    return (
        <div className={className}>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleToggle}
                isLoading={isPending}
            >
                <QrCode size={16} aria-hidden="true" />
                {mode === "kiosk" ? "Basculer en mode assisté" : "Basculer en mode kiosque"}
            </Button>
            {error ? (
                <p className="mt-1 text-xs text-feedback-error" role="alert">
                    {error}
                </p>
            ) : null}
        </div>
    )
}

export { QrModeToggle, type QrModeToggleProps }
