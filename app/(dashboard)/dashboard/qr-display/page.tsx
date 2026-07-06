import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { QrFullscreenDisplay } from "@/components/composed/QrFullscreenDisplay"

export const metadata: Metadata = {
    title: "Affichage QR — WaitLight",
}

/**
 * QR Display page — fullscreen kiosk view.
 *
 * Place a tablet/phone facing the customer line and open this page.
 * The rotating QR code changes every 15 seconds with a one-time token,
 * ensuring only physically present customers can join the queue.
 */
export default async function QrDisplayPage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const { data: merchant } = await supabase
        .from("merchants")
        .select("name, slug, is_open")
        .eq("id", user!.id)
        .single()

    if (!merchant) return null

    const { data: settingsRow } = await supabase
        .from("settings")
        .select("qr_mode")
        .eq("merchant_id", user!.id)
        .single()
    const qrMode = settingsRow?.qr_mode === "assisted" ? "assisted" : "kiosk"

    if (!merchant.is_open) {
        return (
            <div className="fixed inset-0 z-50 flex min-h-dvh flex-col items-center justify-center gap-4 bg-surface-base px-4 text-center">
                <p className="text-lg font-semibold text-text-primary">
                    File d&apos;attente fermée
                </p>
                <p className="max-w-sm text-sm text-text-secondary">
                    Ouvrez votre file d&apos;attente depuis le tableau de bord pour afficher le QR code.
                </p>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex min-h-dvh flex-col items-center justify-center gap-8 bg-surface-base px-4 py-8">
            <QrFullscreenDisplay slug={merchant.slug} size={280} initialMode={qrMode} />
        </div>
    )
}
