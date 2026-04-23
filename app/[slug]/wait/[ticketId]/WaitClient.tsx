"use client"

import { useEffect, useState, useRef } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { CustomerWaitView } from "@/components/sections/CustomerWaitView"
import { Spinner } from "@/components/ui/Spinner"
import { StatusBanner } from "@/components/composed/StatusBanner"
import { Dialog, DialogHeader, DialogContent, DialogFooter } from "@/components/ui/Dialog"
import { Button } from "@/components/ui/Button"
import type { ConnectionState } from "@/components/composed/ConnectionStatus"

type Merchant = {
    id: string
    name: string
    slug: string
    default_prep_time_min: number
    /** Auto-computed average prep time. null = not enough data, fall back to default. */
    calculated_avg_prep_time: number | null
}

type TicketData = {
    id: string
    merchant_id: string
    customer_name: string
    name_flagged: boolean
    status: "waiting" | "called" | "done" | "cancelled"
    joined_at: string
    called_at: string | null
    done_at: string | null
}

type WaitClientProps = {
    merchant: Merchant
    ticketId: string
    doneMessage: string | null
    waitBackgroundUrl: string | null
}

const STORAGE_KEY_PREFIX = "waitlight_ticket_"

function WaitClient({
    merchant,
    ticketId,
    doneMessage,
    waitBackgroundUrl,
}: WaitClientProps) {
    const queryClient = useQueryClient()
    const [connectionState, setConnectionState] =
        useState<ConnectionState>("connected")
    const [acknowledgedFlag, setAcknowledgedFlag] = useState(false)
    const supabaseRef = useRef(createClient())

    // ── TanStack Query ────────────────────────────────────────────────────────
    // TANSTACK: Fetches ticket details. Tracks loading state and handles caching automatically.
    const {
        data: ticket,
        isError: ticketNotFound,
    } = useQuery({
        queryKey: ["ticket", ticketId],
        queryFn: async () => {
            const supabase = supabaseRef.current
            const { data, error } = await supabase
                .from("queue_items")
                .select("id, merchant_id, customer_name, name_flagged, status, joined_at, called_at, done_at")
                .eq("id", ticketId)
                .single()

            if (error || !data) {
                throw new Error("Ticket introuvable")
            }

            // Cleanup localStorage if done or cancelled
            if (data.status === "done" || data.status === "cancelled") {
                try {
                    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${merchant.slug}`)
                } catch {
                    // Ignore localStorage errors
                }
            }

            return data as TicketData
        },
    })

    // TANSTACK: Fetches customer position in queue.
    const { data: position } = useQuery({
        queryKey: ["position", ticketId],
        queryFn: async () => {
            const supabase = supabaseRef.current
            const { data, error } = await supabase.rpc("get_position", {
                ticket_id: ticketId,
            })
            if (error || data === null) throw new Error("Erreur ou position introuvable")
            return data
        },
        // TANSTACK: Conditional fetching. This query won't run at all unless enabled is true.
        enabled: !!ticket && ticket.status === "waiting",
        staleTime: 5000,
    })

    // ── Realtime subscription ─────────────────────────────────────────────────
    useEffect(() => {
        const supabase = supabaseRef.current
        const channel = supabase
            .channel(`queue:merchant_id=eq.${merchant.id}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "queue_items",
                    filter: `merchant_id=eq.${merchant.id}`,
                },
                () => {
                    // TANSTACK: When Supabase realtime pushes an event, we invalidate active queries.
                    // Instead of mutating state manually, we just tell TanStack it's stale, 
                    // and it fetches fresh data securely in the background.
                    queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] })
                    queryClient.invalidateQueries({ queryKey: ["position", ticketId] })
                },
            )
            .subscribe((status) => {
                if (status === "SUBSCRIBED") {
                    setConnectionState("connected")
                } else if (status === "CHANNEL_ERROR") {
                    setConnectionState("offline")
                } else if (status === "TIMED_OUT") {
                    setConnectionState("reconnecting")
                }
            })

        return () => {
            supabase.removeChannel(channel)
        }
    }, [merchant.id, ticketId, queryClient])

    // Dynamic page title
    useEffect(() => {
        if (!ticket) return

        if (ticket.status === "called") {
            document.title = "C'est votre tour ! — Wait-Light"
        } else if (position !== undefined && position > 0) {
            document.title = `(${position}) En attente — Wait-Light`
        } else {
            document.title = `File d'attente — ${merchant.name}`
        }
    }, [ticket, position, merchant.name])

    if (ticketNotFound) {
        return (
            <StatusBanner
                variant="error"
                title="Ticket introuvable"
                description="Ce ticket n'existe pas ou a été supprimé."
            />
        )
    }

    if (!ticket) {
        return (
            <div className="flex flex-col items-center gap-4">
                <Spinner size="lg" />
                <p className="text-sm text-text-secondary">
                    Chargement de votre ticket…
                </p>
            </div>
        )
    }

    // Effective prep time: prefer calculated value, fall back to default
    const effectivePrepTime =
        merchant.calculated_avg_prep_time ?? merchant.default_prep_time_min

    // Estimate wait time based on position and effective prep time
    const estimatedWaitMinutes =
        position !== undefined && position > 0
            ? position * effectivePrepTime
            : null

    // Count total waiting (position is 1-based, so it gives us
    // the count of people ahead + 1 for the customer themselves)
    // We default to null if position isn't loaded yet
    const totalWaiting = position ?? null
    
    // Check if we need to show the moderation warning dialog
    const showModerationWarning = ticket.name_flagged && !acknowledgedFlag

    return (
        <div className="flex flex-col gap-4">
            <CustomerWaitView
                status={ticket.status}
                position={position ?? null}
                totalWaiting={totalWaiting}
                estimatedWaitMinutes={estimatedWaitMinutes}
                connectionState={connectionState}
                customerName={ticket.customer_name}
                slug={merchant.slug}
                ticketId={ticketId}
                doneMessage={doneMessage}
                backgroundImageUrl={waitBackgroundUrl}
            />

            <Dialog 
                open={showModerationWarning} 
                onClose={() => setAcknowledgedFlag(true)}
            >
                <DialogHeader>Nom modifié par modération</DialogHeader>
                <DialogContent>
                    <p className="text-sm text-text-secondary">
                        Votre prénom ou surnom a été signalé pour contenu inapproprié et a été supprimé.
                        Vous apparaissez désormais sous le nom : <strong className="text-text-primary">{ticket.customer_name}</strong>.
                    </p>
                </DialogContent>
                <DialogFooter>
                    <Button onClick={() => setAcknowledgedFlag(true)}>
                        J&apos;ai compris
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    )
}

export { WaitClient }
