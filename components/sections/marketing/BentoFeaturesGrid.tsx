"use client"

import Image from "next/image"
import { useReducedMotion, motion } from "framer-motion"
import { Smartphone, BellRing, TrendingUp, Users, Clock } from "lucide-react"
import { cn } from "@/lib/utils/cn"

type BentoCardProps = {
    className?: string
    children: React.ReactNode
}

/**
 * Reusable Bento Grid card with glassmorphism styling.
 * Static — no hover animation (cards are not clickable).
 */
export function BentoCard({ className, children }: BentoCardProps) {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-3xl",
                "bg-white/80 backdrop-blur-xl",
                "border border-[#E5E7EB]",
                "shadow-[0_2px_16px_rgba(0,0,0,0.05)]",
                "p-6",
                className
            )}
        >
            {children}
        </div>
    )
}

/** QR Code SVG illustration — larger, centered */
function QrIllustration() {
    return (
        <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden="true">
            <rect width="100" height="100" rx="14" fill="#6366f1" fillOpacity="0.08" />
            <rect x="10" y="10" width="34" height="34" rx="5" fill="#6366f1" fillOpacity="0.2" />
            <rect x="15" y="15" width="24" height="24" rx="3" fill="#6366f1" />
            <rect x="56" y="10" width="34" height="34" rx="5" fill="#6366f1" fillOpacity="0.2" />
            <rect x="61" y="15" width="24" height="24" rx="3" fill="#6366f1" />
            <rect x="10" y="56" width="34" height="34" rx="5" fill="#6366f1" fillOpacity="0.2" />
            <rect x="15" y="61" width="24" height="24" rx="3" fill="#6366f1" />
            <rect x="56" y="56" width="12" height="12" rx="2" fill="#6366f1" />
            <rect x="72" y="56" width="18" height="12" rx="2" fill="#6366f1" />
            <rect x="56" y="72" width="18" height="18" rx="2" fill="#6366f1" />
            <rect x="78" y="78" width="12" height="12" rx="2" fill="#6366f1" />
        </svg>
    )
}

/** Animated phone for the notification card */
function VibratingPhone() {
    const shouldReduceMotion = useReducedMotion()

    return (
        <motion.div
            whileHover={
                shouldReduceMotion
                    ? {}
                    : {
                          rotate: [-2, 2, -2, 2, -1, 0],
                          transition: { duration: 0.4, ease: "easeInOut" },
                      }
            }
            className="w-12 h-12 rounded-2xl bg-[#EEF2FF] flex items-center justify-center cursor-default"
            aria-label="Téléphone de notification"
        >
            <Smartphone size={24} className="text-[#4F46E5]" aria-hidden="true" />
        </motion.div>
    )
}

/** Algo card — simplified, no confusing percentages */
function AlgoSignals() {
    return (
        <div className="space-y-2.5">
            <div className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center flex-shrink-0">
                    <Clock size={16} className="text-[#4F46E5]" aria-hidden="true" />
                </div>
                <div>
                    <p className="text-[11px] font-medium text-[#6B7280]">Cadence observée</p>
                    <p className="text-sm font-semibold text-[#111827]">2 min 10 par client</p>
                </div>
            </div>

            <div className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center flex-shrink-0">
                    <TrendingUp size={16} className="text-[#4F46E5]" aria-hidden="true" />
                </div>
                <div>
                    <p className="text-[11px] font-medium text-[#6B7280]">Pic prévu aujourd&apos;hui</p>
                    <p className="text-sm font-semibold text-[#111827]">12h – 14h</p>
                </div>
            </div>

            <div className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center flex-shrink-0">
                    <Users size={16} className="text-[#4F46E5]" aria-hidden="true" />
                </div>
                <div>
                    <p className="text-[11px] font-medium text-[#6B7280]">En file maintenant</p>
                    <p className="text-sm font-semibold text-[#111827]">18 clients · ~37 min</p>
                </div>
            </div>

            <p className="text-xs text-[#4F46E5] font-medium pt-0.5">
                Estimation recalculée en continu selon votre file active.
            </p>
        </div>
    )
}

