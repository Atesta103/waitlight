"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Settings, QrCode, CheckCircle2, BellRing } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { MerchantDashboardMockup, ClientWidgetMockup } from "@/components/sections/marketing/HeroSection"
import { QRCodeDisplay } from "@/components/composed/QRCodeDisplay"

// --- Mockups Components ---

function SetupMockup() {
    return (
        <div className="pointer-events-none scale-[0.85] sm:scale-100 origin-center w-full max-w-[380px] rounded-2xl bg-white shadow-xl border border-[#E5E7EB] overflow-hidden">
            <div className="bg-[#F8F9FA] px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-[#111827]">Paramètres de la file</h3>
                    <p className="text-[10px] text-[#6B7280] mt-0.5">Personnalisez l&apos;expérience de vos clients</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#EEF2FF] flex items-center justify-center">
                    <Settings size={16} className="text-[#6366F1]" />
                </div>
            </div>
            
            <div className="p-5 space-y-5">
                {/* Brand Name */}
                <div>
                    <label className="block text-[11px] font-semibold text-[#374151] mb-1.5">Nom de l&apos;établissement</label>
                    <div className="flex rounded-md shadow-sm">
                        <span className="inline-flex items-center rounded-l-md border border-r-0 border-[#D1D5DB] bg-[#F9FAFB] px-3 text-[#6B7280] sm:text-xs">
                            Nom
                        </span>
                        <input
                            type="text"
                            className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border border-[#D1D5DB] px-3 py-2 text-xs text-[#111827] sm:text-sm"
                            defaultValue="Le Bistrot du Coin"
                            readOnly
                            tabIndex={-1}
                        />
                    </div>
                </div>

                {/* Brand Color */}
                <div>
                    <label className="block text-[11px] font-semibold text-[#374151] mb-2">Couleur principale</label>
                    <div className="flex gap-3">
                        {['#6366F1', '#10B981', '#F43F5E', '#F59E0B', '#111827'].map((color, i) => (
                            <div key={i} className={cn("w-8 h-8 rounded-full relative shadow-sm border border-black/10", i===0 && "ring-2 ring-offset-2 ring-[#6366F1]")} style={{ backgroundColor: color }}>
                                {i === 0 && <span className="absolute inset-0 flex items-center justify-center"><CheckCircle2 size={14} className="text-white drop-shadow-md" /></span>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* QR Code Action */}
                <div className="pt-2 flex justify-end gap-3">
                    <span className="px-3 py-2 bg-white border border-[#D1D5DB] rounded-lg text-xs font-semibold text-[#374151] shadow-sm flex items-center gap-1.5">
                        <QrCode size={14} />
                        Voir le QR Code
                    </span>
                    <span className="px-4 py-2 bg-[#111827] text-white rounded-lg text-xs font-semibold shadow-sm">
                        Enregistrer
                    </span>
                </div>
            </div>
        </div>
    )
}

function ScanMockup() {
    return (
        <div className="pointer-events-none scale-75 sm:scale-90 origin-center">
            <QRCodeDisplay slug="lebistrot" size={180} mockMode={true} />
        </div>
    )
}

function WaitMockup() {
    return (
        <div className="pointer-events-none scale-[0.80] sm:scale-90 origin-center flex items-center justify-center">
            <ClientWidgetMockup showNotification={false} />
        </div>
    )
}

function CallMockup() {
    return (
        <div className="pointer-events-none scale-[0.85] sm:scale-100 origin-center w-full max-w-[380px]">
            <div className="w-full rounded-[1rem] bg-white p-4 shadow-xl border border-[#E5E7EB]">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#E5E7EB]">
                    <div>
                    <h3 className="text-sm font-bold text-[#111827]">File active</h3>
                    <p className="text-[10px] text-[#6B7280]">18 personnes en attente</p>
                </div>
                <div className="bg-[#DCFCE7] text-[#15803D] px-2 py-1 rounded text-[10px] font-bold">Ouvert</div>
            </div>
            
            <div className="space-y-2">
                <div className="flex items-center justify-between bg-[#F9FAFB] p-3 rounded-lg border border-[#E5E7EB]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm border border-[#E5E7EB]">42</div>
                        <div>
                            <p className="text-xs font-bold text-[#111827]">Thomas D.</p>
                            <p className="text-[10px] text-[#6B7280]">Attends depuis 8 min</p>
                        </div>
                    </div>
                    <span className="bg-[#6366F1] text-white px-3 py-1.5 rounded-md text-[10px] font-bold shadow-sm flex items-center gap-1 relative overflow-hidden">
                        <BellRing size={12} className="animate-pulse" />
                        Appeler
                    </span>
                </div>
                <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-[#E5E7EB] opacity-60">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#F3F4F6] rounded-full flex items-center justify-center font-bold text-sm">43</div>
                        <div>
                            <p className="text-xs font-bold text-[#111827]">Marie L.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </div>
    )
}

function NotifyMockup() {
    return (
        <div className="pointer-events-none scale-[0.80] sm:scale-90 origin-center flex items-center justify-center">
            <ClientWidgetMockup showNotification={true} />
        </div>
    )
}

function StatsMockup() {
    return (
        <div className="pointer-events-none scale-[0.80] sm:scale-95 origin-center">
            <MerchantDashboardMockup />
        </div>
    )
}

// --- Steps Data ---

const FLOW_STEPS = [
    {
        id: "setup",
        title: "1. Le marchand configure",
        description: "En quelques clics, personnalisez votre espace avec vos couleurs et votre logo, et imprimez votre QR Code.",
        Mockup: SetupMockup,
        side: "merchant"
    },
    {
        id: "scan",
        title: "2. Le client scanne",
        description: "Pas d'application à télécharger. Un simple scan avec l'appareil photo du téléphone suffit pour rejoindre la file.",
        Mockup: ScanMockup,
        side: "client"
    },
    {
        id: "wait",
        title: "3. L'attente devient libre",
        description: "Le client suit sa position en temps réel. Pour patienter, il peut jouer à des mini-jeux directement depuis son navigateur.",
        Mockup: WaitMockup,
        side: "client"
    },
    {
        id: "call",
        title: "4. Le marchand appelle",
        description: "Depuis n'importe quel appareil (tablette, téléphone, PC), le commerçant appelle le client suivant d'un simple clic.",
        Mockup: CallMockup,
        side: "merchant"
    },
    {
        id: "notify",
        title: "5. Le client est notifié",
        description: "Le téléphone du client s'allume et affiche une alerte bien visible. Il sait qu'il doit se présenter.",
        Mockup: NotifyMockup,
        side: "client"
    },
    {
        id: "complete",
        title: "6. Fin et statistiques",
        description: "Une fois le client servi, le marchand retrouve des statistiques détaillées pour optimiser ses effectifs.",
        Mockup: StatsMockup,
        side: "merchant"
    }
]

/** Duration (ms) each slide stays before auto-advancing */
const AUTO_PLAY_INTERVAL_MS = 6000

export function FlowCarouselSection({ id }: { id?: string }) {
    const [currentStep, setCurrentStep] = useState(0)
    const [direction, setDirection] = useState(0)
    /** progress 0→1 of the current bar fill (for CSS animation reset) */
    const [progress, setProgress] = useState(0)
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const startRef = useRef(Date.now())

    const goTo = useCallback((index: number, dir?: number) => {
        setDirection(dir ?? (index > currentStep ? 1 : -1))
        setCurrentStep(index)
        setProgress(0)
        startRef.current = Date.now()
    }, [currentStep])

    const paginate = useCallback((newDirection: number) => {
        setCurrentStep((prev) => {
            let next = prev + newDirection
            if (next < 0) next = FLOW_STEPS.length - 1
            if (next >= FLOW_STEPS.length) next = 0
            setDirection(newDirection)
            setProgress(0)
            startRef.current = Date.now()
            return next
        })
    }, [])

    // Auto-play: tick every 50ms to update the progress bar smoothly
    useEffect(() => {
        startRef.current = Date.now()

        timerRef.current = setInterval(() => {
            const elapsed = Date.now() - startRef.current
            const p = Math.min(elapsed / AUTO_PLAY_INTERVAL_MS, 1)
            setProgress(p)

            if (p >= 1) {
                // Auto-advance to next
                setCurrentStep((prev) => {
                    const next = (prev + 1) % FLOW_STEPS.length
                    setDirection(1)
                    setProgress(0)
                    startRef.current = Date.now()
                    return next
                })
            }
        }, 50)

        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [])

    // When user manually navigates, reset the timer
    const handleManualNav = useCallback((index: number) => {
        goTo(index)
    }, [goTo])

    const handlePrev = useCallback(() => paginate(-1), [paginate])
    const handleNext = useCallback(() => paginate(1), [paginate])

    const stepData = FLOW_STEPS[currentStep]
    const CurrentMockup = stepData.Mockup

    return (
        <section id={id} className="py-24 sm:py-32 bg-white relative overflow-hidden">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center mb-16">
                    <span className="text-[#6366F1] font-bold tracking-wider uppercase text-sm mb-4 block">Démonstration</span>
                    <h2 className="text-3xl font-black tracking-tight text-[#111827] sm:text-5xl">
                        Un parcours sans friction.
                    </h2>
                    <p className="mt-6 text-lg leading-8 text-[#4B5563]">
                        Découvrez comment Wait-Light fluidifie l&apos;attente, étape par étape, pour vous et pour vos clients.
                    </p>
                </div>

                <div className="bg-[#F8F9FA] rounded-[2rem] border border-[#E5E7EB] p-6 sm:p-10 lg:p-12 relative">
                    
                    {/* ── Progressive fill bars ── */}
                    <div className="flex items-center gap-2 sm:gap-3 mb-10">
                        {FLOW_STEPS.map((step, idx) => {
                            const isActive = idx === currentStep
                            const isDone = idx < currentStep

                            return (
                                <button
                                    key={step.id}
                                    onClick={() => handleManualNav(idx)}
                                    className="group relative flex-1 flex flex-col items-center gap-1.5 focus-visible:outline-none"
                                    aria-label={`Étape ${idx + 1}: ${step.title}`}
                                    aria-current={isActive ? "step" : undefined}
                                >
                                    {/* Step label — visible on sm+ */}
                                    <span className={cn(
                                        "hidden sm:block text-[10px] font-semibold tracking-wide transition-colors",
                                        isActive
                                            ? "text-[#111827]"
                                            : isDone
                                              ? "text-[#6366F1]"
                                              : "text-[#9CA3AF] group-hover:text-[#6B7280]",
                                    )}>
                                        {idx + 1}
                                    </span>

                                    {/* Bar track */}
                                    <div className="relative w-full h-1.5 rounded-full bg-[#E5E7EB] overflow-hidden">
                                        {/* Fill */}
                                        <div
                                            className={cn(
                                                "absolute inset-y-0 left-0 rounded-full transition-[width]",
                                                isDone
                                                    ? "bg-[#6366F1] w-full"
                                                    : isActive
                                                      ? "bg-[#6366F1]"
                                                      : "bg-transparent w-0",
                                            )}
                                            style={isActive ? { width: `${progress * 100}%`, transition: "width 50ms linear" } : undefined}
                                        />
                                    </div>

                                    {/* Side indicator dot */}
                                    <span className={cn(
                                        "w-1.5 h-1.5 rounded-full shrink-0",
                                        step.side === 'merchant' ? "bg-[#10B981]" : "bg-[#6366F1]",
                                        !isActive && !isDone && "opacity-40",
                                    )} />
                                </button>
                            )
                        })}
                    </div>

                    <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                        {/* Left: Text Content */}
                        <div className="flex flex-col h-full justify-center order-2 lg:order-1">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentStep}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest mb-4 bg-white border border-[#E5E7EB] shadow-sm">
                                        {stepData.side === 'merchant' ? (
                                            <><span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" /> Côté Marchand</>
                                        ) : (
                                            <><span className="w-1.5 h-1.5 rounded-full bg-[#6366F1]" /> Côté Client</>
                                        )}
                                    </div>
                                    <h3 className="text-2xl sm:text-3xl font-black text-[#111827] mb-4">
                                        {stepData.title}
                                    </h3>
                                    <p className="text-[#4B5563] text-lg leading-relaxed">
                                        {stepData.description}
                                    </p>
                                </motion.div>
                            </AnimatePresence>

                            {/* Controls */}
                            <div className="flex items-center gap-4 mt-10">
                                <button 
                                    onClick={handlePrev}
                                    className="w-12 h-12 rounded-full border border-[#D1D5DB] flex items-center justify-center text-[#374151] hover:bg-white hover:text-[#111827] hover:shadow-md transition-all"
                                    aria-label="Étape précédente"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button 
                                    onClick={handleNext}
                                    className="w-12 h-12 rounded-full bg-[#111827] flex items-center justify-center text-white hover:bg-[#374151] shadow-md transition-all"
                                    aria-label="Étape suivante"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Right: Mockup Carousel — pointer-events-none to prevent interaction distraction */}
                        <div className="hidden lg:flex relative w-full h-[450px] items-center justify-center rounded-[1.5rem] bg-[#EEF2FF] border border-[#E0E7FF] overflow-hidden order-1 lg:order-2 pointer-events-none select-none">
                            {/* Decorative background circle */}
                            <div className="absolute w-[300px] h-[300px] rounded-full bg-white/40 blur-3xl" />
                            
                            <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                                <motion.div
                                    key={currentStep}
                                    custom={direction}
                                    initial={{ x: direction > 0 ? 100 : -100, opacity: 0, scale: 0.95 }}
                                    animate={{ x: 0, opacity: 1, scale: 1 }}
                                    exit={{ x: direction < 0 ? 100 : -100, opacity: 0, scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    className="relative z-10 flex items-center justify-center w-full h-full"
                                >
                                    <CurrentMockup />
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
