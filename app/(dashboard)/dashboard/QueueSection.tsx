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
import { Tabs } from "@/components/ui/Tabs"
import { cn } from "@/lib/utils/cn"
import { useMediaQuery } from "@/lib/hooks/use-media-query"
import {
    toggleQueueOpenAction,
    getQueueAction,
    createManualTicketAction,
} from "@/lib/actions/queue"
import { getBusinessWording } from "@/lib/utils/business-wording"
import type { QueueItem } from "@/lib/actions/queue"

/**
 * QRCodeDisplay's `size` is a canvas pixel size, not something CSS breakpoints
 * can reflow — sized down below the lg: two-column layout (phone tab panel,
 * tablet-portrait compact strip) so it doesn't crowd out the ticket list;
 * full size at lg:+, matching the desktop layout's original size unchanged.
 */
const QR_SIZE_COMPACT = 150
const QR_SIZE_FULL = 220

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
    // Phone only (< md:): which of the two panels is showing. Irrelevant at
    // md:+, where both are always visible — the tab switcher itself is
    // md:hidden, so this never affects layout there.
    const [activeTab, setActiveTab] = useState<"queue" | "qr">("queue")
    // Below lg: (phone tab panel, tablet-portrait strip) the QR code renders
    // smaller — see QR_SIZE_COMPACT.
    const isCompactQr = useMediaQuery("(max-width: 1023px)")
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

    const qrPanel = (
        <>
            <QRCodeDisplay
                key={displayMode}
                slug={merchantSlug}
                size={isCompactQr ? QR_SIZE_COMPACT : QR_SIZE_FULL}
                businessType={businessType}
                mode={displayMode}
            />
            <div className="flex flex-wrap items-center justify-center gap-2">
                {manualTicketDialog}
                <QrModeToggle mode={displayMode} onModeChange={setDisplayMode} />
            </div>
        </>
    )

    return (
        // Full-bleed: <main> (app/(dashboard)/layout.tsx) caps content at
        // max-w-6xl, the right default for Settings/Analytics, but this page
        // should use the full screen at lg:+ rather than leaving space unused
        // on a wide monitor. `left: 50%` is computed against main's own
        // (narrower, centered) width, then `-translate-x-1/2` shifts back by
        // half of THIS element's width (100vw, from w-screen) — the two
        // together net out to the viewport center regardless of how narrow
        // main's own box is. A plain negative margin wouldn't: it would only
        // re-center within main's bounds, not break out of them.
        <div className="relative left-1/2 h-full w-screen min-h-0 -translate-x-1/2 flex flex-col gap-4 px-4 md:px-6 lg:px-8">
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
                <>
                    {/* Phone only — the QR panel doesn't fit alongside the full
                        list without page scroll on a short screen, so each is
                        its own tab instead. Hidden md:+, where both panels are
                        always shown together (see the grid below). */}
                    <Tabs
                        className="md:hidden"
                        value={activeTab}
                        onChange={(v) => setActiveTab(v as "queue" | "qr")}
                        tabs={[
                            {
                                value: "queue",
                                label: waitingCount > 0 ? `File (${waitingCount})` : "File",
                            },
                            { value: "qr", label: "QR code" },
                        ]}
                    />

                    {/*
                        Three layouts in one grid, switched by breakpoint:
                        - < md: one column, one row — only the active tab's
                          panel is rendered visible (the other is `hidden`).
                        - md: to < lg: one column, two rows (QR compact strip
                          on top via order-1, list filling the rest below via
                          order-2) — both panels always shown, ignoring
                          activeTab (the md:flex below overrides the
                          tab-driven hidden/flex).
                        - lg:+: two columns, one row (list left via order-1,
                          QR right via order-2) — the layout already in place
                          before this change, untouched.
                        grid-rows-[1fr] at every tier so the visible row(s)
                        actually fill the grid's height rather than sizing to
                        content — needed for QueueList's own h-full to resolve
                        against a definite height.
                    */}
                    <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[1fr] gap-4 md:grid-rows-[auto_1fr] lg:grid-cols-[1fr_auto] lg:grid-rows-[1fr]">
                        {/* Queue list */}
                        <div
                            className={cn(
                                "min-h-0 flex-col md:order-2 md:flex lg:order-1",
                                activeTab === "queue" ? "flex" : "hidden",
                            )}
                        >
                            <QueueList
                                merchantId={merchantId}
                                initialItems={initialItems}
                                businessType={businessType}
                            />
                        </div>

                        {/* QR code panel */}
                        <div
                            className={cn(
                                "flex-col items-center gap-3 md:order-1 md:flex lg:order-2",
                                activeTab === "qr" ? "flex" : "hidden",
                            )}
                        >
                            {qrPanel}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
