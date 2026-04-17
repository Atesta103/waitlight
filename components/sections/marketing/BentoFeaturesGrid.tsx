"use client"

import { useReducedMotion, motion } from "framer-motion"
import { Smartphone, Clock, QrCode } from "lucide-react"
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

/** QR Code SVG illustration */
function QrIllustration() {
    return (
        <svg viewBox="0 0 80 80" className="w-16 h-16" aria-hidden="true">
            <rect width="80" height="80" rx="12" fill="#6366f1" fillOpacity="0.08" />
            <rect x="8" y="8" width="28" height="28" rx="4" fill="#6366f1" fillOpacity="0.2" />
            <rect x="12" y="12" width="20" height="20" rx="2" fill="#6366f1" />
            <rect x="44" y="8" width="28" height="28" rx="4" fill="#6366f1" fillOpacity="0.2" />
            <rect x="48" y="12" width="20" height="20" rx="2" fill="#6366f1" />
            <rect x="8" y="44" width="28" height="28" rx="4" fill="#6366f1" fillOpacity="0.2" />
            <rect x="12" y="48" width="20" height="20" rx="2" fill="#6366f1" />
            <rect x="44" y="44" width="10" height="10" rx="2" fill="#6366f1" />
            <rect x="58" y="44" width="14" height="10" rx="2" fill="#6366f1" />
            <rect x="44" y="58" width="14" height="14" rx="2" fill="#6366f1" />
            <rect x="62" y="62" width="10" height="10" rx="2" fill="#6366f1" />
        </svg>
    )
}

/** Animated vibrating phone for the notification card */
function VibratingPhone() {
    const shouldReduceMotion = useReducedMotion()

    return (
        <motion.div
            whileHover={
                shouldReduceMotion
                    ? {}
                    : {
                          rotate: [-3, 3, -3, 3, -2, 0],
                          transition: { duration: 0.4, ease: "easeInOut" },
                      }
            }
            className="w-12 h-12 rounded-2xl bg-[#EEF2FF] flex items-center justify-center cursor-default"
            aria-label="Téléphone en vibration"
        >
            <Smartphone size={24} className="text-[#4F46E5]" aria-hidden="true" />
        </motion.div>
    )
}

