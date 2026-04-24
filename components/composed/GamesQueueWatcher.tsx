"use client"

import { useEffect, useState, useRef, useId, useCallback } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { AnimatePresence } from "framer-motion"
import { Toast, type ToastVariant } from "@/components/ui/Toast"
import { QueueStatusStrip } from "@/components/composed/QueueStatusStrip"

type ToastItem = {
    id: string
    variant: ToastVariant
    title: string
    description?: string
}

type TicketData = {
    status: "waiting" | "called" | "done" | "cancelled"
    customer_name: string
}

type GamesQueueWatcherProps = {
    merchantId: string
    ticketId: string
    customerName: string
}

export function GamesQueueWatcher({
    merchantId,
    ticketId,
    customerName,
}: GamesQueueWatcherProps) {
    const queryClient = useQueryClient()
    const supabaseRef = useRef(createClient())
    
    const [toasts, setToasts] = useState<ToastItem[]>([])
    const toastIdRef = useRef(0)
    const uid = useId()
    
    const prevPositionRef = useRef<number | undefined>(undefined)
    const prevStatusRef = useRef<string | undefined>(undefined)

    const addToast = useCallback((variant: ToastVariant, title: string, description?: string) => {
        const id = `${uid}-${++toastIdRef.current}`
        setToasts((prev) => [...prev.slice(-2), { id, variant, title, description }])
    }, [uid])

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    const { data: ticket } = useQuery<TicketData>({
        queryKey: ["ticket", ticketId],
        queryFn: async () => {
            const supabase = supabaseRef.current
            const { data, error } = await supabase
                .from("queue_items")
                .select("status, customer_name")
                .eq("id", ticketId)
                .single()
            if (error || !data) throw new Error("Ticket introuvable")
            return data as TicketData
        },
    })

    const { data: position } = useQuery({
        queryKey: ["position", ticketId],
        queryFn: async () => {
            const supabase = supabaseRef.current
            const { data, error } = await supabase.rpc("get_position", { ticket_id: ticketId })
            if (error || data === null) throw new Error("Erreur ou position introuvable")
            return data as number
        },
        enabled: !!ticket && ticket.status !== "done" && ticket.status !== "cancelled",
    })

    const displayCustomerName = ticket?.customer_name?.trim() || customerName?.trim() || "Votre commande"

    // Realtime subscription
    useEffect(() => {
        const supabase = supabaseRef.current
        const channel = supabase
            .channel(`games_queue:${merchantId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "queue_items",
                    filter: `merchant_id=eq.${merchantId}`,
                },
                () => {
                    queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] })
                    queryClient.invalidateQueries({ queryKey: ["position", ticketId] })
                },
            )
            .subscribe()

        return () => {
            void supabase.removeChannel(channel)
        }
    }, [merchantId, ticketId, queryClient])

    // Detect status change to "called"
    useEffect(() => {
        if (ticket?.status) {
            if (
                prevStatusRef.current !== undefined && 
                ticket.status === "called" && 
                prevStatusRef.current !== "called"
            ) {
                addToast("called", "C'est votre tour !", `${displayCustomerName}, présentez-vous au comptoir.`)
                
                if ("vibrate" in navigator) {
                    navigator.vibrate([250, 80, 250, 80, 500])
                }
            }
            prevStatusRef.current = ticket.status
        }
    }, [ticket?.status, displayCustomerName, addToast])

    // Detect position change
    useEffect(() => {
        if (position !== undefined && position !== null) {
            if (
                prevPositionRef.current !== undefined && 
                position < prevPositionRef.current && 
                position > 0 &&
                ticket?.status !== "called"
            ) {
                addToast("advance", "Votre position avance !", `Plus que ${position} personne${position > 1 ? 's' : ''} avant vous.`)
            }
            prevPositionRef.current = position
        }
    }, [position, ticket?.status, addToast])

    return (
        <>
            <div className="pointer-events-none fixed inset-x-0 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-[110] flex justify-center px-4">
                <QueueStatusStrip
                    className="pointer-events-auto w-full max-w-[18rem] shadow-xl sm:max-w-md"
                    position={position ?? null}
                    status={ticket?.status as "waiting" | "called" | "done" | "cancelled" | undefined}
                />
            </div>

            <div className="pointer-events-none fixed left-4 right-4 top-4 z-[100] flex flex-col items-center gap-2 md:left-auto md:right-4 md:items-end">
                <AnimatePresence mode="sync">
                    {toasts.map((t) => (
                        <div key={t.id} className="pointer-events-auto">
                            <Toast
                                variant={t.variant}
                                title={t.title}
                                description={t.description}
                                duration={5000}
                                onClose={() => removeToast(t.id)}
                            />
                        </div>
                    ))}
                </AnimatePresence>
            </div>
        </>
    )
}
