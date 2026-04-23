import { Star } from "lucide-react"
import { Card } from "@/components/ui/Card"
import { ImagePlaceholder } from "@/components/sections/marketing/ImagePlaceholder"

type TestimonialsSectionProps = {
    id: string
}

type Testimonial = {
    name: string
    role: string
    quote: string
}

const TESTIMONIALS: Testimonial[] = [
    {
        name: "Hugo",
        role: "Food truck",
        quote:
            "Le midi, on avait une foule devant le comptoir. Maintenant c'est fluide, les clients attendent tranquillement.",
    },
    {
        name: "Dr. Martin",
        role: "Cabinet médical",
        quote:
            "La salle d'attente est beaucoup plus calme. Les patients sont rassurés, et l'équipe aussi.",
    },
    {
        name: "Nadia",
        role: "Responsable SAV",
        quote:
            "On a réduit les tensions à l'accueil et on perd beaucoup moins de clients en cours d'attente.",
    },
    {
        name: "Léo",
        role: "Festival",
        quote:
            "Pendant les pics, on garde une circulation fluide sur site. C'est le jour et la nuit.",
    },
]

export function TestimonialsSection({ id }: TestimonialsSectionProps) {
    return (
        <section id={id} className="mx-auto max-w-7xl bg-surface-base px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-primary">Témoignages</p>
                <h2 className="mt-3 text-3xl font-bold leading-tight text-text-primary sm:text-4xl font-[var(--font-poppins)]">
                    Pourquoi ils nous recommandent
                </h2>
                <p className="mt-4 text-base text-text-secondary sm:text-lg">
                    Même produit, contextes différents: restauration, santé, retail et événements.
                </p>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-12">
                <ImagePlaceholder
                    label="Photo client / équipe"
                    hint="Format portrait"
                    className="min-h-56 border-0 bg-feedback-success-bg lg:col-span-4 lg:min-h-full"
                />

                <div className="grid gap-4 lg:col-span-8 lg:grid-cols-2">
                    {TESTIMONIALS.map((item) => (
                        <Card key={item.name} className="rounded-3xl border-border-default bg-surface-card p-5">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-text-primary">{item.name}</p>
                                    <p className="text-xs text-text-secondary">{item.role}</p>
                                </div>
                                <div className="flex items-center gap-1 text-feedback-success" aria-label="5 étoiles">
                                    {Array.from({ length: 5 }).map((_, idx) => (
                                        <Star key={`${item.name}-${idx}`} size={14} fill="currentColor" />
                                    ))}
                                </div>
                            </div>

                            <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                                &quot;{item.quote}&quot;
                            </p>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
