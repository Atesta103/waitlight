import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Search } from "lucide-react"
import { RetrouverClient } from "./RetrouverClient"

export const metadata: Metadata = {
    title: "Retrouver ma file d'attente — WaitLight",
    description:
        "Vous avez perdu le lien de votre file d'attente ? Retrouvez votre place avec le nom du commerce, votre prénom et votre code de suivi.",
    alternates: {
        canonical: "/retrouver",
    },
}

/**
 * Global recovery entry point on the marketing site: pick the merchant you
 * ordered from, then enter your first name + code on their recovery page.
 */
export default function RetrouverPage() {
    return (
        <main className="light min-h-screen bg-[#F8F9FA] text-[#111827]">
            <div className="max-w-2xl mx-auto px-6 pt-6">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm font-medium text-[#374151] hover:text-[#111827] transition-colors"
                >
                    <ArrowLeft size={15} aria-hidden="true" />
                    Retour
                </Link>
            </div>

            <div className="max-w-2xl mx-auto px-6 py-6 md:py-10">
                <div className="mb-8">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF2FF] text-[#4338CA] text-xs font-semibold tracking-wide uppercase mb-3">
                        <Search size={12} aria-hidden="true" />
                        Retrouver ma file
                    </span>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-[#111827] leading-tight">
                        Retrouvez votre place
                    </h1>
                    <p className="mt-2 text-sm md:text-base text-[#374151]">
                        Choisissez le commerce où vous avez commandé, puis entrez votre
                        prénom et le code de suivi qui vous a été affiché.
                    </p>
                </div>

                <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
                    <RetrouverClient />
                </div>
            </div>
        </main>
    )
}
