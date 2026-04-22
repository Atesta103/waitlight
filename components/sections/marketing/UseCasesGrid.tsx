import Image from "next/image"
import { Utensils, Stethoscope, ShoppingBag, FerrisWheel } from "lucide-react"
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
        imageSrc: "/marketing/usecase-restaurant.png",
        bullets: [
            "Scan en 2 secondes apres la commande",
            "Rappel discret quand le ticket arrive en tete",
            "Equipe concentree sur la production, pas sur l'appel manuel",
        ],
        iconClass: "text-[#D97706]",
        iconBgClass: "bg-[#FFFBEB]",
        badgeClass: "text-[#D97706]",
    },
    {
        Icon: Stethoscope,
        id: "health",
        sector: "Santé",
        title: "Medecins, cliniques et centres de soins",
        subtitle: "Rendre l'attente plus sereine pour les patients et l'accueil.",
        problem: "Salles d'attente bondées, anxiogènes et propices à la propagation de virus.",
        solution: "Le patient s'enregistre, suit sa position et recoit un rappel quand le praticien est pret.",
        valueProp: "Vous lissez les flux d'arrivee et reduisez la sensation d'attente subie.",
        imageSrc: "/marketing/usecase-health.png",
        bullets: [
            "Moins de densite dans les zones d'attente",
            "Information claire sur l'avancement de la file",
            "Experience plus calme des heures de pointe",
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
        subtitle: "Eviter l'abandon de file et garder les clients actifs pendant l'attente.",
        problem: "Plus de 45 minutes d'attente debout. Perte d'opportunités d'achat.",
        solution: "Ticket digital → shopping libre → notification dès qu'un conseiller est disponible.",
        valueProp: "Vous captez plus de passages finalises et limitez la frustration en magasin.",
        imageSrc: "/marketing/usecase-retail.png",
        bullets: [
            "Retour en file au bon moment sans refaire la queue",
            "Visibilite des pics par tranche horaire",
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
        subtitle: "Maintenir des flux fluides sur site meme en forte affluence.",
        problem: "Files interminables pour les attractions phares ou les food-trucks du festival.",
        solution: "File virtuelle + mini-jeux intégrés (Snake, 2048) pour transformer l'attente en moment ludique.",
        valueProp: "Vous augmentez le confort visiteur tout en preservant la circulation globale.",
        imageSrc: "/marketing/usecase-event.png",
        bullets: [
            "Files virtuelles sur plusieurs stands en parallele",
            "Rappels envoyes au bon timing pour limiter les attroupements",
            "Attente percue plus courte grace a une meilleure information",
        ],
        iconClass: "text-[#DB2777]",
        iconBgClass: "bg-[#FDF2F8]",
        badgeClass: "text-[#DB2777]",
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

                <div className="space-y-8">
                    {USE_CASES.map((uc, index) => (
                        <article
                            key={uc.id}
                            id={uc.id}
                            className="rounded-3xl border border-[#E5E7EB] bg-white p-5 sm:p-8"
                        >
                            <div
                                className={cn(
                                    "grid gap-6 lg:gap-10",
                                    index % 2 === 0 ? "lg:grid-cols-[1fr_1.05fr]" : "lg:grid-cols-[1.05fr_1fr]",
                                )}
                            >
                                <div className={cn(index % 2 !== 0 && "lg:order-2")}>
                                    <div className="overflow-hidden rounded-2xl border border-[#E5E7EB]">
                                        <Image
                                            src={uc.imageSrc}
                                            alt={`Illustration humaine pour ${uc.sector}`}
                                            width={720}
                                            height={420}
                                            className="h-auto w-full"
                                        />
                                    </div>
                                </div>

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
