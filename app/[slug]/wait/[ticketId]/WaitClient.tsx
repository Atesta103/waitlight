"use client"

import { useEffect, useState, useCallback, useRef } from "react"
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
}

const STORAGE_KEY_PREFIX = "waitlight_ticket_"

function WaitClient({ merchant, ticketId }: WaitClientProps) {
    const [ticket, setTicket] = useState<TicketData | null>(null)
    const [position, setPosition] = useState<number | null>(null)
    const [connectionState, setConnectionState] =
        useState<ConnectionState>("connected")
    const [notFound, setNotFound] = useState(false)
    const [acknowledgedFlag, setAcknowledgedFlag] = useState(false)
    const supabaseRef = useRef(createClient())

    const fetchTicket = useCallback(async () => {
        const supabase = supabaseRef.current
        const { data, error } = await supabase
            .from("queue_items")
            .select("id, merchant_id, customer_name, name_flagged, status, joined_at, called_at, done_at")
            .eq("id", ticketId)
            .single()

        if (error || !data) {
            setNotFound(true)
            return
        }

        setTicket(data as TicketData)

        // Clean up localStorage when ticket is done or cancelled
        if (data.status === "done" || data.status === "cancelled") {
            try {
                localStorage.removeItem(
                    `${STORAGE_KEY_PREFIX}${merchant.slug}`,
                )
            } catch {
                // Ignore localStorage errors
            }
        }
    }, [ticketId, merchant.slug])

    const fetchPosition = useCallback(async () => {
        const supabase = supabaseRef.current
        const { data, error } = await supabase.rpc("get_position", {
            ticket_id: ticketId,
        })

        if (!error && data !== null) {
            setPosition(data)
        }
    }, [ticketId])

    // Initial fetch
    useEffect(() => {
        fetchTicket()
        fetchPosition()
    }, [fetchTicket, fetchPosition])

    // Realtime subscription
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
                    // Refetch on any queue change
                    fetchTicket()
                    fetchPosition()
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
    }, [merchant.id, fetchTicket, fetchPosition])

    // Handle tab visibility — refetch when returning to foreground
    useEffect(() => {
        function handleVisibility() {
            if (document.visibilityState === "visible") {
                fetchTicket()
                fetchPosition()
            }
        }

        document.addEventListener("visibilitychange", handleVisibility)
        return () =>
            document.removeEventListener("visibilitychange", handleVisibility)
    }, [fetchTicket, fetchPosition])

    // Dynamic page title
    useEffect(() => {
        if (!ticket) return

        if (ticket.status === "called") {
            document.title = "C'est votre tour ! — Wait-Light"
        } else if (position !== null && position > 0) {
            document.title = `(${position}) En attente — Wait-Light`
        } else {
            document.title = `File d'attente — ${merchant.name}`
        }
    }, [ticket, position, merchant.name])

    if (notFound) {
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
        position !== null && position > 0
            ? position * effectivePrepTime
            : null

    // Count total waiting (position is 1-based, so it gives us
    // the count of people ahead + 1 for the customer themselves)
    const totalWaiting = position
    
    // Check if we need to show the moderation warning dialog
    const showModerationWarning = ticket.name_flagged && !acknowledgedFlag

    return (
        <div className="flex flex-col gap-4">
            <CustomerWaitView
                status={ticket.status}
                position={position}
                totalWaiting={totalWaiting}
                estimatedWaitMinutes={estimatedWaitMinutes}
                connectionState={connectionState}
                customerName={ticket.customer_name}
                slug={merchant.slug}
                ticketId={ticketId}
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
