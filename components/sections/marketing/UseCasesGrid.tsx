"use client"

import Image from "next/image"
import { useState } from "react"
import { Utensils, Stethoscope, ShoppingBag, FerrisWheel } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils/cn"

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

type UseCase = {
    Icon: React.ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }>
    id: string
    sector: string
    title: string
    subtitle: string
    valueProp: string
    imageSrc: string
    bullets: string[]
    iconClass: string
    iconBgClass: string
    color: string
    colorLight: string
}

const USE_CASES: UseCase[] = [
    {
        Icon: Utensils,
        id: "restaurants",
        sector: "Restauration",
        title: "Food trucks, bistrots et restauration rapide",
        subtitle: "Fluidifier le rush du midi sans casser le rythme de service.",
        valueProp: "Vous réduisez l'encombrement du comptoir et gardez une file lisible même aux pics.",
        imageSrc: "/marketing/usecase-restaurant.jpg",
        bullets: [
            "Scan en 2 secondes après la commande",
            "Rappel discret quand le ticket arrive en tête",
            "Équipe concentrée sur la production, pas sur l'appel manuel",
        ],
        iconClass: "text-[#D97706]",
        iconBgClass: "bg-[#FFFBEB]",
        color: "#D97706",
        colorLight: "#FFFBEB",
    },
    {
        Icon: Stethoscope,
        id: "health",
        sector: "Santé",
        title: "Médecins, cliniques et centres de soins",
        subtitle: "Rendre l'attente plus sereine pour les patients et l'accueil.",
        valueProp: "Vous lissez les flux d'arrivée et réduisez la sensation d'attente subie.",
        imageSrc: "/marketing/usecase-health.jpg",
        bullets: [
            "Moins de densité dans les zones d'attente",
            "Information claire sur l'avancement de la file",
            "Expérience plus calme des heures de pointe",
        ],
        iconClass: "text-[#059669]",
        iconBgClass: "bg-[#ECFDF5]",
        color: "#059669",
        colorLight: "#ECFDF5",
    },
    {
        Icon: ShoppingBag,
        id: "retail-sav",
        sector: "Retail & Administrations",
        title: "SAV, boutiques et points de service",
        subtitle: "Éviter l'abandon de file et garder les clients actifs pendant l'attente.",
        valueProp: "Vous captez plus de passages finalisés et limitez la frustration en magasin.",
        imageSrc: "/marketing/usecase-retail.jpg",
        bullets: [
            "Retour en file au bon moment sans refaire la queue",
            "Visibilité des pics par tranche horaire",
            "Meilleur taux de prise en charge au comptoir SAV",
        ],
        iconClass: "text-[#4F46E5]",
        iconBgClass: "bg-[#EEF2FF]",
        color: "#4F46E5",
        colorLight: "#EEF2FF",
    },
    {
        Icon: FerrisWheel,
        id: "event",
        sector: "Événementiel & Loisirs",
        title: "Parcs d'attractions & festivals",
        subtitle: "Maintenir des flux fluides sur site même en forte affluence.",
        valueProp: "Vous augmentez le confort visiteur tout en préservant la circulation globale.",
        imageSrc: "/marketing/usecase-event.jpg",
        bullets: [
            "Files virtuelles sur plusieurs stands en parallèle",
            "Rappels envoyés au bon timing pour limiter les attroupements",
            "Attente perçue plus courte grâce à une meilleure information",
        ],
        iconClass: "text-[#DB2777]",
        iconBgClass: "bg-[#FDF2F8]",
        color: "#DB2777",
        colorLight: "#FDF2F8",
    },
]

