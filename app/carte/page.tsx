import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, MapPinned } from "lucide-react"
import { CarteClient } from "./CarteClient"

export const metadata: Metadata = {
    title: "Trouver un commerce près de moi — WaitLight",
    description:
        "Découvrez les commerces équipés de WaitLight autour de vous sur une carte interactive.",
    alternates: {
        canonical: "/carte",
    },
}

/**
 * Public discovery map: geolocates the visitor (with a manual-address
 * fallback) and shows nearby merchants who opted into the public directory
 * and added an address.
 */
export default function CartePage() {
    return (
        <main className="light min-h-screen bg-[#F8F9FA] text-[#111827]">
            <div className="max-w-4xl mx-auto px-6 pt-6">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm font-medium text-[#374151] hover:text-[#111827] transition-colors"
                >
                    <ArrowLeft size={15} aria-hidden="true" />
                    Retour
                </Link>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-6 md:py-10">
                <div className="mb-8">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF2FF] text-[#4338CA] text-xs font-semibold tracking-wide uppercase mb-3">
                        <MapPinned size={12} aria-hidden="true" />
                        Près de vous
                    </span>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-[#111827] leading-tight">
                        Trouvez un commerce près de chez vous
                    </h1>
                    <p className="mt-2 text-sm md:text-base text-[#374151]">
                        Découvrez les commerces équipés de WaitLight autour de vous et leur
                        statut en temps réel.
                    </p>
                </div>

                <CarteClient />
            </div>
        </main>
    )
}
