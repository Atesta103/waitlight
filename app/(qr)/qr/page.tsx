import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { QRCodeDisplay } from "@/components/composed/QRCodeDisplay"

export const metadata: Metadata = {
    title: "QR Code — Wait-Light",
}

type QrFullscreenPageProps = {
    searchParams: Promise<{ slug?: string }>
}

/**
 * Fullscreen QR page — opens in a new tab, no header or chrome.
 * Designed for kiosk display: merchants open this page on a screen facing customers.
 *
 * Usage: /qr?slug=<merchant-slug>
 *
 * Security: requires an authenticated session AND the slug must match the
 * authenticated merchant's own slug. Prevents any user from displaying the
 * live rotating QR code of a different business.
 */
export default async function QrFullscreenPage({
    searchParams,
}: QrFullscreenPageProps) {
    const { slug } = await searchParams

    // ── Auth guard ────────────────────────────────────────────────────────────
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    // ── Slug ownership check ──────────────────────────────────────────────────
    // Fetch the authenticated merchant's own slug from DB.
    const { data: merchant } = await supabase
        .from("merchants")
        .select("slug")
        .eq("id", user.id)
        .single()

    // If no merchant profile exists yet, redirect to onboarding.
    if (!merchant) {
        redirect("/onboarding")
    }

    // If no slug param was provided OR it doesn't match the authenticated merchant's slug,
    // show a clear error — do NOT render the QR display.
    if (!slug || slug !== merchant.slug) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-base px-4 text-center">
                <p className="text-lg font-semibold text-text-primary">
                    Accès non autorisé
                </p>
                <p className="max-w-sm text-sm text-text-secondary">
                    Cette page n&apos;est accessible que depuis votre tableau de bord,
                    avec votre propre QR code.
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
