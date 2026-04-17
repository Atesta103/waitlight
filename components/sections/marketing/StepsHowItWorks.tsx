import { cn } from "@/lib/utils/cn"
import { QrCode, Timer, Bell, ArrowRight } from "lucide-react"

type Step = {
    number: string
    Icon: React.ComponentType<{ size?: number; className?: string; "aria-hidden"?: string }>
    title: string
    description: string
}

const STEPS: Step[] = [
    {
        number: "01",
        Icon: QrCode,
        title: "Scan",
        description: "Le client scanne le QR Code affiché à l'accueil avec son téléphone. Aucune application à installer.",
    },
    {
        number: "02",
        Icon: Timer,
        title: "Attente libre",
        description: "Il suit sa position en temps réel et patiente où il le souhaite : en terrasse, au magasin, dans sa voiture.",
    },
    {
        number: "03",
        Icon: Bell,
        title: "Récupération",
        description: "Son téléphone vibre dès que c'est son tour. Il revient récupérer commande ou passer à son rendez-vous.",
    },
]

/**
 * StepsHowItWorks — 3-step linear section.
 * Pure Server Component, no animations.
 */
export function StepsHowItWorks({ id }: { id?: string }) {
    return (
        <section
            id={id}
            className="py-24 md:py-32 bg-white"
            aria-labelledby="steps-heading"
        >
            <div className="max-w-6xl mx-auto px-6">
                {/* Section header */}
                <div className="text-center mb-16">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EEF2FF] text-[#4338CA] text-xs font-semibold tracking-wide uppercase mb-4">
                        Comment ça marche
                    </span>
                    <h2
                        id="steps-heading"
                        className="text-4xl md:text-5xl font-black tracking-tighter text-[#111827]"
                    >
                        Opérationnel en
                        <span className="text-[#6366F1]"> 3 étapes.</span>
                    </h2>
                    <p className="mt-4 text-lg text-[#374151] max-w-md mx-auto">
                        Simple pour vous, invisible pour vos clients.
                    </p>
                </div>

                {/* Steps */}
                <div className="relative">
                    {/* Connector line (desktop) */}
                    <div
                        className="hidden md:block absolute top-12 left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] h-px bg-gradient-to-r from-brand-primary/30 via-brand-primary to-brand-primary/30"
                        aria-hidden="true"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
                        {STEPS.map((step, idx) => (
                            <div
                                key={step.title}
                                className={cn(
                                    "relative flex flex-col items-center text-center",
                                    "md:items-center"
                                )}
                            >
                                {/* Mobile: vertical line */}
                                {idx < STEPS.length - 1 && (
                                    <div
                                        className="md:hidden absolute left-1/2 -translate-x-1/2 top-24 bottom-0 w-px bg-gradient-to-b from-[#6366F1]/40 to-transparent"
                                        aria-hidden="true"
                                    />
                                )}

                                {/* Icon circle */}
                                <div className="relative z-10 flex-shrink-0 w-24 h-24 rounded-full bg-[#EEF2FF] border-2 border-[#C7D2FE] flex items-center justify-center mb-6">
                                    <step.Icon size={32} className="text-[#4F46E5]" aria-hidden="true" />
                                    {/* Step number badge */}
                                    <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-[#6366F1] text-white text-xs font-black flex items-center justify-center">
                                        {idx + 1}
                                    </span>
                                </div>

                                <h3 className="text-2xl font-black text-[#111827] tracking-tight mb-3">
                                    {step.title}
                                </h3>
                                <p className="text-[#374151] leading-relaxed text-sm max-w-xs">
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA below steps */}
                <div className="mt-16 text-center">
                    <a
                        href="/login"
                        className="
                            inline-flex items-center justify-center gap-2
                            px-8 py-4 rounded-xl
                            bg-[#6366F1] text-white font-semibold text-base
                            shadow-[0_0_32px_rgba(99,102,241,0.35)]
                            hover:shadow-[0_0_48px_rgba(99,102,241,0.55)]
                            hover:bg-[#4F46E5]
                            transition-all duration-200
                        "
                    >
                        Commencer maintenant — c&apos;est gratuit
                        <ArrowRight size={16} aria-hidden="true" />
                    </a>
                </div>
            </div>
        </section>
    )
}
