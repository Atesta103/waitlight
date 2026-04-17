"use client"

import { useState } from "react"
import { cn } from "@/lib/utils/cn"

type FaqItem = {
    question: string
    answer: string
}

const FAQ_ITEMS: FaqItem[] = [
    {
        question: "Mes clients doivent-ils télécharger une application ?",
        answer: "Non. Wait-Light fonctionne entièrement dans le navigateur web. Vos clients scannent le QR Code avec leur appareil photo et accèdent immédiatement à leur file d'attente — aucune installation, aucun compte requis.",
    },
    {
        question: "Comment fonctionne l'essai gratuit ?",
        answer: "L'essai dure 14 jours et vous accédez à toutes les fonctionnalités de Waitlight. À l'issue des 14 jours, votre abonnement commence automatiquement.",
    },
    {
        question: "Y a-t-il un plan gratuit permanent ?",
        answer: "Non. Wait-Light propose un seul plan à 29 €/mois par établissement, précédé d'un essai gratuit de 14 jours. Ce modèle nous permet de vous offrir un support prioritaire et toutes les fonctionnalités sans restriction.",
    },
    {
        question: "Comment mes clients sont-ils notifiés quand c'est leur tour ?",
        answer: "Dès que c'est leur tour, leur navigateur envoie une notification et le téléphone vibre. Ils peuvent donc s'éloigner du comptoir, faire autre chose, et revenir juste à temps.",
    },
    {
        question: "Puis-je personnaliser l'interface avec mon logo et mes couleurs ?",
        answer: "Oui, c'est inclus dans le plan. Vous pouvez uploader votre logo, choisir votre couleur principale et votre police. Vos clients voient uniquement votre marque — Wait-Light reste invisible.",
    },
    {
        question: "Comment est calculé le temps d'attente estimé ?",
        answer: "Notre algorithme analyse la cadence de service en temps réel : durée moyenne des derniers passages, nombre de clients en attente, et variations selon les heures de pointe. L'estimation s'affine continuellement tout au long de la journée.",
    },
    {
        question: "Puis-je gérer plusieurs établissements ?",
        answer: "Le plan couvre un établissement. Si vous gérez plusieurs points de vente, contactez-nous à contact@waitlight.fr pour un tarif multi-établissements adapté à votre structure.",
    },
    {
        question: "Mes données et celles de mes clients sont-elles sécurisées ?",
        answer: "Oui. Wait-Light est hébergé sur Supabase, avec chiffrement en transit, des politiques de sécurité au niveau des lignes et une architecture où les clients ne collectent aucun compte. Nous respectons le RGPD et ne collectons que le strict minimum (prénom pour la file d'attente).",
    },
]

/**
 * FaqSection — accordion-style FAQ with native details/summary.
 * Client Component for open/close state.
 */
export function FaqSection({ id }: { id?: string }) {
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    const toggle = (idx: number) => setOpenIndex(openIndex === idx ? null : idx)

    return (
        <section
            id={id}
            className="py-24 md:py-32 bg-white"
            aria-labelledby="faq-heading"
        >
            <div className="max-w-3xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EEF2FF] text-[#4338CA] text-xs font-semibold tracking-wide uppercase mb-4">
                        FAQ
                    </span>
                    <h2
                        id="faq-heading"
                        className="text-4xl md:text-5xl font-black tracking-tighter text-[#111827]"
                    >
                        Questions fréquentes
                    </h2>
                </div>

                {/* Accordion */}
                <div className="divide-y divide-border-default border border-border-default rounded-2xl overflow-hidden">
                    {FAQ_ITEMS.map((item, idx) => (
                        <div key={idx}>
                            <button
                                id={`faq-btn-${idx}`}
                                aria-expanded={openIndex === idx}
                                aria-controls={`faq-panel-${idx}`}
                                onClick={() => toggle(idx)}
                                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left bg-white hover:bg-[#F8F9FA] transition-colors duration-150"
                            >
                                <span className="font-semibold text-[#111827] text-sm md:text-base leading-snug">
                                    {item.question}
                                </span>
                                <span
                                    className={cn(
                                        "flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-[#4F46E5] border border-[#C7D2FE] bg-[#EEF2FF] transition-transform duration-200",
                                        openIndex === idx && "rotate-45"
                                    )}
                                    aria-hidden="true"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                    </svg>
                                </span>
                            </button>

                            <div
                                id={`faq-panel-${idx}`}
                                role="region"
                                aria-labelledby={`faq-btn-${idx}`}
                                hidden={openIndex !== idx}
                                className="px-6 pb-5 text-sm text-[#374151] leading-relaxed bg-white"
                            >
                                <p>{item.answer}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contact nudge */}
                <p className="mt-8 text-center text-sm text-[#374151]">
                    Une autre question ?{" "}
                    <a href="mailto:contact@waitlight.fr" className="text-[#4F46E5] font-medium hover:underline">
                        Écrivez-nous
                    </a>
                </p>
            </div>
        </section>
    )
}
