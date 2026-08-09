"use client"

import { Toggle } from "@/components/ui/Toggle"
import { Badge } from "@/components/ui/Badge"
import { cn } from "@/lib/utils/cn"
import { getBusinessWording } from "@/lib/utils/business-wording"
import { Users, Store } from "lucide-react"

type DashboardHeaderProps = {
    merchantName: string
    businessType?: string | null
    isOpen: boolean
    waitingCount: number
    onToggleOpen: (isOpen: boolean) => void
    isUpdatingOpenState?: boolean
    className?: string
}

function DashboardHeader({
    merchantName,
    businessType,
    isOpen,
    waitingCount,
    onToggleOpen,
    isUpdatingOpenState = false,
    className,
}: DashboardHeaderProps) {
    const wording = getBusinessWording(businessType)

    return (
        <header
            className={cn(
                "rounded-xl border border-border-default bg-surface-card px-3 py-3 sm:px-6 sm:py-4",
                className,
            )}
        >
            {/* Top row. On mobile this is the whole header: merchant identity
                on the left, the open/close toggle on the right (the toggle
                already conveys the state, and the waiting count lives in the
                "File (N)" tab) — one compact row instead of two. On sm:+ the
                right side shows the status badge and the fuller second row
                below carries the counter + toggle, unchanged. */}
            <div className="flex items-center justify-between gap-3">
                {/* Merchant identity */}
                <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-primary">
                        <Store
                            size={15}
                            className="text-white"
                            aria-hidden="true"
                        />
                    </span>
                    <span className="truncate font-semibold text-text-primary">
                        {merchantName}
                    </span>
                </div>

                {/* Status badge — sm:+ only (on mobile the toggle shows state) */}
                <Badge
                    status={isOpen ? "called" : "cancelled"}
                    showIcon={false}
                    className="hidden shrink-0 sm:inline-flex"
                >
                    {isOpen ? "Ouvert" : "Fermé"}
                </Badge>

                {/* Toggle — mobile only; on sm:+ it lives in the second row */}
                <Toggle
                    checked={isOpen}
                    onChange={onToggleOpen}
                    label={isOpen ? "Fermer la file" : "Ouvrir la file"}
                    disabled={isUpdatingOpenState}
                    className="shrink-0 sm:hidden"
                />
            </div>

            {/* Second row — sm:+ only: waiting counter + toggle. */}
            <div className="mt-4 hidden flex-row items-center justify-between gap-3 sm:flex">
                {/* Waiting counter */}
                <div
                    className="flex items-center gap-2 text-sm text-text-secondary"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    <Users size={14} aria-hidden="true" />
                    <span>
                        {waitingCount === 0
                            ? `Aucun ${wording.singular}`
                            : waitingCount === 1
                              ? `1 ${wording.singular}`
                              : `${waitingCount} ${wording.plural}`}
                    </span>
                </div>

                <Toggle
                    checked={isOpen}
                    onChange={onToggleOpen}
                    label={isOpen ? "Fermer la file" : "Ouvrir la file"}
                    disabled={isUpdatingOpenState}
                    className="shrink-0"
                />
            </div>
        </header>
    )
}

export { DashboardHeader, type DashboardHeaderProps }
