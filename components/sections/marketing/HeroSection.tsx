import Link from "next/link"
import { ArrowRight, CheckCircle, Clock, BellRing, ChevronUp } from "lucide-react"

/** Faithful phone mockup of the real /[slug]/wait/[ticketId] customer page */
function PhoneMockup() {
    return (
        <div className="relative">
            {/* Phone frame */}
            <div className="relative w-[280px] sm:w-[300px]">
                <div className="bg-[#111827] rounded-[2.5rem] p-3 shadow-[0_32px_80px_-12px_rgba(0,0,0,0.28),0_0_0_1px_rgba(255,255,255,0.06)]">
                    {/* Notch */}
                    <div
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-[#111827] rounded-b-3xl z-10"
                        aria-hidden="true"
                    />
                    {/* Screen */}
                    <div className="rounded-[2.1rem] overflow-hidden bg-[#F9FAFB] aspect-[9/19.5]">
                        {/* Status bar */}
                        <div className="bg-white flex justify-between items-center px-5 pt-7 pb-2 text-[9px] font-semibold text-[#6B7280]">
                            <span>9:41</span>
                            <span className="flex gap-1 items-center">
                                <span className="w-4 h-2 border border-[#6B7280] rounded-sm relative">
                                    <span className="absolute inset-0.5 right-0.5 bg-[#10B981] rounded-sm" />
                                </span>
                            </span>
                        </div>

                        {/* App header */}
                        <div className="bg-white border-b border-[#E5E7EB] px-4 pb-3">
                            <div className="text-[9px] text-[#6B7280] uppercase tracking-widest text-center">Le Bistrot du Coin</div>
                        </div>

                        {/* Content area */}
                        <div className="flex flex-col gap-3 px-4 py-4 bg-[#F9FAFB]">
                            {/* Ticket header */}
                            <div className="bg-white rounded-2xl px-3 py-3 shadow-sm border border-[#E5E7EB] text-center">
                                <div className="text-[8px] text-[#6B7280] uppercase tracking-widest mb-1">Votre numéro</div>
                                <div className="text-3xl font-black text-[#111827] leading-none">42</div>
                                <div className="text-[8px] text-[#6B7280] mt-1">Thomas D.</div>
                            </div>

                            {/* Queue position row — faithful to QueuePositionCard */}
                            <div className="bg-white rounded-2xl px-3 py-3 shadow-sm border border-[#E5E7EB]">
                                <div className="flex items-center gap-3">
                                    {/* Rail dots */}
                                    <div className="flex flex-col items-center gap-1">
                                        {/* dots ahead */}
                                        {[0, 1, 2].map((i) => (
                                            <span
                                                key={i}
                                                className="block w-2 h-2 rounded-full bg-[#D1D5DB]"
                                                aria-hidden="true"
                                            />
                                        ))}
                                        {/* your dot — pulsing */}
                                        <span className="relative block w-3.5 h-3.5 rounded-full bg-[#6366F1]" aria-hidden="true">
                                            <span className="absolute inset-0 rounded-full bg-[#6366F1]/40 animate-ping" />
                                        </span>
                                        {/* dots behind */}
                                        {[0, 1].map((i) => (
                                            <span
                                                key={i}
                                                className="block w-1.5 h-1.5 rounded-full bg-[#E5E7EB]"
                                                aria-hidden="true"
                                            />
                                        ))}
                                    </div>

                                    {/* Info */}
                                    <div className="flex flex-col gap-0.5">
                                        <div className="text-xl font-black text-[#111827] leading-none">3</div>
                                        <div className="text-[8px] text-[#6B7280] font-medium">3 personnes devant vous</div>
                                        {/* Time pill */}
                                        <div className="flex items-center gap-1 mt-1 bg-[#F3F4F6] rounded px-1.5 py-0.5 w-fit">
                                            <Clock size={8} className="text-[#6B7280]" aria-hidden="true" />
                                            <span className="text-[7px] text-[#6B7280] font-medium">~8 min</span>
                                        </div>
                                        {/* ETA pill */}
                                        <div className="flex items-center gap-1 bg-[#EEF2FF] rounded px-1.5 py-0.5 w-fit">
                                            <span className="text-[7px] text-[#6366F1] font-medium">Votre tour vers 14:32</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* "Advance" badge */}
                            <div className="flex items-center gap-1 bg-[#D1FAE5] rounded-full px-2 py-1 w-fit self-center">
                                <ChevronUp size={9} className="text-[#10B981]" aria-hidden="true" />
                                <span className="text-[7px] font-semibold text-[#10B981]">vous avancez !</span>
                            </div>

                            {/* Mini games teaser */}
                            <div className="bg-white rounded-2xl px-3 py-2.5 shadow-sm border border-[#E5E7EB]">
                                <div className="text-[8px] font-bold text-[#111827] mb-1.5 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1]" aria-hidden="true" />
                                    Patientez en jouant
                                </div>
                                <div className="flex gap-1.5">
                                    <div className="bg-[#EEF2FF] rounded-lg px-2 py-1 text-[7px] text-[#6366F1] font-semibold">Snake</div>
                                    <div className="bg-[#EEF2FF] rounded-lg px-2 py-1 text-[7px] text-[#6366F1] font-semibold">2048</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating notification bubble */}
                <div className="absolute -right-6 top-24 bg-white rounded-2xl shadow-lg border border-[#E5E7EB] px-3 py-2 flex items-start gap-2 w-44">
                    <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-[#6366F1] flex items-center justify-center mt-0.5">
                        <BellRing size={12} className="text-white" aria-hidden="true" />
                    </div>
                    <div>
                        <div className="text-[9px] font-bold text-[#111827]">C&apos;est votre tour !</div>
                        <div className="text-[8px] text-[#6B7280]">Le Bistrot du Coin</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const TRUST_ITEMS = [
    "Essai gratuit 14 jours",
    "Sans carte bancaire",
    "Configuration en 2 min",
]

/**
 * Hero section — split layout: text left, phone right.
 */
export function HeroSection({ id }: { id?: string }) {
    return (
        <section
            id={id}
            className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden bg-[#F8F9FA]"
            aria-labelledby="hero-heading"
        >
            {/* Background radial glow */}
            <div
                className="pointer-events-none absolute inset-0"
                aria-hidden="true"
            >
                <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#6366F1]/6 blur-[120px] -translate-y-1/3 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#A5B4FC]/8 blur-[100px] translate-y-1/3" />
            </div>

            <div className="relative max-w-6xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* ── Left: text content ── */}
                    <div className="flex flex-col gap-7">
                        {/* Label pill */}
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EEF2FF] text-[#4338CA] text-xs font-semibold tracking-wide uppercase w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1] animate-pulse" aria-hidden="true" />
                            File d&apos;attente digitale — Scan &amp; Go
                        </span>

                        {/* H1 */}
                        <h1
                            id="hero-heading"
                            className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-[#111827] leading-[0.95]"
                        >
                            L&apos;attente
                            <br />
                            devient un
                            <br />
                            <span className="text-[#6366F1]">plaisir.</span>
                        </h1>

                        {/* Sub-headline */}
                        <p className="text-base md:text-lg text-[#374151] leading-relaxed max-w-md">
                            Vos clients scannent un QR Code, patientent librement et reçoivent
                            une alerte dès que c&apos;est leur tour.
                            <br />
                            <strong className="text-[#111827]">Zéro installation. Zéro bipeur.</strong>
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row items-start gap-3">
                            <Link
                                href="/login"
                                id="hero-cta-primary"
                                className="
                                    inline-flex items-center justify-center gap-2
                                    px-7 py-3.5 rounded-xl
                                    bg-[#6366F1] text-white font-semibold text-sm
                                    shadow-[0_0_16px_rgba(99,102,241,0.3)]
                                    hover:shadow-[0_0_28px_rgba(99,102,241,0.45)]
                                    hover:bg-[#4F46E5]
                                    transition-all duration-200
                                "
                            >
                                Démarrer l&apos;essai gratuit
                                <ArrowRight size={16} aria-hidden="true" />
                            </Link>
                            <a
                                href="#comment-ca-marche"
                                id="hero-cta-secondary"
                                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-[#D1D5DB] text-[#111827] font-semibold text-sm bg-white hover:border-[#6366F1] hover:text-[#6366F1] transition-all duration-150"
                            >
                                Voir comment ça marche
                            </a>
                        </div>

                        {/* Trust badges */}
                        <ul className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-5">
                            {TRUST_ITEMS.map((item) => (
                                <li key={item} className="flex items-center gap-1.5 text-sm text-[#374151]">
                                    <CheckCircle size={15} className="text-[#10B981] flex-shrink-0" aria-hidden="true" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* ── Right: phone mockup ── */}
                    <div className="flex justify-center lg:justify-end">
                        <PhoneMockup />
                    </div>
                </div>
            </div>
        </section>
    )
}
