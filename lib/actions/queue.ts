/**
 * @module actions/queue
 * @category Actions
 *
 * Server Actions for merchant queue management.
 * All mutations verify merchant ownership before writing (`merchant_id = auth.uid()`).
 * RLS provides a second enforcement layer in the database.
 */
"use server"

import { createClient } from "@/lib/supabase/server"
import {
    TicketIdSchema,
    ToggleQueueSchema,
    JoinQueueSchema,
    type TicketIdInput,
    type ToggleQueueInput,
    type JoinQueueInput,
} from "@/lib/validators/queue"
import type { Database } from "@/types/database"

/**
 * A live ticket in the queue (only `waiting` and `called` statuses are returned
 * by {@link getQueueAction}; `done` and `cancelled` are filtered out).
 */
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
 * Fetch the active queue (status `waiting` and `called`) for the authenticated merchant.
 *
 * Results are ordered by `joined_at ASC` (first joined, first shown).
 * Only active tickets are fetched to keep the dashboard performant.
 *
 * @returns Empty array when the queue is empty.
 *
 * **Errors:**
 * | `error` string | Cause |
 * |---|---|
 * | `"Session expirée. Veuillez vous reconnecter."` | No authenticated user |
 * | `"Impossible de charger la file d'attente."` | Supabase query failed |
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
 * Transition a ticket from `waiting` → `called`.
 *
 * Sets `called_at` to the current UTC timestamp.
 * Silently no-ops if the ticket is already in `called`, `done`, or `cancelled` state
 * (idempotency guard via `.eq("status", "waiting")`).
 *
 * @param input - Validated by {@link TicketIdSchema}.
 *
 * **Errors:**
 * | `error` string | Cause |
 * |---|---|
 * | `"Données invalides."` or Zod message | Invalid UUID format |
 * | `"Session expirée. Veuillez vous reconnecter."` | No authenticated user |
 * | `"Impossible d'appeler ce client. Veuillez réessayer."` | Supabase update failed or ticket not in `waiting` |
 */
export async function callTicketAction(
    input: TicketIdInput,
): Promise<{ data: null } | { error: string }> {
    const parsed = TicketIdSchema.safeParse(input)
    if (!parsed.success) {
        return {
            error: parsed.error.issues[0]?.message ?? "Données invalides.",
        }
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
 * Transition a ticket from `called` → `done`.
 *
 * Sets `done_at` to the current UTC timestamp, which triggers the Postgres
 * function that recalculates `merchants.avg_wait_time`.
 * Only tickets in `called` state can be completed — use {@link callTicketAction} first.
 *
 * @param input - Validated by {@link TicketIdSchema}.
 *
 * **Errors:**
 * | `error` string | Cause |
 * |---|---|
 * | `"Données invalides."` or Zod message | Invalid UUID format |
 * | `"Session expirée. Veuillez vous reconnecter."` | No authenticated user |
 * | `"Impossible de terminer ce ticket. Veuillez réessayer."` | Supabase update failed or ticket not in `called` |
 */
export async function completeTicketAction(
    input: TicketIdInput,
): Promise<{ data: null } | { error: string }> {
    const parsed = TicketIdSchema.safeParse(input)
    if (!parsed.success) {
        return {
            error: parsed.error.issues[0]?.message ?? "Données invalides.",
        }
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
 * Transition a ticket to `cancelled` from either `waiting` or `called`.
 *
 * Silently no-ops if the ticket is already `done` or `cancelled`.
 *
 * @param input - Validated by {@link TicketIdSchema}.
 *
 * **Errors:**
 * | `error` string | Cause |
 * |---|---|
 * | `"Données invalides."` or Zod message | Invalid UUID format |
 * | `"Session expirée. Veuillez vous reconnecter."` | No authenticated user |
 * | `"Impossible d'annuler ce ticket. Veuillez réessayer."` | Supabase update failed |
 */
export async function cancelTicketAction(
    input: TicketIdInput,
): Promise<{ data: null } | { error: string }> {
    const parsed = TicketIdSchema.safeParse(input)
    if (!parsed.success) {
        return {
            error: parsed.error.issues[0]?.message ?? "Données invalides.",
        }
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
 * Set the queue open/closed state for the authenticated merchant.
 *
 * The `merchants.is_open` column is updated immediately. Customer-facing
 * pages (`/[slug]`) read this value to show a "Queue closed" banner.
 *
 * @param input - Validated by {@link ToggleQueueSchema}.
 *
 * **Errors:**
 * | `error` string | Cause |
 * |---|---|
 * | `"Données invalides."` | Non-boolean value |
 * | `"Session expirée. Veuillez vous reconnecter."` | No authenticated user |
 * | `"Impossible de modifier l'état de la file. Veuillez réessayer."` | Supabase update failed |
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

/**
 * Join the queue as an anonymous customer.
 * Validates the QR token, checks business state, and inserts a ticket.
 * No authentication required — customers are anonymous.
 */
export async function joinQueueAction(
    input: JoinQueueInput,
): Promise<{ data: { ticketId: string; merchantId: string } } | { error: string }> {
    const parsed = JoinQueueSchema.safeParse(input)
    if (!parsed.success) {
        return { error: parsed.error.issues[0]?.message ?? "Données invalides." }
    }

    const { customerName, token, slug } = parsed.data
    const supabase = await createClient()

    // ── 1. Look up merchant by slug ──────────────────────────────────────────
    const { data: merchant, error: merchantError } = await supabase
        .from("merchants")
        .select("id, is_open")
        .eq("slug", slug)
        .single()

    if (merchantError || !merchant) {
        return { error: "Commerce introuvable." }
    }

    if (!merchant.is_open) {
        return { error: "La file d'attente est actuellement fermée." }
    }

    // ── 2. Validate QR token ─────────────────────────────────────────────────
    const { data: tokenValid, error: tokenError } = await supabase.rpc(
        "validate_qr_token",
        { p_nonce: token, p_slug: slug },
    )

    if (tokenError || !tokenValid) {
        return {
            error: "Ce QR code a expiré ou a déjà été utilisé. Veuillez scanner le QR code actuel.",
        }
    }

    // ── 3. Check capacity ────────────────────────────────────────────────────
    const { data: settings } = await supabase
        .from("settings")
        .select("max_capacity")
        .eq("merchant_id", merchant.id)
        .single()

    if (settings) {
        const { count } = await supabase
            .from("queue_items")
            .select("*", { count: "exact", head: true })
            .eq("merchant_id", merchant.id)
            .in("status", ["waiting", "called"])

        if ((count ?? 0) >= settings.max_capacity) {
            return { error: "La file d'attente est pleine. Veuillez réessayer plus tard." }
        }
    }

    // ── 4. Insert ticket ─────────────────────────────────────────────────────
    const { data: ticket, error: insertError } = await supabase
        .from("queue_items")
        .insert({
            merchant_id: merchant.id,
            customer_name: customerName,
            status: "waiting",
        })
        .select("id")
        .single()

    if (insertError || !ticket) {
        return { error: "Impossible de rejoindre la file. Veuillez réessayer." }
    }

    return { data: { ticketId: ticket.id, merchantId: merchant.id } }
}
