"use client"

import Link from "next/link"
import {
    BarChart2,
    BellRing,
    CalendarClock,
    CheckCircle2,
    Palette,
    Play,
    QrCode,
    Timer,
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils/cn"

type ClosedQueueGuidanceProps = {
    customerLabelPlural: string
    onOpenQueue: () => void
    isOpening?: boolean
    className?: string
}

const ACTIONS = [
    {
        title: "Afficher le QR code",
        description: "Ouvrez l'écran plein format dans un nouvel onglet.",
        href: "/dashboard/qr-display",
        icon: QrCode,
        target: "_blank",
    },
    {
        title: "Définir les horaires",
        description: "Préparez les jours et plages d'ouverture.",
        href: "/dashboard/settings#schedule",
        icon: CalendarClock,
        target: undefined,
    },
    {
        title: "Temps d'attente",
        description: "Ajustez l'estimation affichée aux clients.",
        href: "/dashboard/settings#waittime",
        icon: Timer,
        target: undefined,
    },
] as const

const CHECKLIST = [
    "Vérifier le logo et les couleurs visibles par les clients",
    "Ajuster la capacité et le message affiché au scan",
    "Configurer les notifications si vous les utilisez",
    "Ouvrir la file quand l'équipe est prête à recevoir du monde",
] as const

const SETTINGS_LINKS = [
    {
        title: "Identité client",
        description: "Nom, logo, couleur et thème de l'expérience.",
        href: "/dashboard/settings#identity",
        icon: Palette,
    },
    {
        title: "Notifications",
        description: "Canaux, son et alerte avant le passage.",
        href: "/dashboard/settings#notification-prefs",
        icon: BellRing,
    },
    {
        title: "Analytiques",
        description: "Suivre les volumes dès les premiers passages.",
        href: "/analytics",
        icon: BarChart2,
    },
] as const

function ClosedQueueGuidance({
    customerLabelPlural,
    onOpenQueue,
    isOpening = false,
    className,
}: ClosedQueueGuidanceProps) {
    return (
        <section
            aria-labelledby="closed-queue-title"
            className={cn(
                "rounded-xl border border-border-default bg-surface-card p-4 sm:p-6",
                className,
            )}
        >
            <div className="grid items-start gap-5 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="flex flex-col gap-5">
                    <div className="rounded-lg border border-border-default bg-surface-base p-4 sm:p-5">
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-secondary">
                            File en pause
                        </p>
                        <h2
                            id="closed-queue-title"
                            className="text-xl font-semibold text-text-primary"
                        >
                            Votre file est fermée
                        </h2>
                        <p className="mt-2 max-w-xl text-sm text-text-secondary">
                            Les {customerLabelPlural} ne peuvent pas rejoindre
                            pour l&apos;instant. Ouvrez la file quand votre équipe
                            est prête à recevoir de nouveaux tickets.
                        </p>
                        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                            <Button
                                type="button"
                                onClick={onOpenQueue}
                                isLoading={isOpening}
                                className="sm:w-fit"
                            >
                                <Play size={16} aria-hidden="true" />
                                Ouvrir la file
                            </Button>
                            <p className="text-xs text-text-secondary">
                                Vous pourrez la refermer à tout moment depuis
                                l&apos;en-tête.
                            </p>
                        </div>
                    </div>

                    <div className="grid items-start gap-3 md:grid-cols-3">
                        {ACTIONS.map((action) => {
                            const Icon = action.icon
                            return (
                                <Link
                                    key={action.href}
                                    href={action.href}
                                    target={action.target}
                                    rel={action.target ? "noopener noreferrer" : undefined}
                                    className="group rounded-lg border border-border-default bg-surface-base p-3 transition-colors hover:border-border-focus focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                                >
                                    <div className="mb-2.5 flex h-8 w-8 items-center justify-center rounded-lg bg-surface-card text-brand-primary">
                                        <Icon size={17} aria-hidden="true" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-text-primary">
                                        {action.title}
                                    </h3>
                                    <p className="mt-1 text-sm text-text-secondary">
                                        {action.description}
                                    </p>
                                </Link>
                            )
                        })}
                    </div>
                </div>

                <aside className="flex flex-col gap-4 rounded-lg border border-border-default bg-surface-base p-4">
                    <div>
                        <div className="mb-3 flex items-center gap-2">
                            <CheckCircle2
                                size={16}
                                className="text-feedback-success"
                                aria-hidden="true"
                            />
                            <h3 className="text-sm font-semibold text-text-primary">
                                Avant d&apos;ouvrir
                            </h3>
                        </div>
                        <ul className="space-y-2">
                            {CHECKLIST.map((item) => (
                                <li
                                    key={item}
                                    className="flex gap-2 text-sm text-text-secondary"
                                >
                                    <CheckCircle2
                                        size={15}
                                        className="mt-0.5 shrink-0 text-feedback-success"
                                        aria-hidden="true"
                                    />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="border-t border-border-default pt-4">
                        <h3 className="mb-3 text-sm font-semibold text-text-primary">
                            Raccourcis utiles
                        </h3>
                        <div className="grid gap-2">
                            {SETTINGS_LINKS.map((link) => {
                                const Icon = link.icon
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="group flex gap-3 rounded-lg border border-border-default bg-surface-card p-2.5 transition-colors hover:border-border-focus focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                                    >
                                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-base text-brand-primary">
                                            <Icon size={15} aria-hidden="true" />
                                        </span>
                                        <span>
                                            <span className="block text-sm font-medium text-text-primary">
                                                {link.title}
                                            </span>
                                            <span className="mt-0.5 block text-xs text-text-secondary">
                                                {link.description}
                                            </span>
                                        </span>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                </aside>
            </div>
        </section>
    )
}

export { ClosedQueueGuidance, type ClosedQueueGuidanceProps }
