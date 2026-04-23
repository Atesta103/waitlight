import { ArrowRight, Clock4, Smartphone } from "lucide-react"
import { Card } from "@/components/ui/Card"

type ProblemSolutionSectionProps = {
    id: string
}

export function ProblemSolutionSection({ id }: ProblemSolutionSectionProps) {
    return (
        <section id={id} className="border-y border-border-default bg-surface-base">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
                <div className="mx-auto max-w-3xl text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-primary">
                        Avant / Après
                    </p>
                    <h2 className="mt-3 text-3xl font-bold leading-tight text-text-primary sm:text-4xl font-[var(--font-poppins)]">
                        Remplacez la file visible par un parcours client clair.
                    </h2>
                    <p className="mt-4 text-base text-text-secondary sm:text-lg">
                        Le même volume de visiteurs, mais une ambiance plus calme et un service plus lisible.
                    </p>
                </div>

                <div className="mt-10 grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch lg:gap-6">
                    <Card className="rounded-3xl border-status-cancelled/35 bg-feedback-error-bg/35 p-6 sm:p-7">
                        <p className="text-xs font-semibold uppercase tracking-[0.11em] text-feedback-error">
                            Sans Wait-Light
                        </p>
                        <h3 className="mt-3 text-2xl font-semibold text-text-primary">
                            L&apos;attente devient vite une source de friction.
                        </h3>

                        <ul className="mt-5 space-y-3 text-sm text-text-secondary sm:text-base">
                            <li className="flex gap-2">
                                <Clock4 size={18} className="mt-0.5 shrink-0 text-feedback-error" aria-hidden="true" />
                                Les clients restent bloqués devant l&apos;entrée et saturent l&apos;espace.
                            </li>
                            <li className="flex gap-2">
                                <Clock4 size={18} className="mt-0.5 shrink-0 text-feedback-error" aria-hidden="true" />
                                L&apos;équipe passe du temps à répondre aux mêmes questions.
                            </li>
                            <li className="flex gap-2">
                                <Clock4 size={18} className="mt-0.5 shrink-0 text-feedback-error" aria-hidden="true" />
                                L&apos;attente perçue grimpe, même si le service avance.
                            </li>
                        </ul>
                    </Card>

                    <div className="hidden items-center justify-center lg:flex" aria-hidden="true">
                        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-border-default bg-surface-card text-brand-primary shadow-sm">
                            <ArrowRight size={22} />
                        </div>
                    </div>

                    <Card className="rounded-3xl border-feedback-success/35 bg-feedback-success-bg/45 p-6 sm:p-7">
                        <p className="text-xs font-semibold uppercase tracking-[0.11em] text-feedback-success">
                            Avec Wait-Light
                        </p>
                        <h3 className="mt-3 text-2xl font-semibold text-text-primary">
                            Le parcours devient fluide, même en heure de pointe.
                        </h3>

                        <ul className="mt-5 space-y-3 text-sm text-text-secondary sm:text-base">
                            <li className="flex gap-2">
                                <Smartphone size={18} className="mt-0.5 shrink-0 text-feedback-success" aria-hidden="true" />
                                Le client scanne, prend sa place, puis attend où il veut.
                            </li>
                            <li className="flex gap-2">
                                <Smartphone size={18} className="mt-0.5 shrink-0 text-feedback-success" aria-hidden="true" />
                                Votre équipe appelle les prochains au bon rythme, sans attroupement.
                            </li>
                            <li className="flex gap-2">
                                <Smartphone size={18} className="mt-0.5 shrink-0 text-feedback-success" aria-hidden="true" />
                                La progression est claire et rassurante pour tout le monde.
                            </li>
                        </ul>
                    </Card>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <Card className="rounded-2xl border-border-default bg-surface-card p-4">
                        <p className="text-xs uppercase tracking-[0.11em] text-text-secondary">Perception client</p>
                        <p className="mt-2 text-lg font-semibold text-text-primary">Attente mieux acceptée</p>
                    </Card>
                    <Card className="rounded-2xl border-border-default bg-surface-card p-4">
                        <p className="text-xs uppercase tracking-[0.11em] text-text-secondary">Côté équipe</p>
                        <p className="mt-2 text-lg font-semibold text-text-primary">Moins d&apos;interruptions</p>
                    </Card>
                    <Card className="rounded-2xl border-border-default bg-surface-card p-4">
                        <p className="text-xs uppercase tracking-[0.11em] text-text-secondary">Résultat global</p>
                        <p className="mt-2 text-lg font-semibold text-text-primary">Accueil plus premium</p>
                    </Card>
                </div>
            </div>
        </section>
    )
}
