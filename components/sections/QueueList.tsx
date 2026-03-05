"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { TicketCard } from "@/components/composed/TicketCard"
import { EmptyState } from "@/components/composed/EmptyState"
import { ConnectionStatus } from "@/components/composed/ConnectionStatus"
import { Skeleton } from "@/components/ui/Skeleton"
import { cn } from "@/lib/utils/cn"
import { listItem } from "@/lib/utils/motion"
import { createClient } from "@/lib/supabase/client"
import {
    getQueueAction,
    callTicketAction,
    completeTicketAction,
    cancelTicketAction,
} from "@/lib/actions/queue"
import { Users } from "lucide-react"
import type { QueueItem } from "@/lib/actions/queue"
import type { ConnectionState } from "@/components/composed/ConnectionStatus"

type QueueListProps = {
    merchantId: string
    initialItems?: QueueItem[]
    className?: string
}

/**
 * QueueList — Organism.
 * Fetches active queue items via TanStack Query, subscribes to Realtime
 * for live updates, and renders TicketCards with optimistic action handling.
 */
function QueueList({ merchantId, initialItems = [], className }: QueueListProps) {
    const prefersReduced = useReducedMotion()
    const queryClient = useQueryClient()
    const [connectionState, setConnectionState] = useState<ConnectionState>("connected")
    const audioRef = useRef<AudioContext | null>(null)

    // ── TanStack Query ────────────────────────────────────────────────────────
    const { data: items = [], isLoading } = useQuery({
        queryKey: ["queue", merchantId],
        queryFn: async () => {
            const result = await getQueueAction()
            if ("error" in result) throw new Error(result.error)
            return result.data
        },
        initialData: initialItems.length > 0 ? initialItems : undefined,
        staleTime: 10_000,
    })

    // ── Mutations with optimistic updates ─────────────────────────────────────
    // Defined before keyboard shortcut callback to avoid reference-before-init.
    const callMutation = useMutation({
        mutationFn: (id: string) => callTicketAction({ id }),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ["queue", merchantId] })
            const prev = queryClient.getQueryData<QueueItem[]>(["queue", merchantId])
            queryClient.setQueryData<QueueItem[]>(
                ["queue", merchantId],
                (old = []) =>
                    old.map((item) =>
                        item.id === id
                            ? {
                                  ...item,
                                  status: "called" as const,
                                  called_at: new Date().toISOString(),
                              }
                            : item,
                    ),
            )
            return { prev }
        },
        onError: (_err, _id, context) => {
            if (context?.prev) {
                queryClient.setQueryData(["queue", merchantId], context.prev)
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["queue", merchantId] })
        },
    })

    const completeMutation = useMutation({
        mutationFn: (id: string) => completeTicketAction({ id }),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ["queue", merchantId] })
            const prev = queryClient.getQueryData<QueueItem[]>(["queue", merchantId])
            queryClient.setQueryData<QueueItem[]>(
                ["queue", merchantId],
                (old = []) => old.filter((item) => item.id !== id),
            )
            return { prev }
        },
        onError: (_err, _id, context) => {
            if (context?.prev) {
                queryClient.setQueryData(["queue", merchantId], context.prev)
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["queue", merchantId] })
        },
    })

    const cancelMutation = useMutation({
        mutationFn: (id: string) => cancelTicketAction({ id }),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ["queue", merchantId] })
            const prev = queryClient.getQueryData<QueueItem[]>(["queue", merchantId])
            queryClient.setQueryData<QueueItem[]>(
                ["queue", merchantId],
                (old = []) => old.filter((item) => item.id !== id),
            )
            return { prev }
        },
        onError: (_err, _id, context) => {
            if (context?.prev) {
                queryClient.setQueryData(["queue", merchantId], context.prev)
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["queue", merchantId] })
        },
    })

    // ── Audio chime for new tickets ───────────────────────────────────────────
    const playChime = useCallback(() => {
        try {
            if (!audioRef.current) {
                audioRef.current = new AudioContext()
            }
            const ctx = audioRef.current
            const oscillator = ctx.createOscillator()
            const gain = ctx.createGain()
            oscillator.connect(gain)
            gain.connect(ctx.destination)
            oscillator.frequency.setValueAtTime(880, ctx.currentTime)
            oscillator.frequency.exponentialRampToValueAtTime(
                440,
                ctx.currentTime + 0.3,
            )
            gain.gain.setValueAtTime(0.15, ctx.currentTime)
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
            oscillator.start(ctx.currentTime)
            oscillator.stop(ctx.currentTime + 0.4)
        } catch {
            // AudioContext not available (SSR / policy) — ignore
        }
    }, [])

    // ── Realtime subscription ─────────────────────────────────────────────────
    useEffect(() => {
        const supabase = createClient()

        const channel = supabase
            .channel(`queue:${merchantId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "queue_items",
                    filter: `merchant_id=eq.${merchantId}`,
                },
                () => {
                    queryClient.invalidateQueries({
                        queryKey: ["queue", merchantId],
                    })
                    playChime()
                },
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "queue_items",
                    filter: `merchant_id=eq.${merchantId}`,
                },
                () => {
                    queryClient.invalidateQueries({
                        queryKey: ["queue", merchantId],
                    })
                },
            )
            .subscribe((status) => {
                if (status === "SUBSCRIBED") {
                    setConnectionState("connected")
                } else if (
                    status === "CHANNEL_ERROR" ||
                    status === "TIMED_OUT"
                ) {
                    setConnectionState("offline")
                } else if (status === "CLOSED") {
                    setConnectionState("reconnecting")
                }
            })

        return () => {
            supabase.removeChannel(channel)
        }
    }, [merchantId, queryClient, playChime])

    // ── Keyboard shortcut: Enter → call first waiting ticket ──────────────────
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            const tag = (e.target as HTMLElement).tagName
            if (tag === "INPUT" || tag === "TEXTAREA") return
            if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
                const firstWaiting = items.find((i) => i.status === "waiting")
                if (firstWaiting) {
                    callMutation.mutate(firstWaiting.id)
                }
            }
        }
        window.addEventListener("keydown", handleKey)
        return () => window.removeEventListener("keydown", handleKey)
    }, [items, callMutation])

    // ── Loading state ─────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div
                className="flex flex-col gap-3"
                aria-busy="true"
                aria-label="Chargement de la file"
            >
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
            </div>
        )
    }

    // ── Derive display items: called first, then waiting with position ─────────
    const waitingItems = items.filter((i) => i.status === "waiting")
    const calledItems = items.filter((i) => i.status === "called")

    const displayItems = [
        ...calledItems.map((i) => ({ ...i, displayPosition: undefined as number | undefined })),
        ...waitingItems.map((item, idx) => ({
            ...item,
            displayPosition: idx + 1,
        })),
    ]

    return (
        <div className={cn("flex flex-col gap-4", className)}>
            {/* Connection state banner — only shown when degraded */}
            {connectionState !== "connected" && (
                <ConnectionStatus state={connectionState} />
            )}

            {/* Live queue counter for screen readers */}
            <div aria-live="polite" aria-atomic="true" className="sr-only">
                {waitingItems.length === 0
                    ? "Aucun client en attente"
                    : `${waitingItems.length} client${waitingItems.length > 1 ? "s" : ""} en attente`}
            </div>

            {displayItems.length === 0 ? (
                <EmptyState
                    icon={<Users size={32} />}
                    title="La file est vide"
                    description="Aucun client n'attend pour le moment."
                />
            ) : (
                <div role="list" className="flex flex-col gap-3">
                    <AnimatePresence mode="popLayout">
                        {displayItems.map((item, index) => (
                            <motion.div
                                key={item.id}
                                role="listitem"
                                layout={!prefersReduced}
                                custom={index}
                                variants={prefersReduced ? undefined : listItem}
                                initial="hidden"
                                animate="visible"
                                exit={
                                    prefersReduced
                                        ? undefined
                                        : {
                                              opacity: 0,
                                              x: -20,
                                              transition: { duration: 0.2 },
                                          }
                                }
                            >
                                <TicketCard
                                    id={item.id}
                                    customerName={item.customer_name}
                                    status={item.status}
                                    position={item.displayPosition}
                                    joinedAt={item.joined_at}
                                    onCall={(id) => callMutation.mutate(id)}
                                    onComplete={(id) => completeMutation.mutate(id)}
                                    onCancel={(id) => cancelMutation.mutate(id)}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    )
}

export { QueueList, type QueueListProps }
