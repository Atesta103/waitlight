"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { QrCode, Play } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toggleQueueOpenAction } from "@/lib/actions/queue"
import { cn } from "@/lib/utils/cn"

type HeaderQueueControlProps = {
    initialIsOpen: boolean
    merchantSlug: string
    merchantId: string
    mode?: "desktop" | "mobile"
}

export function HeaderQueueControl({
    initialIsOpen,
    merchantSlug: _merchantSlug,
    merchantId,
    mode = "desktop",
}: HeaderQueueControlProps) {
    const router = useRouter()
    const queryClient = useQueryClient()

    // TANSTACK: Reads the global "queue-status" state shared with QueueSection.
    // It instantly reflects mutations made anywhere else in the app.
    const { data: isOpen } = useQuery({
        queryKey: ["queue-status", merchantId],
        queryFn: () => Promise.resolve(initialIsOpen), // Fallback, usually updated by mutations
        initialData: initialIsOpen,
        staleTime: Infinity,
    })

    // TANSTACK: Trigger server updates and handle optimistic UI rendering.
    const toggleMutation = useMutation({
        mutationFn: () => toggleQueueOpenAction({ is_open: true }),
        onMutate: () => {
            // TANSTACK: Instantly updates the UI while the server request is in flight
            queryClient.setQueryData(["queue-status", merchantId], true)
        },
        onError: () => {
            // TANSTACK: Rollback on error
            queryClient.setQueryData(["queue-status", merchantId], false)
        },
        onSuccess: () => {
            // Redirect to QR display
            router.push("/dashboard/qr-display")
        },
        onSettled: () => {
            // Note: We deliberately do not invalidateQueries here because the queryFn
            // resolves to the static initialIsOpen prop. Invalidating would immediately
            // revert the optimistic update to the initial prop value instead of fetching
            // the actual server state. The UI will stay optimistically correct.
        }
    })

    const isMobile = mode === "mobile"

    const controlClasses = cn(
        "inline-flex items-center rounded-xl bg-brand-primary font-semibold shadow-sm transition-all",
        "text-[var(--color-text-on-primary)] hover:text-[var(--color-text-on-primary)]",
        "hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2",
        "disabled:opacity-50",
        isMobile
            ? "h-11 w-full min-w-0 justify-center gap-2 px-4 text-sm"
            : "gap-2 px-4 py-2 text-sm",
    )

    if (!isOpen) {
        return (
            <button
                onClick={() => toggleMutation.mutate()}
                disabled={toggleMutation.isPending}
                className={controlClasses}
                aria-busy={toggleMutation.isPending}
            >
                <Play size={isMobile ? 16 : 18} aria-hidden="true" />
                {isMobile ? (
                    <span className="truncate">
                        {toggleMutation.isPending
                            ? "Ouverture..."
                            : "Ouvrir la file"}
                    </span>
                ) : (
                    <>
                        <span className="hidden sm:inline">
                            Ouvrir la file et afficher le QR Code
                        </span>
                        <span className="sm:hidden">Ouvrir</span>
                    </>
                )}
            </button>
        )
    }

    return (
        <Link
            href="/dashboard/qr-display"
            className={controlClasses}
        >
            <QrCode size={isMobile ? 16 : 18} aria-hidden="true" />
            {isMobile ? (
                <span>Voir le QR</span>
            ) : (
                <>
                    <span className="hidden sm:inline">Afficher le QR Code</span>
                    <span className="sm:hidden">QR Code</span>
                </>
            )}
        </Link>
    )
}
