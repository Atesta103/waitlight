import { Utensils, Stethoscope, ShoppingBag, FerrisWheel } from "lucide-react"
import { cn } from "@/lib/utils/cn"

type UseCase = {
    Icon: React.ComponentType<{ size?: number; className?: string; "aria-hidden"?: string }>
    sector: string
    title: string
    problem: string
    solution: string
    color: string
    bgColor: string
}

const USE_CASES: UseCase[] = [
    {
        Icon: Utensils,
        sector: "Restauration",
        title: "Food trucks, bistrots & fast food",
        problem: "Des clients amassés devant le comptoir, des bipeurs coûteux qui se perdent.",
        solution: "Le client passe commande, scanne, et s'assied. Son téléphone vibre quand son plat chaud est prêt.",
        color: "#F59E0B",
        bgColor: "#FFFBEB",
    },
    {
        Icon: Stethoscope,
        sector: "Santé",
        title: "Médecins, cliniques & urgences",
        problem: "Salles d'attente bondées, anxiogènes et propices à la propagation de virus.",
        solution: "Le patient s'enregistre, scanne et patiente dans sa voiture. Il reçoit une alerte quand le médecin est prêt.",
        color: "#10B981",
        bgColor: "#ECFDF5",
    },
    {
        Icon: ShoppingBag,
        sector: "Retail & Administrations",
        title: "SAV, préfectures & boutiques",
        problem: "Plus de 45 minutes d'attente debout. Perte d'opportunités d'achat.",
        solution: "Ticket digital → shopping libre → notification dès qu'un conseiller est disponible.",
        color: "#6366F1",
        bgColor: "#EEF2FF",
    },
    {
        Icon: FerrisWheel,
        sector: "Événementiel & Loisirs",
        title: "Parcs d'attractions & festivals",
        problem: "Files interminables pour les attractions phares ou les food-trucks du festival.",
        solution: "File virtuelle + mini-jeux intégrés (Snake, 2048) pour transformer l'attente en moment ludique.",
        color: "#EC4899",
        bgColor: "#FDF2F8",
    },
]

/**
 * UseCasesGrid — 4 use case cards by sector.
 * Pure Server Component.
 */
export function UseCasesGrid({ id }: { id?: string }) {
    return (
        <section
            id={id}
            className="py-24 md:py-32 bg-white"
            aria-labelledby="usecases-heading"
        >
            <div className="max-w-6xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EEF2FF] text-[#4338CA] text-xs font-semibold tracking-wide uppercase mb-4">
                        Cas d&apos;usage
                    </span>
                    <h2
                        id="usecases-heading"
                        className="text-4xl md:text-5xl font-black tracking-tighter text-[#111827]"
                    >
                        Fait pour votre secteur,
                        <br />
                        <span className="text-[#6366F1]">adapté à vos clients.</span>
                    </h2>
                    <p className="mt-4 text-lg text-[#374151] max-w-lg mx-auto">
                        Wait-Light s&apos;adapte à chaque contexte où l&apos;attente freine l&apos;expérience client.
                    </p>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {USE_CASES.map((uc) => (
                        <div
                            key={uc.sector}
                            className="rounded-3xl border border-[#E5E7EB] bg-white p-8 flex flex-col gap-5"
                        >
                            {/* Icon + sector label */}
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: uc.bgColor }}
                                >
                                    <uc.Icon size={22} style={{ color: uc.color }} aria-hidden="true" />
                                </div>
                                <span
                                    className="text-xs font-bold uppercase tracking-wider"
                                    style={{ color: uc.color }}
                                >
                                    {uc.sector}
                                </span>
                            </div>

                            {/* Title */}
                            <h3 className="text-lg font-black text-[#111827] tracking-tight leading-snug">
                                {uc.title}
                            </h3>

                            {/* Problem / Solution */}
                            <div className="flex flex-col gap-3">
                                <div className="flex items-start gap-2.5">
                                    <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-[#FEE2E2] flex items-center justify-center">
                                        <svg className="w-3 h-3 text-[#EF4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </span>
                                    <p className="text-sm text-[#374151] leading-relaxed">
                                        <span className="font-semibold text-[#111827]">Problème : </span>
                                        {uc.problem}
                                    </p>
                                </div>
                                <div className="flex items-start gap-2.5">
                                    <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-[#D1FAE5] flex items-center justify-center">
                                        <svg className="w-3 h-3 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </span>
                                    <p className="text-sm text-[#374151] leading-relaxed">
                                        <span className="font-semibold text-[#111827]">Solution : </span>
                                        {uc.solution}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
