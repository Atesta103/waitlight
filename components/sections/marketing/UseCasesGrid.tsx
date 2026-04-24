"use client"

import Image from "next/image"
import { useState, useRef } from "react"
import { ChevronRight, Utensils, Stethoscope, ShoppingBag, FerrisWheel } from "lucide-react"
import { cn } from "@/lib/utils/cn"

type UseCase = {
    Icon: React.ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }>
    id: string
    sector: string
    title: string
    subtitle: string
    problem: string
    solution: string
    valueProp: string
    imageSrc: string
    bullets: string[]
    iconClass: string
    iconBgClass: string
    badgeClass: string
}

const USE_CASES: UseCase[] = [
    {
        Icon: Utensils,
        id: "restaurants",
        sector: "Restauration",
        title: "Food trucks, bistrots et restauration rapide",
        subtitle: "Fluidifier le rush du midi sans casser le rythme de service.",
        problem: "Des clients amassés devant le comptoir, des bipeurs coûteux qui se perdent.",
        solution: "Le client passe commande, scanne, puis reçoit un rappel navigateur quand son plat est prêt.",
        valueProp: "Vous réduisez l'encombrement du comptoir et gardez une file lisible même aux pics.",
        imageSrc: "/marketing/usecase-restaurant-ai.png",
        bullets: [
            "Scan en 2 secondes après la commande",
            "Rappel discret quand le ticket arrive en tête",
            "Équipe concentrée sur la production, pas sur l'appel manuel",
        ],
        iconClass: "text-[#D97706]",
        iconBgClass: "bg-[#FFFBEB]",
        badgeClass: "text-[#D97706]",
    },
    {
        Icon: Stethoscope,
        id: "health",
        sector: "Santé",
        title: "Médecins, cliniques et centres de soins",
        subtitle: "Rendre l'attente plus sereine pour les patients et l'accueil.",
        problem: "Salles d'attente bondées, anxiogènes et propices à la propagation de virus.",
        solution: "Le patient s'enregistre, suit sa position et reçoit un rappel quand le praticien est prêt.",
        valueProp: "Vous lissez les flux d'arrivée et réduisez la sensation d'attente subie.",
        imageSrc: "/marketing/usecase-health-ai.png",
        bullets: [
            "Moins de densité dans les zones d'attente",
            "Information claire sur l'avancement de la file",
            "Expérience plus calme des heures de pointe",
        ],
        iconClass: "text-[#059669]",
        iconBgClass: "bg-[#ECFDF5]",
        badgeClass: "text-[#059669]",
    },
    {
        Icon: ShoppingBag,
        id: "retail-sav",
        sector: "Retail & Administrations",
        title: "SAV, boutiques et points de service",
        subtitle: "Éviter l'abandon de file et garder les clients actifs pendant l'attente.",
        problem: "Plus de 45 minutes d'attente debout. Perte d'opportunités d'achat.",
        solution: "Ticket digital → shopping libre → notification dès qu'un conseiller est disponible.",
        valueProp: "Vous captez plus de passages finalisés et limitez la frustration en magasin.",
        imageSrc: "/marketing/usecase-retail-ai.png",
        bullets: [
            "Retour en file au bon moment sans refaire la queue",
            "Visibilité des pics par tranche horaire",
            "Meilleur taux de prise en charge au comptoir SAV",
        ],
        iconClass: "text-[#4F46E5]",
        iconBgClass: "bg-[#EEF2FF]",
        badgeClass: "text-[#4F46E5]",
    },
    {
        Icon: FerrisWheel,
        id: "event",
        sector: "Événementiel & Loisirs",
        title: "Parcs d'attractions & festivals",
        subtitle: "Maintenir des flux fluides sur site même en forte affluence.",
        problem: "Files interminables pour les attractions phares ou les food-trucks du festival.",
        solution: "File virtuelle + mini-jeux intégrés pour transformer l'attente en moment ludique.",
        valueProp: "Vous augmentez le confort visiteur tout en préservant la circulation globale.",
        imageSrc: "/marketing/usecase-event-ai.png",
        bullets: [
            "Files virtuelles sur plusieurs stands en parallèle",
            "Rappels envoyés au bon timing pour limiter les attroupements",
            "Attente perçue plus courte grâce à une meilleure information",
        ],
        iconClass: "text-[#DB2777]",
        iconBgClass: "bg-[#FDF2F8]",
        badgeClass: "text-[#DB2777]",
    },
]

