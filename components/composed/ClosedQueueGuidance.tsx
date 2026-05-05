"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import {
    BarChart2,
    CheckCircle2,
    Palette,
    Play,
    QrCode,
    Sparkles,
    UserPlus,
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils/cn"

type ClosedQueueGuidanceProps = {
    customerLabelPlural: string
    onOpenQueue: () => void
    isOpening?: boolean
    manualTicketAction: ReactNode
    className?: string
}

const ACTIONS = [
    {
        title: "Afficher le QR code",
        description: "Préparez l'écran que vos clients scanneront à l'accueil.",
        href: "/dashboard/qr-display",
        icon: QrCode,
    },
    {
        title: "Personnaliser l'expérience",
        description: "Logo, couleurs, messages et capacité de votre file.",
        href: "/dashboard/settings",
        icon: Palette,
    },
    {
        title: "Consulter les analytiques",
        description: "Suivez les volumes, temps d'attente et pics d'activité.",
        href: "/analytics",
        icon: BarChart2,
    },
] as const

const CHECKLIST = [
    "Ouvrir la file quand vous êtes prêt à recevoir du monde",
    "Afficher le QR code sur une tablette ou une affiche",
    "Personnaliser les couleurs et le message client",
    "Suivre les premiers passages dans les analytiques",
] as const

function ClosedQueueGuidance({
    customerLabelPlural,
    onOpenQueue,
    isOpening = false,
    manualTicketAction,
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
            <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="flex flex-col gap-5">
                    <div className="rounded-lg border border-border-default bg-surface-base p-4 sm:p-5">
                        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary text-text-inverse">
                            <Play size={18} aria-hidden="true" />
                        </div>
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
                            est prête, puis affichez le QR code à l&apos;accueil.
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

                    <div className="grid gap-3 md:grid-cols-3">
                        {ACTIONS.map((action) => {
                            const Icon = action.icon
                            return (
                                <Link
                                    key={action.href}
                                    href={action.href}
                                    className="group rounded-lg border border-border-default bg-surface-base p-4 transition-colors hover:border-border-focus focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                                >
                                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-surface-card text-brand-primary">
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

                <aside className="flex flex-col gap-4 rounded-lg border border-border-default bg-surface-base p-4 sm:p-5">
                    <div>
                        <div className="mb-3 flex items-center gap-2">
                            <Sparkles
                                size={16}
                                className="text-brand-primary"
                                aria-hidden="true"
                            />
                            <h3 className="text-sm font-semibold text-text-primary">
                                Avant le premier scan
                            </h3>
                        </div>
                        <ul className="space-y-2.5">
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
                        <div className="mb-3 flex items-center gap-2">
                            <UserPlus
                                size={16}
                                className="text-brand-primary"
                                aria-hidden="true"
                            />
                            <h3 className="text-sm font-semibold text-text-primary">
                                Besoin d&apos;ajouter quelqu&apos;un ?
                            </h3>
                        </div>
                        <p className="mb-3 text-sm text-text-secondary">
                            Ajoutez un ticket manuel si un client ne peut pas
                            scanner le QR code.
                        </p>
                        {manualTicketAction}
                    </div>
                </aside>
            </div>
        </section>
    )
}

export { ClosedQueueGuidance, type ClosedQueueGuidanceProps }
