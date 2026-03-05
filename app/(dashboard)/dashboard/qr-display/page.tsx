import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { QRCodeDisplay } from "@/components/composed/QRCodeDisplay"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

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
            {/* Back link — hidden in kiosk/fullscreen via CSS */}
            <div className="w-full max-w-sm print:hidden">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus rounded"
                >
                    <ArrowLeft size={14} aria-hidden="true" />
                    Retour au tableau de bord
                </Link>
            </div>

            <QRCodeDisplay
                slug={merchant.slug}
                merchantName={merchant.name}
                size={280}
                showFullscreenButton
            />

            <p className="max-w-xs text-center text-xs text-text-secondary print:hidden">
                Le QR code se renouvelle automatiquement toutes les 15 secondes.
                Chaque code n'est valable qu'une seule fois.
            </p>
        </div>
    )
}