/** Animated progress bar for the algorithm card */
function AlgoProgressBar() {
    const shouldReduceMotion = useReducedMotion()
    const bars = [
        { label: "Temps de service", pct: 73 },
        { label: "Affluence", pct: 45 },
        { label: "Position", pct: 91 },
    ]

    return (
        <div className="space-y-2">
            {bars.map(({ label, pct }, i) => (
                <div key={label}>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#374151] font-medium">{label}</span>
                        <span className="font-semibold text-[#4F46E5]">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-[#6366F1] rounded-full"
                            initial={{ width: 0 }}
                            whileInView={{ width: `${pct}%` }}
                            whileHover={shouldReduceMotion ? {} : { width: ["0%", `${pct}%`] }}
                            transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                            viewport={{ once: true }}
                        />
                    </div>
                </div>
            ))}
        </div>
    )
}

/** Fake brand logos for white-label card */
function BrandLogos() {
    const brands = [
        { name: "Le Bistrot", color: "#F59E0B", initial: "B" },
        { name: "Clinique Nord", color: "#10B981", initial: "C" },
        { name: "TechStore SAV", color: "#6366F1", initial: "T" },
    ]

    return (
        <div className="flex flex-col gap-2">
            {brands.map((brand) => (
                <div key={brand.name} className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-[#E5E7EB]">
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                        style={{ backgroundColor: brand.color }}
                        aria-hidden="true"
                    >
                        {brand.initial}
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-[#111827]">{brand.name}</div>
                        <div className="text-xs text-[#6B7280]">Powered by Wait-Light</div>
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
                        className="md:col-span-7 md:row-span-2 min-h-[420px] flex flex-col"
                       
                    >
                        <div className="flex-1 flex flex-col">
                            <div className="mb-2">
                                <span className="text-xs font-semibold text-[#4F46E5] uppercase tracking-wider">Interface client</span>
                                <h3 className="text-2xl font-black text-[#111827] mt-1 tracking-tight">
                                    Votre file d&apos;attente,
                                    <br />dans leur poche.
                                </h3>
                                <p className="text-sm text-[#374151] mt-2 leading-relaxed">
                                    Le client suit sa position en temps réel, joue en attendant et reçoit une alerte vibratoire dès son tour.
                                </p>
                            </div>
                            <LargePhoneMockup />
                        </div>
                    </BentoCard>

                    {/* Card 2 — Small: Vibration notification (col-span-5) */}
                    <BentoCard className="md:col-span-5 min-h-[190px] flex flex-col justify-between">
                        <div>
                            <span className="text-xs font-semibold text-[#4F46E5] uppercase tracking-wider">Notifications</span>
                            <h3 className="text-xl font-black text-[#111827] mt-1 tracking-tight">Vibrations &amp; Alertes</h3>
                            <p className="text-sm text-[#374151] mt-2">
                                Plus besoin de rester sur place. Le téléphone vibre quand c&apos;est le moment.
                            </p>
                        </div>
                        <div className="flex items-center gap-4 mt-4">
                            <VibratingPhone />
                            <div className="flex flex-col gap-1.5">
                                <div className="h-2 bg-[#6366F1]/20 rounded-full w-24" />
                                <div className="h-2 bg-[#6366F1]/40 rounded-full w-16" />
                                <div className="h-2 bg-[#6366F1] rounded-full w-20" />
                            </div>
                        </div>
                    </BentoCard>

                    {/* Card 3 — Medium: Algorithm (col-span-5) */}
                    <BentoCard className="md:col-span-5 min-h-[190px] flex flex-col justify-between">
                        <div>
                            <span className="text-xs font-semibold text-[#4F46E5] uppercase tracking-wider">Algorithme</span>
                            <h3 className="text-xl font-black text-[#111827] mt-1 tracking-tight">Temps réel calculé</h3>
                            <p className="text-sm text-[#374151] mt-2">
                                Notre algorithme prédit le temps d&apos;attente en analysant la cadence de service.
                            </p>
                        </div>
                        <div className="mt-4">
                            <AlgoProgressBar />
                        </div>
                    </BentoCard>

                    {/* Card 4 — Small: QR Code (col-span-4) */}
                    <BentoCard className="md:col-span-4 min-h-[200px] flex flex-col justify-between">
                        <div>
                            <span className="text-xs font-semibold text-[#4F46E5] uppercase tracking-wider">Simplicité</span>
                            <h3 className="text-xl font-black text-[#111827] mt-1 tracking-tight">Zéro installation</h3>
                            <p className="text-sm text-[#374151] mt-2">
                                Un QR Code suffit. Aucune app à télécharger pour vos clients.
                            </p>
                        </div>
                        <div className="mt-4">
                            <div className="w-14 h-14 rounded-2xl bg-[#EEF2FF] flex items-center justify-center">
                                <QrCode size={28} className="text-[#4F46E5]" aria-hidden="true" />
                            </div>
                        </div>
                    </BentoCard>

                    {/* Card 5 — Small: White label (col-span-4) */}
                    <BentoCard className="md:col-span-4 min-h-[200px] flex flex-col justify-between">
                        <div>
                            <span className="text-xs font-semibold text-[#4F46E5] uppercase tracking-wider">Personnalisation</span>
                            <h3 className="text-xl font-black text-[#111827] mt-1 tracking-tight">Marque blanche</h3>
                            <p className="text-sm text-[#374151] mt-2">
                                Votre logo, votre couleur. Vos clients ne voient que vous.
                            </p>
                        </div>
                        <div className="mt-4">
                            <BrandLogos />
                        </div>
                    </BentoCard>

                    {/* Card 6 — Small: Stats (col-span-4) */}
                    <BentoCard className="md:col-span-4 min-h-[200px] flex flex-col justify-between">
                        <div>
                            <span className="text-xs font-semibold text-[#4F46E5] uppercase tracking-wider">Analytics</span>
                            <h3 className="text-xl font-black text-[#111827] mt-1 tracking-tight">Stats en direct</h3>
                            <p className="text-sm text-[#374151] mt-2">
                                Temps moyen, taux de passage, heures de pointe — tout en un coup d&apos;œil.
                            </p>
                        </div>
                        <div className="mt-4 flex items-end gap-1.5 h-12">
                            {[40, 65, 50, 80, 60, 90, 75].map((h, i) => (
                                <div
                                    key={i}
                                    className="flex-1 bg-[#6366F1] rounded-t"
                                    style={{ height: `${h}%`, opacity: 0.3 + (i / 6) * 0.7 }}
                                    aria-hidden="true"
                                />
                            ))}
                        </div>
                    </BentoCard>
                </div>
            </div>
        </section>
    )
}
