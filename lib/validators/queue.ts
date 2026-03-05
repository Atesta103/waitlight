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
