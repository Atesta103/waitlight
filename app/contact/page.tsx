import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Mail, Clock, MessageCircle } from "lucide-react"
import { ContactForm } from "@/components/sections/marketing/ContactForm"

export const metadata: Metadata = {
    title: "Contactez-nous — Wait-Light",
    description:
        "Une question, un problème technique, une suggestion ? Notre équipe vous répond rapidement.",
    alternates: {
        canonical: "/contact",
    },
}

const SUPPORT_INFOS = [
    {
        Icon: Clock,
        title: "Délai de réponse",
        description: "On fait de notre mieux pour répondre le plus vite possible.",
    },
    {
        Icon: Mail,
        title: "E-mail direct",
        description: "contact@waitlight.fr pour les demandes urgentes.",
    },
    {
        Icon: MessageCircle,
        title: "Support humain",
        description: "Pas de bot. Une vraie personne lit chaque message.",
    },
]

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-[#F8F9FA] text-[#111827]">
            {/* Back link */}
            <div className="max-w-6xl mx-auto px-6 pt-6">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm font-medium text-[#374151] hover:text-[#111827] transition-colors"
                >
                    <ArrowLeft size={15} aria-hidden="true" />
                    Retour
                </Link>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-6 md:py-10">
                {/* Page header — compact */}
                <div className="mb-8">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF2FF] text-[#4338CA] text-xs font-semibold tracking-wide uppercase mb-3">
                        Support
                    </span>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-[#111827] leading-tight">
                        On est là pour{" "}
                        <span className="text-[#6366F1]">vous aider.</span>
                    </h1>
                    <p className="mt-2 text-sm md:text-base text-[#374151]">
                        Remplissez le formulaire — notre équipe vous répond dès que possible.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 lg:gap-10 items-start">
                    {/* Form card */}
                    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 md:p-8 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
                        <ContactForm />
                    </div>

                    {/* Sidebar */}
                    <div className="flex flex-col gap-4">
                        {/* Support info cards */}
                        {SUPPORT_INFOS.map(({ Icon, title, description }) => (
                            <div
                                key={title}
                                className="flex items-start gap-3 bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-[0_1px_6px_rgba(0,0,0,0.03)]"
                            >
                                <div className="w-9 h-9 rounded-lg bg-[#EEF2FF] flex items-center justify-center flex-shrink-0">
                                    <Icon size={17} className="text-[#6366F1]" aria-hidden="true" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-[#111827]">{title}</p>
                                    <p className="mt-0.5 text-xs text-[#374151] leading-snug">{description}</p>
                                </div>
                            </div>
                        ))}

                        {/* Quick FAQ teaser */}
                        <div className="bg-[#EEF2FF] rounded-xl p-4">
                            <p className="text-sm font-bold text-[#4338CA] mb-1">Réponse rapide ?</p>
                            <p className="text-xs text-[#374151] mb-3 leading-snug">
                                Consultez notre FAQ — la plupart des questions courantes y sont déjà répondues.
                            </p>
                            <Link
                                href="/#faq"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4F46E5] hover:text-[#4338CA] transition-colors"
                            >
                                Voir la FAQ →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
