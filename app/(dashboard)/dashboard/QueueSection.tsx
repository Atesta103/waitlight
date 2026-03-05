"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { DashboardHeader } from "@/components/sections/DashboardHeader"
import { QueueList } from "@/components/sections/QueueList"
import { ConnectionStatus } from "@/components/composed/ConnectionStatus"
import { toggleQueueOpenAction, getQueueAction } from "@/lib/actions/queue"
import type { QueueItem } from "@/lib/actions/queue"
import type { ConnectionState } from "@/components/composed/ConnectionStatus"

type QueueSectionProps = {
    merchantId: string
    merchantName: string
    initialIsOpen: boolean
    initialItems: QueueItem[]
}

/**
 * QueueSection — client orchestrator for the dashboard control center.
 * Combines DashboardHeader (open/close + counter) and QueueList (live list).
 * Handles queue open/close mutation with optimistic UI.
 */
export function QueueSection({
    merchantId,
    merchantName,
    initialIsOpen,
    initialItems,
}: QueueSectionProps) {
    const queryClient = useQueryClient()
    const [isOpen, setIsOpen] = useState(initialIsOpen)

    // Live count from the queue cache (updated by QueueList's Realtime sub)
    const { data: queueItems = initialItems } = useQuery({
        queryKey: ["queue", merchantId],
        queryFn: async () => {
            const result = await getQueueAction()
            if ("error" in result) throw new Error(result.error)
            return result.data
        },
        initialData: initialItems,
        staleTime: 10_000,
    })

    const waitingCount = queueItems.filter((i) => i.status === "waiting").length

    // Toggle open/close with optimistic update
    const toggleMutation = useMutation({
        mutationFn: (newIsOpen: boolean) =>
            toggleQueueOpenAction({ is_open: newIsOpen }),
        onMutate: (newIsOpen) => {
            setIsOpen(newIsOpen)
        },
        onError: (_err, newIsOpen) => {
            // Roll back on error
            setIsOpen(!newIsOpen)
        },
    })

    return (
        <div className="flex flex-col gap-6">
            <DashboardHeader
                merchantName={merchantName}
                isOpen={isOpen}
                waitingCount={waitingCount}
                onToggleOpen={(v) => toggleMutation.mutate(v)}
            />

            {!isOpen && (
                <div
                    role="status"
                    className="rounded-xl border border-border-default bg-surface-card p-6 text-center text-sm text-text-secondary"
                >
                    La file est fermée. Activez-la pour que les clients puissent rejoindre.
                </div>
            )}

            {isOpen && (
                <QueueList
                    merchantId={merchantId}
                    initialItems={initialItems}
                />
            )}
        </div>
    )
}
