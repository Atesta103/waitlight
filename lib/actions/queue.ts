"use server"

import { createClient } from "@/lib/supabase/server"
import {
    TicketIdSchema,
    ToggleQueueSchema,
    type TicketIdInput,
    type ToggleQueueInput,
} from "@/lib/validators/queue"
import type { Database } from "@/types/database"

export type QueueItem = {
    id: string
    merchant_id: string
    customer_name: string
    status: "waiting" | "called" | "done" | "cancelled"
    joined_at: string
    called_at: string | null
    done_at: string | null
}

// ─────────────────────────────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch active queue items (waiting + called) for the authenticated merchant.
 * Only fetches active tickets to keep the dashboard snappy.
 */
export async function getQueueAction(): Promise<
    { data: QueueItem[] } | { error: string }
> {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Session expirée. Veuillez vous reconnecter." }
    }

    const { data, error } = await supabase
        .from("queue_items")
        .select(
            "id, merchant_id, customer_name, status, joined_at, called_at, done_at",
        )
        .eq("merchant_id", user.id)
        .in("status", ["waiting", "called"])
        .order("joined_at", { ascending: true })

    if (error) {
        return { error: "Impossible de charger la file d'attente." }
    }

    return { data: data ?? [] }
}

// ─────────────────────────────────────────────────────────────────────────────
// Mutations — each validates ownership before writing
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Mark a ticket as `called`.
 * Verifies merchant ownership before updating.
 */
export async function callTicketAction(
    input: TicketIdInput,
): Promise<{ data: null } | { error: string }> {
    const parsed = TicketIdSchema.safeParse(input)
    if (!parsed.success) {
        return { error: parsed.error.issues[0]?.message ?? "Données invalides." }
    }

    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Session expirée. Veuillez vous reconnecter." }
    }

    const { error } = await supabase
        .from("queue_items")
        .update({
            status: "called",
            called_at: new Date().toISOString(),
        })
        .eq("id", parsed.data.id)
        .eq("merchant_id", user.id) // ownership check — RLS double-guards this
        .eq("status", "waiting") // idempotency guard

    if (error) {
        return { error: "Impossible d'appeler ce client. Veuillez réessayer." }
    }

    return { data: null }
}

/**
 * Mark a ticket as `done`.
 * Verifies merchant ownership before updating.
 */
export async function completeTicketAction(
    input: TicketIdInput,
): Promise<{ data: null } | { error: string }> {
    const parsed = TicketIdSchema.safeParse(input)
    if (!parsed.success) {
        return { error: parsed.error.issues[0]?.message ?? "Données invalides." }
    }

    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Session expirée. Veuillez vous reconnecter." }
    }

    const { error } = await supabase
        .from("queue_items")
        .update({
            status: "done",
            done_at: new Date().toISOString(),
        })
        .eq("id", parsed.data.id)
        .eq("merchant_id", user.id) // ownership check
        .eq("status", "called") // only called tickets can be completed

    if (error) {
        return {
            error: "Impossible de terminer ce ticket. Veuillez réessayer.",
        }
    }

    return { data: null }
}

/**
 * Mark a ticket as `cancelled`.
 * Works from both `waiting` and `called` states.
 * Verifies merchant ownership before updating.
 */
export async function cancelTicketAction(
    input: TicketIdInput,
): Promise<{ data: null } | { error: string }> {
    const parsed = TicketIdSchema.safeParse(input)
    if (!parsed.success) {
        return { error: parsed.error.issues[0]?.message ?? "Données invalides." }
    }

    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Session expirée. Veuillez vous reconnecter." }
    }

    const { error } = await supabase
        .from("queue_items")
        .update({ status: "cancelled" })
        .eq("id", parsed.data.id)
        .eq("merchant_id", user.id) // ownership check
        .in("status", ["waiting", "called"]) // only active tickets

    if (error) {
        return {
            error: "Impossible d'annuler ce ticket. Veuillez réessayer.",
        }
    }

    return { data: null }
}

/**
 * Toggle the queue open/closed state for the authenticated merchant.
 */
export async function toggleQueueOpenAction(
    input: ToggleQueueInput,
): Promise<{ data: null } | { error: string }> {
    const parsed = ToggleQueueSchema.safeParse(input)
    if (!parsed.success) {
        return { error: "Données invalides." }
    }

    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Session expirée. Veuillez vous reconnecter." }
    }

    const { error } = await supabase
        .from("merchants")
        .update({ is_open: parsed.data.is_open })
        .eq("id", user.id)

    if (error) {
        return {
            error: "Impossible de modifier l'état de la file. Veuillez réessayer.",
        }
    }

    return { data: null }
}
