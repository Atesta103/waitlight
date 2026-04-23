import Link from "next/link"

const FEATURES = [
    "Files d'attente illimitées",
    "Tickets illimités",
    "QR Code personnalisé",
    "Marque blanche (logo + couleurs)",
    "Notifications en temps réel",
    "Mini-jeux intégrés pour les clients",
    "Analytics & statistiques en direct",
    "Algorithme de temps d'attente",
]

/**
 * PricingSection — single plan at 29€/month.
 * Pure Server Component.
 */
export function PricingSection({ id }: { id?: string }) {
    return (
        <section
            id={id}
            className="py-24 md:py-32 bg-[#F8F9FA]"
            aria-labelledby="pricing-heading"
        >
            <div className="max-w-6xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EEF2FF] text-[#4338CA] text-xs font-semibold tracking-wide uppercase mb-4">
                        Tarifs
                    </span>
                    <h2
                        id="pricing-heading"
                        className="text-4xl md:text-5xl font-black tracking-tighter text-[#111827]"
                    >
                        Un seul plan,
                        <span className="text-[#6366F1]"> tout inclus.</span>
                    </h2>
                    <p className="mt-4 text-lg text-[#374151] max-w-md mx-auto">
                        Pas de formules compliquées. Un tarif clair, toutes fonctionnalités incluses.
                    </p>
                </div>

                {/* Pricing card — centered, generous width */}
                <div className="max-w-2xl mx-auto">
                    <div className="relative rounded-3xl bg-[#6366F1] text-white p-10 shadow-[0_0_60px_rgba(99,102,241,0.35)]">
                        {/* Badge */}
                        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center px-4 py-1 rounded-full bg-white text-[#4F46E5] text-xs font-bold shadow-sm border border-[#C7D2FE]">
                            14 jours gratuits
                        </span>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            {/* Left — price & description */}
                            <div>
                                <div className="text-sm font-semibold uppercase tracking-wider text-white/80 mb-2">
                                    Plan unique
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-6xl font-black">29€</span>
                                    <span className="text-white/80 text-base">/ mois</span>
                                </div>
                                <p className="mt-3 text-white/80 text-sm leading-relaxed">
                                    Par établissement. Incluant toutes les fonctionnalités, sans limite de tickets ni de files.
                                </p>

                                <Link
                                    href="/login"
                                    id="pricing-cta"
                                    className="mt-8 w-full inline-flex items-center justify-center px-6 py-4 rounded-xl bg-white text-[#4F46E5] font-bold text-sm shadow-[0_0_12px_rgba(255,255,255,0.2)] hover:bg-white/90 transition-colors duration-150"
                                >
                                    Démarrer l&apos;essai gratuit →
                                </Link>
                            </div>

                            {/* Right — feature list */}
                            <ul className="space-y-2.5">
                                {FEATURES.map((feature) => (
                                    <li key={feature} className="flex items-center gap-2.5 text-sm">
                                        <svg
                                            className="w-4 h-4 flex-shrink-0 text-white"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                            aria-hidden="true"
                                        >
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-white/90">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Fine print */}
                    <p className="mt-5 text-center text-sm text-[#6B7280]">
                        Vous avez plusieurs établissements ?{" "}
                        <a href="mailto:contact@waitlight.fr" className="text-[#4F46E5] font-medium hover:underline">
                            Contactez-nous
                        </a>{" "}
                        pour un tarif adapté.
                    </p>
                </div>
            </div>
        </section>
    )
}