export function UseCasesGrid({ id }: { id?: string }) {
    // null = all closed (default state)
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
    // mobile: tap to open/close
    const [mobileActiveIndex, setMobileActiveIndex] = useState<number | null>(null)

    return (
        <section
            id={id}
            className="py-24 md:py-32 bg-white"
            aria-labelledby="usecases-heading"
        >
            <div className="max-w-6xl mx-auto px-6">
                {/* Header */}
                <motion.div
                    className="text-center mb-12 md:mb-16"
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.65, ease: EASE }}
                >
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EEF2FF] text-[#4338CA] text-xs font-semibold tracking-wide uppercase mb-5">
                        Cas d&apos;usage
                    </span>
                    <h2
                        id="usecases-heading"
                        className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-[#111827] mt-1"
                    >
                        Fait pour votre secteur,
                        <br className="hidden sm:block" />
                        <span className="text-[#6366F1] sm:ml-2">adapté à vos clients.</span>
                    </h2>
                    <p className="mt-4 text-base md:text-lg text-[#4B5563] max-w-lg mx-auto">
                        WaitLight s&apos;adapte à chaque contexte où l&apos;attente freine l&apos;expérience client.
                    </p>
                </motion.div>

                {/* ── MOBILE: Vertical accordion ── */}
                <motion.div
                    className="md:hidden flex flex-col gap-3"
                    initial={{ opacity: 0, y: 32 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
                >
                    {USE_CASES.map((uc, i) => {
                        const isOpen = mobileActiveIndex === i
                        return (
                            <motion.article
                                key={uc.id}
                                id={uc.id}
                                layout
                                onClick={() => setMobileActiveIndex(isOpen ? null : i)}
                                className="relative rounded-2xl overflow-hidden cursor-pointer"
                                animate={{ height: isOpen ? 380 : 130 }}
                                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                                style={{ willChange: "height" }}
                            >
                                {/* Background image */}
                                <Image
                                    src={uc.imageSrc}
                                    alt={`Illustration ${uc.sector}`}
                                    fill
                                    className="object-cover"
                                    style={{ transform: isOpen ? "scale(1.04)" : "scale(1)", transition: "transform 0.7s ease" }}
                                />

                                {/* Deep gradient */}
                                <div
                                    className="absolute inset-0 transition-opacity duration-500"
                                    style={{
                                        background: isOpen
                                            ? "linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.75) 40%, rgba(0,0,0,0.35) 75%, rgba(0,0,0,0.15) 100%)"
                                            : "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.28) 100%)",
                                    }}
                                />

                                {/* Color tint when closed */}
                                <div
                                    className="absolute inset-0 transition-opacity duration-500"
                                    style={{ backgroundColor: uc.color, opacity: isOpen ? 0 : 0.15 }}
                                />

                                {/* Content */}
                                <div className="absolute inset-x-0 bottom-0 p-4">
                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0, transition: { duration: 0.28, delay: 0.2 } }}
                                                exit={{ opacity: 0, transition: { duration: 0.08 } }}
                                                className="mb-3"
                                            >
                                                <p className="text-white/90 text-sm leading-relaxed mb-3" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.8)" }}>
                                                    {uc.subtitle}
                                                </p>

                                                <ul className="space-y-1.5 mb-3">
                                                    {uc.bullets.map((bullet) => (
                                                        <li key={bullet} className="flex items-start gap-2 text-sm text-white/90" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.7)" }}>
                                                            <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center bg-white">
                                                                <svg className="w-2.5 h-2.5" style={{ color: uc.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            </span>
                                                            {bullet}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Sector row — always visible */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0", uc.iconBgClass)}>
                                                <uc.Icon size={14} className={uc.iconClass} aria-hidden={true} />
                                            </div>
                                            <div>
                                                <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest block" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}>
                                                    {uc.sector}
                                                </span>
                                                <span className="text-white text-sm font-black tracking-tight leading-tight block" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.9)" }}>
                                                    {uc.title}
                                                </span>
                                            </div>
                                        </div>
                                        <motion.div
                                            animate={{ rotate: isOpen ? 180 : 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="w-6 h-6 rounded-full bg-white/15 border border-white/25 flex items-center justify-center flex-shrink-0 self-center"
                                        >
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </motion.div>
                                    </div>
                                </div>
                            </motion.article>
                        )
                    })}
                </motion.div>

                {/* ── DESKTOP: 4 cards expand on hover — all closed by default ── */}
                <motion.div
                    className="hidden md:flex gap-3 h-[480px]"
                    onMouseLeave={() => setHoveredIndex(null)}
                    initial={{ opacity: 0, y: 32 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.65, delay: 0.1, ease: EASE }}
                >
                    {USE_CASES.map((uc, index) => {
                        const isExpanded = hoveredIndex === index

                        return (
                            <motion.article
                                key={uc.id}
                                id={uc.id}
                                onMouseEnter={() => setHoveredIndex(index)}
                                animate={{ flex: isExpanded ? 3 : 1 }}
                                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                                className="relative rounded-3xl overflow-hidden cursor-default"
                                style={{ minWidth: 0 }}
                            >
                                {/* Background image */}
                                <Image
                                    src={uc.imageSrc}
                                    alt={`Illustration pour ${uc.sector}`}
                                    fill
                                    className="object-cover transition-transform duration-700"
                                    style={{ transform: isExpanded ? "scale(1.05)" : "scale(1)" }}
                                    sizes="(max-width: 1023px) 90vw, 580px"
                                />

                                {/* Gradient overlay */}
                                <div
                                    className="absolute inset-0 transition-opacity duration-500"
                                    style={{
                                        background: isExpanded
                                            ? "linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.72) 42%, rgba(0,0,0,0.28) 75%, rgba(0,0,0,0.08) 100%)"
                                            : "linear-gradient(to top, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.25) 100%)",
                                    }}
                                />

                                {/* Color tint when collapsed */}
                                <div
                                    className="absolute inset-0 transition-opacity duration-500"
                                    style={{ backgroundColor: uc.color, opacity: isExpanded ? 0 : 0.15 }}
                                />

                                {/* Bottom content */}
                                <div className="absolute inset-x-0 bottom-0 p-6">
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 6 }}
                                                animate={{ opacity: 1, y: 0, transition: { duration: 0.3, delay: 0.22 } }}
                                                exit={{ opacity: 0, transition: { duration: 0.06 } }}
                                            >
                                                <p className="text-white text-sm leading-relaxed mb-4" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.9)" }}>
                                                    {uc.subtitle}
                                                </p>

                                                <ul className="space-y-2 mb-4">
                                                    {uc.bullets.map((bullet) => (
                                                        <li key={bullet} className="flex items-start gap-2.5 text-sm text-white" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>
                                                            <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center bg-white">
                                                                <svg className="w-2.5 h-2.5" style={{ color: uc.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            </span>
                                                            {bullet}
                                                        </li>
                                                    ))}
                                                </ul>

                                                <div
                                                    className="rounded-xl px-4 py-2.5 text-sm font-medium text-white/90 backdrop-blur-sm border mb-4"
                                                    style={{
                                                        backgroundColor: "rgba(0,0,0,0.35)",
                                                        borderColor: "rgba(255,255,255,0.15)",
                                                        textShadow: "0 1px 4px rgba(0,0,0,0.7)",
                                                    }}
                                                >
                                                    {uc.valueProp}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Sector + title */}
                                    <motion.div layout transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}>
                                        <div className="flex items-center gap-2.5 mb-2">
                                            <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg", uc.iconBgClass)}>
                                                <uc.Icon size={17} className={uc.iconClass} aria-hidden={true} />
                                            </div>
                                            <span
                                                className="text-white text-xs font-bold uppercase tracking-widest"
                                                style={{ textShadow: "0 1px 6px rgba(0,0,0,0.95)" }}
                                            >
                                                {uc.sector}
                                            </span>
                                        </div>
                                        <h3
                                            className="text-white text-[1.1rem] font-black tracking-tight leading-snug line-clamp-1"
                                            style={{ textShadow: "0 2px 10px rgba(0,0,0,0.95)" }}
                                        >
                                            {uc.title}
                                        </h3>
                                    </motion.div>
                                </div>
                            </motion.article>
                        )
                    })}
                </motion.div>
            </div>
        </section>
    )
}
