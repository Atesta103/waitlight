import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { QRCodeDisplay } from "@/components/composed/QRCodeDisplay"

export const metadata: Metadata = {
    title: "Affichage QR — Wait-Light",
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
        .select("name, slug")
        .eq("id", user!.id)
        .single()

    if (!merchant) return null

    return (
        <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center gap-8">
            <QRCodeDisplay slug={merchant.slug} size={280} />

            <p className="max-w-xs text-center text-xs text-text-secondary print:hidden">
                Le QR code se renouvelle automatiquement toutes les 10 secondes.
                Chaque code n'est valable qu'une seule fois.
            </p>
        </div>
    )
}
