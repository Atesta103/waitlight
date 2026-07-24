"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { DashboardHeader } from "@/components/sections/DashboardHeader"
import { QueueList } from "@/components/sections/QueueList"
import { QRCodeDisplay } from "@/components/composed/QRCodeDisplay"
import { ManualTicketDialog } from "@/components/composed/ManualTicketDialog"
import { ClosedQueueGuidance } from "@/components/composed/ClosedQueueGuidance"
import { UpgradeModal } from "@/components/composed/UpgradeModal"
import { QrModeToggle } from "@/components/composed/QrModeToggle"
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
    hasSubscription: boolean
    initialQrMode: "kiosk" | "assisted"
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
    hasSubscription,
    initialQrMode,
}: QueueSectionProps) {
    const queryClient = useQueryClient()
    const [showUpgradeModal, setShowUpgradeModal] = useState(false)
    const [displayMode, setDisplayMode] = useState<"kiosk" | "assisted">(initialQrMode)
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

    function handleRequestOpen() {
        if (!hasSubscription) {
            setShowUpgradeModal(true)
            return
        }
        toggleMutation.mutate(true)
    }

    const manualTicketMutation = useMutation({
        mutationFn: (customerName: string) =>
            createManualTicketAction({ customerName }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["queue", merchantId] })
        },
    })

    const manualTicketDialog = (
        <ManualTicketDialog
            businessType={businessType}
            isSubmitting={manualTicketMutation.isPending}
            onCreate={async (customerName) => {
                const result =
                    await manualTicketMutation.mutateAsync(customerName)
                if ("error" in result) {
                    return { error: result.error }
                }
                return { data: result.data }
            }}
        />
    )

    return (
        <div className="flex flex-col gap-6 lg:h-full lg:min-h-0 lg:gap-4">
            <UpgradeModal open={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
            <DashboardHeader
                merchantName={merchantName}
                businessType={businessType}
                isOpen={isOpen}
                waitingCount={waitingCount}
                onToggleOpen={(v) => v ? handleRequestOpen() : toggleMutation.mutate(false)}
                isUpdatingOpenState={toggleMutation.isPending}
            />

            {!isOpen && (
                <ClosedQueueGuidance
                    customerLabelPlural={wording.plural}
                    onOpenQueue={handleRequestOpen}
                    isOpening={toggleMutation.isPending}
                />
            )}

            {isOpen && (
                // items-start below lg: (each column its natural height, as
                // before); lg:items-stretch so both columns fill the row —
                // QueueList uses that height for its own internal scroll, the
                // QR panel just sits at the top of its (now taller) cell since
                // it never asks to stretch its own content.
                <div className="grid grid-cols-1 items-start gap-6 lg:flex-1 lg:min-h-0 lg:grid-cols-[1fr_auto] lg:items-stretch lg:gap-4">
                    {/* Left — full-width queue list, always rendered when open */}
                    <QueueList
                        merchantId={merchantId}
                        initialItems={initialItems}
                        businessType={businessType}
                    />

                    {/* Right — QR code panel */}
                    <div className="flex flex-col items-center gap-3">
                        <QRCodeDisplay
                            key={displayMode}
                            slug={merchantSlug}
                            size={220}
                            businessType={businessType}
                            mode={displayMode}
                        />
                        <div className="flex flex-wrap items-center justify-center gap-2">
                            {manualTicketDialog}
                            <QrModeToggle mode={displayMode} onModeChange={setDisplayMode} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