/** Live stats — richer dashboard with hourly + daily data */
export function LiveStatsBoard() {
    // Hourly data: 9h → 18h
    const hourly = [
        { h: "9h", pct: 18 },
        { h: "10h", pct: 35 },
        { h: "11h", pct: 55 },
        { h: "12h", pct: 88 },
        { h: "13h", pct: 100 },
        { h: "14h", pct: 78 },
        { h: "15h", pct: 52 },
        { h: "16h", pct: 40 },
        { h: "17h", pct: 30 },
        { h: "18h", pct: 15 },
    ]

    const weekly = [
        { day: "Lun", v: 247 },
        { day: "Mar", v: 312 },
        { day: "Mer", v: 289 },
        { day: "Jeu", v: 356 },
        { day: "Ven", v: 401 },
    ]

    return (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-3 space-y-3">
            {/* KPI row */}
            <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-[#EEF2FF] px-2 py-1.5 text-center">
                    <p className="text-[10px] text-[#6B7280]">Servis</p>
                    <p className="text-sm font-black text-[#111827]">186</p>
                </div>
                <div className="rounded-lg bg-[#EEF2FF] px-2 py-1.5 text-center">
                    <p className="text-[10px] text-[#6B7280]">Moy.</p>
                    <p className="text-sm font-black text-[#111827]">6m40</p>
                </div>
                <div className="rounded-lg bg-[#DCFCE7] px-2 py-1.5 text-center">
                    <p className="text-[10px] text-[#15803D]">Pic</p>
                    <p className="text-sm font-black text-[#111827]">13h</p>
                </div>
            </div>

            {/* Hourly chart */}
            <div>
                <p className="text-[10px] uppercase tracking-wider text-[#6B7280] mb-1.5">Trafic horaire (aujourd&apos;hui)</p>
                <div className="flex items-end gap-1 h-14">
                    {hourly.map((item) => (
                        <div key={item.h} className="flex-1 flex flex-col items-center justify-end h-full gap-0.5">
                            <div
                                className={cn(
                                    "w-full rounded-t transition-all",
                                    item.pct === 100
                                        ? "bg-[#6366F1]"
                                        : item.pct >= 70
                                            ? "bg-[#6366F1]/70"
                                            : "bg-[#6366F1]/40"
                                )}
                                style={{ height: `${item.pct}%` }}
                                aria-hidden="true"
                            />
                        </div>
                    ))}
                </div>
                <div className="flex justify-between text-[8px] text-[#6B7280] mt-1">
                    <span>9h</span>
                    <span>11h</span>
                    <span>13h</span>
                    <span>15h</span>
                    <span>18h</span>
                </div>
            </div>

            {/* Weekly mini-table */}
            <div>
                <p className="text-[10px] uppercase tracking-wider text-[#6B7280] mb-1.5">Semaine en cours</p>
                <div className="grid grid-cols-5 gap-1">
                    {weekly.map((item) => (
                        <div key={item.day} className="rounded-lg bg-[#F8F9FA] border border-[#E5E7EB] px-1 py-1.5 text-center">
                            <p className="text-[9px] text-[#6B7280]">{item.day}</p>
                            <p className="text-[11px] font-bold text-[#111827]">{item.v}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

/** Visual logos for white-label card — real PNG images */
function BrandLogos() {
    const brands = [
        {
            name: "Bistrot Auguste",
            subtitle: "Restauration",
            imageSrc: "/marketing/brand-bistro.png",
        },
        {
            name: "Clinique Bellevue",
            subtitle: "Santé",
            imageSrc: "/marketing/brand-clinic.png",
        },
        {
            name: "Nova SAV",
            subtitle: "Retail & SAV",
            imageSrc: "/marketing/brand-sav.png",
        },
        {
            name: "Magic Park",
            subtitle: "Parcs d'attractions & festivals",
            imageSrc: "/marketing/usecase-event-ai.png",
        },
    ]

    return (
        <div className="flex flex-col gap-2">
            {brands.map((brand) => (
                <div key={brand.name} className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-[#E5E7EB]">
                    <div className="w-9 h-9 rounded-lg overflow-hidden border border-[#E5E7EB] flex-shrink-0">
                        <Image
                            src={brand.imageSrc}
                            alt={`Logo ${brand.name}`}
                            width={36}
                            height={36}
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-[#111827]">{brand.name}</div>
                        <div className="text-xs text-[#6B7280]">{brand.subtitle}</div>
                    </div>
                </div>
            ))}
        </div>
    )
}

/** Large phone mockup for main bento card — faithful to the real customer UI */
function LargePhoneMockup() {
    return (
        <div className="flex justify-center items-end h-full pt-4">
            <div className="relative w-[200px]">
                {/* Phone body */}
                <div className="bg-[#111827] rounded-[2rem] p-2.5 shadow-[0_20px_60px_-8px_rgba(0,0,0,0.3)]">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#111827] rounded-b-2xl z-10" aria-hidden="true" />
                    <div className="rounded-[1.6rem] overflow-hidden bg-[#F9FAFB] aspect-[9/19.5]">
                        {/* Header */}
                        <div className="bg-white border-b border-[#E5E7EB] px-3 pt-6 pb-2 text-center">
                            <div className="text-[8px] text-[#6B7280] uppercase tracking-widest">Le Bistrot du Coin</div>
                        </div>
                        {/* Content */}
                        <div className="flex flex-col gap-2 px-3 py-3 bg-[#F9FAFB]">
                            {/* Ticket number */}
                            <div className="bg-white rounded-xl px-2 py-2 border border-[#E5E7EB] text-center">
                                <div className="text-[7px] text-[#6B7280] uppercase tracking-widest">Votre numéro</div>
                                <div className="text-2xl font-black text-[#111827] leading-none">42</div>
                            </div>
                            {/* Queue position */}
                            <div className="bg-white rounded-xl px-2 py-2 border border-[#E5E7EB]">
                                <div className="flex items-center gap-2">
                                    {/* Dot rail */}
                                    <div className="flex flex-col items-center gap-0.5">
                                        {[0,1,2].map(i => <span key={i} className="block w-1.5 h-1.5 rounded-full bg-[#D1D5DB]" aria-hidden="true" />)}
                                        <span className="relative block w-2.5 h-2.5 rounded-full bg-[#6366F1]" aria-hidden="true">
                                            <span className="absolute inset-0 rounded-full bg-[#6366F1]/40 animate-ping" />
                                        </span>
                                        {[0,1].map(i => <span key={i} className="block w-1 h-1 rounded-full bg-[#E5E7EB]" aria-hidden="true" />)}
                                    </div>
                                    {/* Info */}
                                    <div className="flex flex-col gap-0.5">
                                        <div className="text-lg font-black text-[#111827] leading-none">3</div>
                                        <div className="text-[7px] text-[#6B7280] font-medium">3 personnes devant vous</div>
                                        <div className="flex items-center gap-0.5 bg-[#F3F4F6] rounded px-1 py-0.5 w-fit">
                                            <Clock size={7} className="text-[#6B7280]" aria-hidden="true" />
                                            <span className="text-[6px] text-[#6B7280] font-medium">~8 min</span>
                                        </div>
                                        <div className="flex items-center gap-0.5 bg-[#EEF2FF] rounded px-1 py-0.5 w-fit">
                                            <span className="text-[6px] text-[#4F46E5] font-medium">Vers 14:32</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Games */}
                            <div className="bg-white rounded-xl px-2 py-2 border border-[#E5E7EB]">
                                <div className="text-[7px] font-bold text-[#111827] mb-1">Patientez en jouant</div>
                                <div className="flex gap-1">
                                    <div className="bg-[#EEF2FF] rounded px-1.5 py-0.5 text-[6px] text-[#4F46E5] font-semibold">Snake</div>
                                    <div className="bg-[#EEF2FF] rounded px-1.5 py-0.5 text-[6px] text-[#4F46E5] font-semibold">2048</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


/**
 * Bento Grid features section.
 * 6-card glass grid showcasing Wait-Light capabilities.
 */
export function BentoFeaturesGrid({ id }: { id?: string }) {
    return (
        <section
            id={id}
            className="py-24 md:py-32 bg-[#F8F9FA]"
            aria-labelledby="features-heading"
        >
            <div className="max-w-6xl mx-auto px-6">
                {/* Section header */}
                <div className="text-center mb-16">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EEF2FF] text-[#4338CA] text-xs font-semibold tracking-wide uppercase mb-4">
                        Fonctionnalités
                    </span>
                    <h2
                        id="features-heading"
                        className="text-4xl md:text-5xl font-black tracking-tighter text-[#111827]"
                    >
                        Simple pour vos clients,
                        <br />
                        <span className="text-[#6366F1]">puissant pour vous.</span>
                    </h2>
                </div>

                {/* Bento grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-auto">
                    {/* Card 1 — Large: Phone mockup (col-span-7) */}
                    <BentoCard
                        className="md:col-span-7 md:row-span-2 md:min-h-[420px] flex flex-col"
                    >
                        <div className="flex-1 flex flex-col">
                            <div className="mb-2">
                                <span className="text-xs font-semibold text-[#4F46E5] uppercase tracking-wider">Interface client</span>
                                <h3 className="text-2xl font-black text-[#111827] mt-1 tracking-tight">
                                    Votre file d&apos;attente,
                                    <br />dans leur poche.
                                </h3>
                                <p className="text-sm text-[#374151] mt-2 leading-relaxed">
                                    Le client suit sa position en temps réel, joue en attendant et reçoit un rappel dès son tour.
                                </p>
                            </div>
                            {/* Phone mockup hidden on mobile */}
                            <div className="hidden md:block flex-1">
                                <LargePhoneMockup />
                            </div>
                        </div>
                    </BentoCard>

                    {/* Card 2 — Small: Notification reminders (col-span-5) */}
                    <BentoCard className="md:col-span-5 min-h-[190px] flex flex-col justify-between">
                        <div>
                            <span className="text-xs font-semibold text-[#4F46E5] uppercase tracking-wider">Notifications</span>
                            <h3 className="text-xl font-black text-[#111827] mt-1 tracking-tight">Rappels &amp; alertes</h3>
                            <p className="text-sm text-[#374151] mt-2">
                                Plus besoin de rester sur place. Un rappel navigateur est envoyé au bon moment.
                            </p>
                        </div>
                        <div className="flex items-center gap-4 mt-4">
                            <VibratingPhone />
                            <div className="flex flex-col gap-1.5">
                                <div className="inline-flex items-center gap-1 rounded-full bg-[#EEF2FF] px-2 py-1 text-[10px] font-semibold text-[#4F46E5]">
                                    <BellRing size={10} aria-hidden="true" />
                                    Votre tour approche
                                </div>
                                <p className="text-[11px] text-[#6B7280]">Notification visuelle + sonore selon l&apos;appareil.</p>
                            </div>
                        </div>
                    </BentoCard>

                    {/* Card 3 — Medium: Algorithm (col-span-5) */}
                    <BentoCard className="md:col-span-5 min-h-[190px] flex flex-col justify-between">
                        <div>
                            <span className="text-xs font-semibold text-[#4F46E5] uppercase tracking-wider">Algorithme</span>
                            <h3 className="text-xl font-black text-[#111827] mt-1 tracking-tight">Estimation intelligente</h3>
                            <p className="text-sm text-[#374151] mt-2">
                                Notre moteur apprend de votre cadence réelle et affine l&apos;heure d&apos;arrivée estimée en continu.
                            </p>
                        </div>
                        <div className="mt-4">
                            <AlgoSignals />
                        </div>
                    </BentoCard>

                    {/* Card 4 — Small: QR Code — centered, large */}
                    <BentoCard className="md:col-span-4 min-h-[180px] flex flex-col items-center text-center">
                        <div className="max-w-[240px]">
                            <span className="text-xs font-semibold text-[#4F46E5] uppercase tracking-wider">Simplicité</span>
                            <h3 className="text-xl font-black text-[#111827] mt-1 tracking-tight">Zéro installation</h3>
                            <p className="text-sm text-[#374151] mt-2">
                                Un QR Code suffit. Aucune app à télécharger pour vos clients.
                            </p>
                        </div>
                        <div className="mt-4 w-full flex items-center justify-center">
                            <div className="w-24 h-24 md:w-36 md:h-36 rounded-2xl bg-[#EEF2FF] flex items-center justify-center p-3">
                                <QrIllustration />
                            </div>
                        </div>
                    </BentoCard>

                    {/* Card 5 — Small: White label (col-span-4) */}
                    <BentoCard className="md:col-span-4 min-h-[180px] flex flex-col justify-between">
                        <div>
                            <span className="text-xs font-semibold text-[#4F46E5] uppercase tracking-wider">Personnalisation</span>
                            <h3 className="text-xl font-black text-[#111827] mt-1 tracking-tight">Marque blanche</h3>
                            <p className="text-sm text-[#374151] mt-2">
                                Votre logo, votre couleur. Vos clients ne voient que vous.
                            </p>
                        </div>
                        {/* Brand logos hidden on mobile to save space */}
                        <div className="hidden sm:block mt-4">
                            <BrandLogos />
                        </div>
                    </BentoCard>

                    {/* Card 6 — Small: Stats (col-span-4) */}
                    <BentoCard className="md:col-span-4 min-h-[180px] flex flex-col justify-between">
                        <div>
                            <span className="text-xs font-semibold text-[#4F46E5] uppercase tracking-wider">Analytics</span>
                            <h3 className="text-xl font-black text-[#111827] mt-1 tracking-tight">Stats en direct</h3>
                            <p className="text-sm text-[#374151] mt-2">
                                Suivez votre file par heure, votre temps moyen et vos pics sur la même vue.
                            </p>
                        </div>
                        {/* Stats board hidden on mobile to save space */}
                        <div className="hidden sm:block mt-4">
                            <LiveStatsBoard />
                        </div>
                    </BentoCard>
                </div>
            </div>
        </section>
    )
}