/**
 * UseCasesGrid — 4 use case cards by sector.
 * Mobile: horizontal snap carousel with dot indicators.
 * Desktop: vertical stacked list with alternating image layout.
 */
export function UseCasesGrid({ id }: { id?: string }) {
    const [activeIndex, setActiveIndex] = useState(0)
    const scrollRef = useRef<HTMLDivElement>(null)

    const scrollTo = (index: number) => {
        if (!scrollRef.current) return
        const card = scrollRef.current.children[index] as HTMLElement
        card?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })
        setActiveIndex(index)
    }

    const handleScroll = () => {
        if (!scrollRef.current) return
        const container = scrollRef.current
        const cardWidth = (container.children[0] as HTMLElement)?.offsetWidth ?? 0
        const scrollLeft = container.scrollLeft
        const index = Math.round(scrollLeft / (cardWidth + 20)) // 20 = gap
        setActiveIndex(Math.min(index, USE_CASES.length - 1))
    }

    return (
        <section
            id={id}
            className="py-24 md:py-32 bg-white"
            aria-labelledby="usecases-heading"
        >
            <div className="max-w-6xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-12 md:mb-16">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EEF2FF] text-[#4338CA] text-xs font-semibold tracking-wide uppercase mb-4">
                        Cas d&apos;usage
                    </span>
                    <h2
                        id="usecases-heading"
                        className="text-4xl md:text-5xl font-black tracking-tighter text-[#111827]"
                    >
                        Fait pour votre secteur,
                        <br className="hidden sm:block" />
                        <span className="text-[#6366F1] sm:ml-2">adapté à vos clients.</span>
                    </h2>
                    <p className="mt-4 text-base md:text-lg text-[#374151] max-w-lg mx-auto">
                        Wait-Light s&apos;adapte à chaque contexte où l&apos;attente freine l&apos;expérience client.
                    </p>
                </div>

                {/* ── MOBILE: Snap carousel ── */}
                <div className="md:hidden">
                    {/* Scroll hint label */}
                    <div className="flex items-center justify-center gap-1.5 mb-4 text-[#6B7280]">
                        <span className="text-xs font-medium">Faire défiler</span>
                        <ChevronRight size={14} aria-hidden="true" />
                    </div>

                    {/* Cards track */}
                    <div
                        ref={scrollRef}
                        onScroll={handleScroll}
                        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6 scroll-smooth"
                        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                        aria-label="Carrousel des cas d'usage"
                    >
                        {USE_CASES.map((uc, i) => (
                            <article
                                key={uc.id}
                                id={uc.id}
                                className={cn(
                                    "w-[82vw] max-w-[340px] flex-shrink-0 snap-center rounded-3xl border bg-white p-5 flex flex-col transition-all duration-300",
                                    i === activeIndex
                                        ? "border-[#6366F1] shadow-[0_4px_24px_rgba(99,102,241,0.12)]"
                                        : "border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] opacity-75 scale-[0.97]"
                                )}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0", uc.iconBgClass)}>
                                        <uc.Icon size={22} className={uc.iconClass} aria-hidden={true} />
                                    </div>
                                    <span className={cn("text-xs font-bold uppercase tracking-wider", uc.badgeClass)}>
                                        {uc.sector}
                                    </span>
                                </div>

                                <h3 className="text-lg font-black text-[#111827] tracking-tight leading-snug">
                                    {uc.title}
                                </h3>
                                <p className="mt-1.5 text-sm text-[#374151] leading-relaxed">{uc.subtitle}</p>

                                <div className="mt-4 rounded-2xl bg-[#F8F9FA] p-3.5 flex-1">
                                    <p className="text-sm text-[#374151] leading-relaxed">
                                        <span className="font-semibold text-[#111827] block mb-0.5">Problème :</span>
                                        {uc.problem}
                                    </p>
                                    <div className="h-px w-full bg-[#E5E7EB] my-3" />
                                    <p className="text-sm text-[#374151] leading-relaxed">
                                        <span className="font-semibold text-[#111827] block mb-0.5">Solution :</span>
                                        {uc.solution}
                                    </p>
                                </div>

                                <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
                                    <p className="text-sm font-bold text-[#4338CA] leading-snug">
                                        {uc.valueProp}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>

                    {/* Dot indicators */}
                    <div className="flex justify-center items-center gap-2 mt-4" role="tablist" aria-label="Navigation du carrousel">
                        {USE_CASES.map((uc, i) => (
                            <button
                                key={uc.id}
                                role="tab"
                                aria-selected={i === activeIndex}
                                aria-label={`Aller à ${uc.sector}`}
                                onClick={() => scrollTo(i)}
                                className={cn(
                                    "rounded-full transition-all duration-300",
                                    i === activeIndex
                                        ? "w-6 h-2.5 bg-[#6366F1]"
                                        : "w-2.5 h-2.5 bg-[#D1D5DB] hover:bg-[#A5B4FC]"
                                )}
                            />
                        ))}
                    </div>
                    {/* Card counter */}
                    <p className="text-center text-xs text-[#9CA3AF] mt-2">
                        {activeIndex + 1} / {USE_CASES.length}
                    </p>
                </div>

                {/* ── DESKTOP: Stacked list with images ── */}
                <div className="hidden md:block space-y-8">
                    {USE_CASES.map((uc, index) => (
                        <article
                            key={uc.id}
                            id={uc.id}
                            className="rounded-3xl border border-[#E5E7EB] bg-white p-8"
                        >
                            <div
                                className={cn(
                                    "grid gap-8 lg:gap-10",
                                    index % 2 === 0 ? "lg:grid-cols-[1fr_1.05fr]" : "lg:grid-cols-[1.05fr_1fr]",
                                )}
                            >
                                {/* Image — desktop only */}
                                <div className={cn(index % 2 !== 0 && "lg:order-2")}>
                                    <div className="overflow-hidden rounded-2xl border border-[#E5E7EB]">
                                        <Image
                                            src={uc.imageSrc}
                                            alt={`Illustration pour ${uc.sector}`}
                                            width={600}
                                            height={360}
                                            className="h-auto w-full object-cover"
                                        />
                                    </div>
                                </div>

                                {/* Text */}
                                <div className={cn("flex flex-col", index % 2 !== 0 && "lg:order-1")}>
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0", uc.iconBgClass)}>
                                            <uc.Icon size={22} className={uc.iconClass} aria-hidden={true} />
                                        </div>
                                        <span className={cn("text-xs font-bold uppercase tracking-wider", uc.badgeClass)}>
                                            {uc.sector}
                                        </span>
                                    </div>

                                    <h3 className="mt-4 text-2xl font-black text-[#111827] tracking-tight leading-snug">
                                        {uc.title}
                                    </h3>
                                    <p className="mt-2 text-sm text-[#374151] leading-relaxed">{uc.subtitle}</p>

                                    <div className="mt-5 rounded-xl bg-[#F8F9FA] p-4">
                                        <p className="text-sm text-[#374151] leading-relaxed">
                                            <span className="font-semibold text-[#111827]">Problème : </span>
                                            {uc.problem}
                                        </p>
                                        <p className="mt-2 text-sm text-[#374151] leading-relaxed">
                                            <span className="font-semibold text-[#111827]">Solution Wait-Light : </span>
                                            {uc.solution}
                                        </p>
                                    </div>

                                    <ul className="mt-4 space-y-2">
                                        {uc.bullets.map((bullet) => (
                                            <li key={bullet} className="flex items-start gap-2.5 text-sm text-[#374151]">
                                                <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-[#EEF2FF] flex items-center justify-center">
                                                    <svg className="w-3 h-3 text-[#4F46E5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </span>
                                                {bullet}
                                            </li>
                                        ))}
                                    </ul>

                                    <p className="mt-4 rounded-xl bg-[#EEF2FF] px-4 py-3 text-sm font-medium text-[#4338CA]">
                                        {uc.valueProp}
                                    </p>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    )
}
