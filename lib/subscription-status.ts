/**
 * Subscription status helpers shared by server and client code.
 * Keep this file free of secret-dependent imports.
 */

/** Subscription statuses that grant dashboard access. */
export const ACTIVE_STATUSES = ["active", "trialing"] as const
export type ActiveStatus = (typeof ACTIVE_STATUSES)[number]

export function isActiveStatus(status: string): status is ActiveStatus {
    return ACTIVE_STATUSES.includes(status as ActiveStatus)
}

/** Human-readable French labels for each Stripe subscription status. */
export const STATUS_LABELS: Record<string, string> = {
    active: "Actif",
    trialing: "Période d'essai",
    past_due: "Paiement en retard",
    canceled: "Annulé",
    incomplete: "Incomplet",
    incomplete_expired: "Expiré",
    unpaid: "Impayé",
}
