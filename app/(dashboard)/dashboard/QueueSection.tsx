"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { DashboardHeader } from "@/components/sections/DashboardHeader"
import { QueueList } from "@/components/sections/QueueList"
import { QRCodeDisplay } from "@/components/composed/QRCodeDisplay"
import { ManualTicketDialog } from "@/components/composed/ManualTicketDialog"
import {
    toggleQueueOpenAction,
    getQueueAction,
    createManualTicketAction,
} from "@/lib/actions/queue"
import { getBusinessWording } from "@/lib/utils/business-wording"
import type { QueueItem } from "@/lib/actions/queue"

type QueueSectionProps = {
    merchantId: string
    merchantName: string
    businessType: string
    merchantSlug: string
    initialIsOpen: boolean
    initialItems: QueueItem[]
}

/**
 * QueueSection — client orchestrator for the dashboard control center.
 * Combines DashboardHeader (open/close + counter) and QueueList (live list).
 * Handles queue open/close mutation with optimistic UI.
 * When the queue is open, renders a two-column layout: queue on the left, QR
 * code panel on the right.
 */
export function QueueSection({
    merchantId,
    merchantName,
    businessType,
    merchantSlug,
    initialIsOpen,
    initialItems,
}: QueueSectionProps) {
    const queryClient = useQueryClient()
    const wording = getBusinessWording(businessType)
    // TANSTACK: useQuery is used here as a global state store (like Zustand/Redux)
    // to share 'isOpen' across components without an actual HTTP request.
    const { data: isOpen = initialIsOpen } = useQuery({
        queryKey: ["queue-status", merchantId],
        queryFn: () => Promise.resolve(initialIsOpen), // Fallback if not in cache
        initialData: initialIsOpen,
        staleTime: Infinity, // Data never goes stale, preventing auto-refetches
    })

    // TANSTACK: Fetches actual queue data. The cache key ["queue", merchantId]
    // allows other components to read/update this exact data.
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

    // TANSTACK: useMutation handles data modification (POST/PUT/DELETE).
    // We use it to trigger server actions and track loading/error states.
    const toggleMutation = useMutation({
        mutationFn: (newIsOpen: boolean) =>
            toggleQueueOpenAction({ is_open: newIsOpen }),
        // TANSTACK: onMutate runs BEFORE the server request finishes.
        // We do an "optimistic update" to instantly change the UI.
        onMutate: (newIsOpen) => {
            queryClient.setQueryData(["queue-status", merchantId], newIsOpen)
        },
        // TANSTACK: If server request fails, rollback to the previous state.
        onError: (_err, newIsOpen) => {
            // Roll back on error
            queryClient.setQueryData(["queue-status", merchantId], !newIsOpen)
        },
        onSettled: () => {
            // Note: We deliberately do not invalidateQueries here because the queryFn
            // resolves to the static initialIsOpen prop. Invalidating would immediately
            // revert the optimistic update to the initial prop value instead of fetching
            // the actual server state. The UI will stay optimistically correct.
        },
    })

    const manualTicketMutation = useMutation({
        mutationFn: (customerName: string) =>
            createManualTicketAction({ customerName }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["queue", merchantId] })
        },
    })

    return (
        <div className="flex flex-col gap-6">
            <DashboardHeader
                merchantName={merchantName}
                businessType={businessType}
                isOpen={isOpen}
                waitingCount={waitingCount}
                onToggleOpen={(v) => toggleMutation.mutate(v)}
                isUpdatingOpenState={toggleMutation.isPending}
            />

            {!isOpen && (
                <div
                    role="status"
                    className="rounded-xl border border-border-default bg-surface-card p-6 text-center text-sm text-text-secondary"
                >
                    La file est fermée. Activez-la pour que les {wording.plural}{" "}
                    puissent rejoindre.
                </div>
            )}

            {isOpen && (
                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_auto]">
                    {/* Left — full-width queue list, always rendered when open */}
                    <QueueList
                        merchantId={merchantId}
                        initialItems={initialItems}
                        businessType={businessType}
                    />

                    {/* Right — QR code panel */}
                    <div className="flex flex-col items-center gap-3">
                        <QRCodeDisplay
                            slug={merchantSlug}
                            size={220}
                            businessType={businessType}
                        />
                        <ManualTicketDialog
                            businessType={businessType}
                            isSubmitting={manualTicketMutation.isPending}
                            onCreate={async (customerName) => {
                                const result =
                                    await manualTicketMutation.mutateAsync(
                                        customerName,
                                    )
                                if ("error" in result) {
                                    return { error: result.error }
                                }
                                return { data: result.data }
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
