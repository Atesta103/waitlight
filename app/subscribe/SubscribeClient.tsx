"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"
import { Check, Loader2, AlertCircle, Info, CreditCard } from "lucide-react"
import {
    createCheckoutSessionAction,
    createPortalSessionAction,
    type SubscriptionRow,
} from "@/lib/actions/billing"

type Props = {
    error: "payment_failed" | "cancelled" | null
    subscription: SubscriptionRow | null
}

const FEATURES = [
    "File d'attente en temps réel",
    "QR code rotatif sécurisé",
    "Analytiques et prévisions de flux",
    "Notifications clients",
    "Accès multi-appareils",
    "Support prioritaire",
]

export function SubscribeClient({ error, subscription }: Props) {
    const router = useRouter()
    const prefersReduced = useReducedMotion()
    const [loading, setLoading] = useState(false)
    const [actionError, setActionError] = useState<string | null>(null)

    const isPastDue = subscription?.status === "past_due"

    async function handleCheckout() {
        setLoading(true)
        setActionError(null)
        const result = await createCheckoutSessionAction()
        if ("error" in result) {
            setActionError(result.error)
            setLoading(false)
            return
        }
        router.push(result.data.url)
    }

    async function handlePortal() {
        setLoading(true)
        setActionError(null)
        const result = await createPortalSessionAction()
        if ("error" in result) {
            setActionError(result.error)
            setLoading(false)
            return
        }
        router.push(result.data.url)
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-surface-base px-4 py-12">
            <motion.div
                initial={prefersReduced ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-md"
            >
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-text-primary">
                        Wait-Light
                    </h1>
                    <p className="mt-2 text-text-secondary">
                        Gérez votre file d&apos;attente sans effort
                    </p>
                </div>

                {/* Error / warning banners */}
                {error === "payment_failed" && (
                    <div
                        role="alert"
                        className="mb-4 flex items-start gap-3 rounded-lg border border-feedback-error/30 bg-feedback-error/10 px-4 py-3 text-sm text-feedback-error"
                    >
                        <AlertCircle
                            size={16}
                            className="mt-0.5 shrink-0"
                            aria-hidden="true"
                        />
                        <span>
                            Votre paiement a échoué. Réessayez avec une autre
                            carte.
                        </span>
                    </div>
                )}

                {error === "cancelled" && (
                    <div
                        role="status"
                        className="mb-4 flex items-start gap-3 rounded-lg border border-border-default bg-surface-card px-4 py-3 text-sm text-text-secondary"
                    >
                        <Info
                            size={16}
                            className="mt-0.5 shrink-0"
                            aria-hidden="true"
                        />
                        <span>
                            Vous avez annulé le paiement. Votre essai gratuit
                            de 14 jours vous attend dès que vous êtes prêt.
                        </span>
                    </div>
                )}

                {isPastDue && (
                    <div
                        role="alert"
                        className="mb-4 flex items-start gap-3 rounded-lg border border-status-called/30 bg-status-called/10 px-4 py-3 text-sm text-status-called"
                    >
                        <AlertCircle
                            size={16}
                            className="mt-0.5 shrink-0"
                            aria-hidden="true"
                        />
                        <span>
                            Votre paiement a échoué. Mettez à jour votre mode
                            de paiement pour réactiver l&apos;accès.
                        </span>
                    </div>
                )}

                {actionError && (
                    <div
                        role="alert"
                        className="mb-4 flex items-start gap-3 rounded-lg border border-feedback-error/30 bg-feedback-error/10 px-4 py-3 text-sm text-feedback-error"
                    >
                        <AlertCircle
                            size={16}
                            className="mt-0.5 shrink-0"
                            aria-hidden="true"
                        />
                        <span>{actionError}</span>
                    </div>
                )}

                {/* Pricing card */}
                <div className="rounded-2xl border border-border-default bg-surface-card p-8 shadow-sm">
                    {/* Trial badge */}
                    <div className="mb-6 inline-flex items-center rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-medium text-brand-primary">
                        14 jours d&apos;essai gratuit
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                        <div className="flex items-end gap-1">
                            <span className="text-4xl font-bold text-text-primary">
                                29&nbsp;€
                            </span>
                            <span className="mb-1 text-text-secondary">
                                / mois
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-text-secondary">
                            Sans engagement — annulez à tout moment
                        </p>
                    </div>

                    {/* Features list */}
                    <ul className="mb-8 space-y-2.5" aria-label="Fonctionnalités incluses">
                        {FEATURES.map((feature) => (
                            <li
                                key={feature}
                                className="flex items-center gap-2.5 text-sm text-text-primary"
                            >
                                <Check
                                    size={15}
                                    className="shrink-0 text-feedback-success"
                                    aria-hidden="true"
                                />
                                {feature}
                            </li>
                        ))}
                    </ul>

                    {/* CTA */}
                    {isPastDue ? (
                        <button
                            onClick={handlePortal}
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus disabled:opacity-60"
                            aria-busy={loading}
                        >
                            {loading ? (
                                <Loader2
                                    size={16}
                                    className="animate-spin"
                                    aria-hidden="true"
                                />
                            ) : (
                                <CreditCard size={16} aria-hidden="true" />
                            )}
                            Mettre à jour le paiement
                        </button>
                    ) : (
                        <button
                            onClick={handleCheckout}
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus disabled:opacity-60"
                            aria-busy={loading}
                        >
                            {loading ? (
                                <Loader2
                                    size={16}
                                    className="animate-spin"
                                    aria-hidden="true"
                                />
                            ) : null}
                            Commencer l&apos;essai gratuit de 14 jours
                        </button>
                    )}

                    <p className="mt-3 text-center text-xs text-text-secondary">
                        Carte bancaire requise. Aucun débit pendant l&apos;essai.
                    </p>
                </div>

                {/* Footer */}
                <p className="mt-6 text-center text-xs text-text-secondary">
                    Paiement sécurisé par{" "}
                    <span className="font-medium text-text-primary">Stripe</span>
                </p>
            </motion.div>
        </div>
    )
}
