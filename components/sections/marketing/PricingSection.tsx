"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { CheckCircle } from "lucide-react"

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

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

export function PricingSection({ id }: { id?: string }) {
    return (
        <section
            id={id}
            className="py-24 md:py-32 bg-[#F8F9FA]"
            aria-labelledby="pricing-heading"
        >
            <div className="max-w-6xl mx-auto px-6">
                {/* Header */}
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.65, ease: EASE }}
                >
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EEF2FF] text-[#4338CA] text-xs font-semibold tracking-wide uppercase mb-5">
                        Tarifs
                    </span>
                    <h2
                        id="pricing-heading"
                        className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-[#111827] mt-1"
                    >
                        Un seul plan,
                        <span className="text-[#6366F1]"> tout inclus.</span>
                    </h2>
                    <p className="mt-4 text-base md:text-lg text-[#4B5563] max-w-md mx-auto">
                        Pas de formules compliquées. Un tarif clair, toutes fonctionnalités incluses.
                    </p>
                </motion.div>

                {/* Pricing card */}
                <motion.div
                    className="max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
                >
                    <div className="relative rounded-3xl bg-[#111827] text-white p-10 shadow-[0_24px_64px_-16px_rgba(17,24,39,0.5)]">
                        {/* Badge */}
                        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center px-4 py-1 rounded-full bg-[#6366F1] text-white text-xs font-bold shadow-[0_4px_14px_rgba(99,102,241,0.4)]">
                            14 jours gratuits
                        </span>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            {/* Left */}
                            <div>
                                <div className="text-sm font-semibold uppercase tracking-wider text-white/50 mb-2">
                                    Plan unique
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-6xl font-black">29€</span>
                                    <span className="text-white/50 text-base">/ mois</span>
                                </div>
                                <p className="mt-3 text-white/60 text-sm leading-relaxed">
                                    Par établissement. Toutes les fonctionnalités, sans limite de tickets ni de files.
                                </p>

                                <motion.div className="mt-8" whileTap={{ scale: 0.97 }}>
                                    <Link
                                        href="/login"
                                        id="pricing-cta"
                                        className="w-full inline-flex items-center justify-center px-6 py-4 rounded-xl bg-[#6366F1] text-white font-bold text-sm hover:bg-[#4F46E5] hover:shadow-[0_0_28px_rgba(99,102,241,0.45)] transition-all duration-200"
                                    >
                                        Démarrer l&apos;essai gratuit →
                                    </Link>
                                </motion.div>

                                <div className="mt-4 flex items-center gap-2">
                                    <CheckCircle size={13} className="text-[#10B981]" />
                                    <span className="text-xs text-white/50">Sans engagement · Résiliation à tout moment</span>
                                </div>
                            </div>

                            {/* Right — feature list with stagger */}
                            <ul className="space-y-2.5">
                                {FEATURES.map((feature, i) => (
                                    <motion.li
                                        key={feature}
                                        initial={{ opacity: 0, x: 12 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true, margin: "-40px" }}
                                        transition={{ duration: 0.4, delay: 0.2 + i * 0.05, ease: EASE }}
                                        className="flex items-center gap-2.5 text-sm"
                                    >
                                        <CheckCircle size={15} className="flex-shrink-0 text-[#10B981]" aria-hidden="true" />
                                        <span className="text-white/80">{feature}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <p className="mt-5 text-center text-sm text-[#6B7280]">
                        Vous avez plusieurs établissements ?{" "}
                        <Link href="/contact" className="text-[#4F46E5] font-medium hover:underline">
                            Contactez-nous
                        </Link>{" "}
                        pour un tarif adapté.
                    </p>
                </motion.div>
            </div>
        </section>
    )
}
