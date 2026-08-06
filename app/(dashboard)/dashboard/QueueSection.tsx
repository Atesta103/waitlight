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
import { useMeasuredHeight } from "@/lib/hooks/use-measured-height"
import { computeQrSize } from "@/lib/utils/qr-size"
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
    // Below the side-by-side breakpoint (phone, tablet portrait): which of the
    // two panels is showing. Irrelevant when side by side (landscape lg:+),
    // where both are always visible — the tab switcher itself is
    // lg:landscape:hidden, so this never affects layout there.
    const [activeTab, setActiveTab] = useState<"queue" | "qr">("queue")
    // The QR canvas size is derived from the QR panel's measured height so the
    // card fits without scrolling in the side-by-side layout (spec Part 2). In
    // the tabs layout the panel is full-height, so the QR is large there too; the
    // card's own overflow-y-auto is only a safety valve for very short phones.
    const [qrPanelRef, qrPanelHeight] = useMeasuredHeight<HTMLDivElement>()
    const qrSize = computeQrSize(qrPanelHeight)
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

    // h-full: the QR card fills its column top to bottom, matching the ticket
    // list's own full-height column — not just centered inside extra empty
    // space, and not taller than that space either. The action buttons ride
    // inside the same card via `footer` rather than as a sibling below it, so
    // there's one bordered card, not two stacked ones.
    const qrPanel = (
        <QRCodeDisplay
            key={displayMode}
            slug={merchantSlug}
            size={qrSize}
            businessType={businessType}
            mode={displayMode}
            className="h-full"
            footer={
                <>
                    {manualTicketDialog}
                    <QrModeToggle mode={displayMode} onModeChange={setDisplayMode} />
                </>
            }
        />
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
                    {/* Below the side-by-side breakpoint (phone AND tablet
                        portrait) — neither panel reliably fits alongside the
                        other without the page needing to scroll, so each is its
                        own tab instead. Hidden when side by side (landscape
                        lg:+), where both are shown at once (see the grid
                        below). */}
                    <Tabs
                        className="lg:landscape:hidden"
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
                        Two layouts in one grid, switched on the side-by-side
                        condition (landscape AND lg:+) only:
                        - not side by side: one column, one row — only the
                          active tab's panel is rendered visible (the other is
                          `hidden`), filling the full available height on its own.
                        - side by side (landscape lg:+): two columns, one row
                          (list left via order-1, QR right via order-2) — the
                          layout already in place
                          before this whole feature, untouched.
                        grid-rows-[1fr] at both tiers so the visible row(s)
                        actually fill the grid's height rather than sizing to
                        content — needed for QueueList's own h-full to resolve
                        against a definite height.
                    */}
                    <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[1fr] gap-4 lg:landscape:grid-cols-[1fr_auto]">
                        {/* Queue list. pb-28 below md: clears the mobile
                            header, which is position: fixed at the viewport
                            bottom there (out of the flex flow entirely) — that
                            clearance lives on <main> for normal page scroll,
                            but doesn't reach this nested internal scroll
                            container, which is the actual scrolling context
                            on this page now. */}
                        <div
                            className={cn(
                                "min-h-0 flex-col pb-28 md:pb-0 lg:landscape:order-1 lg:landscape:flex",
                                activeTab === "queue" ? "flex" : "hidden",
                            )}
                        >
                            <QueueList
                                merchantId={merchantId}
                                initialItems={initialItems}
                                businessType={businessType}
                            />
                        </div>

                        {/* QR code panel. min-h-0 + overflow-y-auto: the card's
                            content (header + QR image + footer buttons) has a
                            natural minimum height that can't compress — on a
                            row shorter than that minimum, h-full alone would
                            just overflow and get clipped with no way to reach
                            the rest of it. This is the same safety valve
                            QueueList already has, so a too-short row scrolls
                            instead of silently losing part of the card.
                            Same mobile pb-28 clearance as the list, above. */}
                        <div
                            ref={qrPanelRef}
                            className={cn(
                                "min-h-0 flex-col items-center gap-3 overflow-y-auto pb-28 md:pb-0 lg:landscape:order-2 lg:landscape:flex",
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
