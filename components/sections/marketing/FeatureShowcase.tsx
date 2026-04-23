import { BadgeCheck, BellRing, QrCode, TimerReset } from "lucide-react"
import { Card } from "@/components/ui/Card"
import { ImagePlaceholder } from "@/components/sections/marketing/ImagePlaceholder"

type FeatureShowcaseProps = {
    id: string
}

const FEATURES = [
    {
        title: "Une arrivée sans stress",
        description:
            "Le client scanne, prend sa place, puis attend où il veut sans rester collé au comptoir.",
        icon: QrCode,
    },
    {
        title: "Des clients rassurés",
        description:
            "Chaque personne voit où elle en est, ce qui évite les allers-retours et les questions répétées.",
        icon: TimerReset,
    },
    {
        title: "Moins de pression pour l'équipe",
        description:
            "Vous appelez les prochains clients au bon moment, sans attroupement ni confusion.",
        icon: BellRing,
    },
    {
        title: "Une image plus pro",
        description:
            "Vous offrez une expérience moderne qui donne envie de revenir et de recommander votre établissement.",
        icon: BadgeCheck,
    },
]

export function FeatureShowcase({ id }: FeatureShowcaseProps) {
    return (
        <section id={id} className="mx-auto max-w-7xl bg-surface-base px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-primary">
                    Expérience client
                </p>
                <h2 className="mt-3 text-3xl font-bold leading-tight text-text-primary sm:text-4xl font-[var(--font-poppins)]">
                    Une attente modernisée sans changer vos habitudes d&apos;équipe.
                </h2>
                <p className="mt-4 text-base text-text-secondary sm:text-lg">
                    Wait-Light s&apos;adapte à vos flux actuels et améliore la perception du service dès les premiers jours.
                </p>
            </div>

            <div className="mt-10 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                <Card className="rounded-3xl border-border-default bg-surface-card p-5 sm:p-6">
                    <ImagePlaceholder
                        label="Visuel principal expérience client"
                        hint="Ajoutez une photo d'un accueil fluide"
                        className="min-h-56 border-0 bg-feedback-success-bg"
                    />

                    <div className="mt-5 rounded-2xl border border-border-default bg-surface-base p-4">
                        <p className="text-sm font-semibold text-text-primary">Ce que voient vos clients</p>
                        <ul className="mt-3 space-y-2 text-sm text-text-secondary">
                            <li>• Position visible en direct sur mobile</li>
                            <li>• Rappel clair quand leur tour approche</li>
                            <li>• Plus besoin d&apos;attendre debout devant le comptoir</li>
                        </ul>
                    </div>
                </Card>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                    {FEATURES.map((feature) => {
                        const Icon = feature.icon
                        return (
                            <Card key={feature.title} className="rounded-3xl border-border-default bg-surface-card p-5">
                                <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-feedback-success-bg text-feedback-success">
                                    <Icon size={20} aria-hidden="true" />
                                </div>
                                <h3 className="mt-4 text-xl font-semibold text-text-primary">
                                    {feature.title}
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed text-text-secondary sm:text-base">
                                    {feature.description}
                                </p>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
