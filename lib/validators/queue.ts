/**
 * @module validators/queue
 * @category Validators
 *
 * Zod schemas for queue mutation inputs.
 */
import { z } from "zod"

/**
 * Valid ticket status values for state-machine transitions.
 */
export const TicketStatusSchema = z.enum([
    "waiting",
    "called",
    "done",
    "cancelled",
])

export type TicketStatus = z.infer<typeof TicketStatusSchema>

/**
 * Schema for a single ticket ID — used by call, complete, cancel actions.
 */
export const TicketIdSchema = z.object({
    id: z.string().uuid("Identifiant de ticket invalide."),
})

export type TicketIdInput = z.infer<typeof TicketIdSchema>

/**
 * Schema for toggling the queue open/closed state.
 */
export const ToggleQueueSchema = z.object({
    is_open: z.boolean(),
})

export type ToggleQueueInput = z.infer<typeof ToggleQueueSchema>

/**
 * Schema for a customer joining the queue via QR code.
 */
export const JoinQueueSchema = z.object({
    customerName: z
        .string()
        .trim()
        .min(2, "Le prénom doit contenir au moins 2 caractères.")
        .max(50, "Le prénom ne peut pas dépasser 50 caractères."),
    consent: z.literal(true, {
        message: "Vous devez accepter les conditions pour continuer.",
    }),
    token: z.string().min(1, "Token QR manquant."),
    slug: z.string().min(1, "Slug manquant."),
})

export type JoinQueueInput = z.infer<typeof JoinQueueSchema>
