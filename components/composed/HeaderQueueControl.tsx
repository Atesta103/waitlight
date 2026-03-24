"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { QrCode, Play } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toggleQueueOpenAction } from "@/lib/actions/queue"

type HeaderQueueControlProps = {
    initialIsOpen: boolean
    merchantSlug: string
    merchantId: string
}

export function HeaderQueueControl({
    initialIsOpen,
    merchantSlug: _merchantSlug,
    merchantId,
}: HeaderQueueControlProps) {
    const router = useRouter()
    const queryClient = useQueryClient()

    // Sync is_open status with other components (like QueueSection)
    const { data: isOpen } = useQuery({
        queryKey: ["queue-status", merchantId],
        queryFn: () => Promise.resolve(initialIsOpen), // Fallback, usually updated by mutations
        initialData: initialIsOpen,
        staleTime: Infinity,
    })

    const toggleMutation = useMutation({
        mutationFn: () => toggleQueueOpenAction({ is_open: true }),
        onSuccess: () => {
            // Update cache so all components see the new status
            queryClient.setQueryData(["queue-status", merchantId], true)
            // Redirect to QR display
            router.push("/dashboard/qr-display")
        },
    })

    if (!isOpen) {
        return (
            <button
                onClick={() => toggleMutation.mutate()}
                disabled={toggleMutation.isPending}
                className="flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-secondary hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:opacity-50"
            >
                <Play size={18} aria-hidden="true" />
                <span className="hidden sm:inline">Ouvrir la file et afficher le QR Code</span>
                <span className="sm:hidden">Ouvrir</span>
            </button>
        )
    }

    return (
        <Link
            href="/dashboard/qr-display"
            className="flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-secondary hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
        >
            <QrCode size={18} aria-hidden="true" />
            <span className="hidden sm:inline">Afficher le QR Code</span>
            <span className="sm:hidden">QR Code</span>
        </Link>
    )
}
