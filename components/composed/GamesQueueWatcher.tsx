"use client"

import { useCallback, useEffect, useId, useRef, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { AnimatePresence } from "framer-motion"
import { Toast, type ToastVariant } from "@/components/ui/Toast"
import { QueueStatusStrip } from "@/components/composed/QueueStatusStrip"
import {
    playHapticBuzz,
    playSound,
    type SoundChoice,
} from "@/lib/utils/notifications"
import { createClient } from "@/lib/supabase/client"
import { getBusinessWording } from "@/lib/utils/business-wording"

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

type MerchantNotificationChannels = {
    sound: boolean
    vibrate: boolean
    toast: boolean
    push: boolean
}

type GamesQueueWatcherProps = {
    merchantId: string
    ticketId: string
    customerName: string
    notificationChannels: MerchantNotificationChannels
    notificationSound: SoundChoice
    businessType?: string | null
    initialTicket?: TicketData
    initialPosition?: number
    disableRealtime?: boolean
}

function GamesQueueWatcher({
    merchantId,
    ticketId,
    customerName,
    notificationChannels,
    notificationSound,
    businessType,
    initialTicket,
    initialPosition,
    disableRealtime = false,
}: GamesQueueWatcherProps) {
    const queryClient = useQueryClient()
    const wording = getBusinessWording(businessType)
    const serviceDesk = wording.serviceDesk
    const supabaseRef = useRef(createClient())
    const [toasts, setToasts] = useState<ToastItem[]>([])
    const toastIdRef = useRef(0)
    const uid = useId()
    const hasNotifiedCalledRef = useRef(false)
    const previousPositionRef = useRef<number | undefined>(undefined)

    const addToast = useCallback(
        (variant: ToastVariant, title: string, description?: string) => {
            const id = `${uid}-${++toastIdRef.current}`
            setToasts((prev) => [...prev.slice(-2), { id, variant, title, description }])
        },
        [uid],
    )

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, [])

    const { data: ticket } = useQuery<TicketData>({
        queryKey: ["ticket", ticketId],
        initialData: initialTicket,
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
        initialData: initialPosition,
        queryFn: async () => {
            const supabase = supabaseRef.current
            const { data, error } = await supabase.rpc("get_position", { ticket_id: ticketId })
            if (error || data === null) throw new Error("Erreur ou position introuvable")
            return data as number
        },
        enabled: !!ticket && ticket.status !== "done" && ticket.status !== "cancelled",
    })

    const displayCustomerName = ticket?.customer_name?.trim() || customerName?.trim() || "Votre commande"

    useEffect(() => {
        if (disableRealtime) return

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
    }, [merchantId, ticketId, queryClient, disableRealtime])

    useEffect(() => {
        if (ticket?.status !== "called" || hasNotifiedCalledRef.current) return

        hasNotifiedCalledRef.current = true

        if (notificationChannels.sound) {
            playSound(notificationSound)
        }

        if (notificationChannels.vibrate) {
            if ("vibrate" in navigator) {
                navigator.vibrate([250, 80, 250, 80, 500])
            } else {
                playHapticBuzz()
            }
        }

        if (notificationChannels.toast) {
            addToast(
                "called",
                "C'est votre tour !",
                `${displayCustomerName}, présentez-vous au ${serviceDesk}.`,
            )
        }

        if (
            notificationChannels.push &&
            typeof window !== "undefined" &&
            "Notification" in window &&
            Notification.permission === "granted"
        ) {
            new Notification("C'est votre tour !", {
                body: `${displayCustomerName}, présentez-vous au ${serviceDesk}.`,
                icon: "/favicon.svg",
                tag: "waitlight-turn",
            })
        }
    }, [
        ticket?.status,
        displayCustomerName,
        notificationChannels,
        notificationSound,
        addToast,
        serviceDesk,
    ])

    useEffect(() => {
        if (position !== undefined && position !== null) {
            if (
                previousPositionRef.current !== undefined &&
                position < previousPositionRef.current &&
                position > 0 &&
                ticket?.status !== "called"
            ) {
                addToast(
                    "advance",
                    "Votre position avance !",
                    `Plus que ${position} personne${position > 1 ? "s" : ""} avant vous.`,
                )
            }
            previousPositionRef.current = position
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
                    {toasts.map((toast) => (
                        <div key={toast.id} className="pointer-events-auto">
                            <Toast
                                variant={toast.variant}
                                title={toast.title}
                                description={toast.description}
                                duration={5000}
                                onClose={() => removeToast(toast.id)}
                            />
                        </div>
                    ))}
                </AnimatePresence>
            </div>
        </>
    )
}

export { GamesQueueWatcher }
