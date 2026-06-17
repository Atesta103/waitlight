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
                "rounded-xl border border-border-default bg-surface-card px-4 py-4 sm:px-6",
                className,
            )}
        >
            <div className="flex items-start justify-between gap-3 sm:items-center">
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

                <Badge
                    status={isOpen ? "called" : "cancelled"}
                    showIcon={false}
                    className="shrink-0"
                >
                    {isOpen ? "Ouvert" : "Fermé"}
                </Badge>
            </div>

            <div className="mt-3 flex flex-col gap-3 sm:mt-4 sm:flex-row sm:items-center sm:justify-between">
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

                {/* Action block */}
                <div className="flex items-center justify-between gap-3 rounded-lg bg-surface-base px-3 py-2 sm:justify-end sm:bg-transparent sm:p-0">
                    <span className="text-sm font-medium text-text-primary sm:hidden">
                        {isOpen ? "File ouverte" : "File fermée"}
                    </span>

                    <Toggle
                        checked={isOpen}
                        onChange={onToggleOpen}
                        label={isOpen ? "Fermer la file" : "Ouvrir la file"}
                        disabled={isUpdatingOpenState}
                        className="shrink-0"
                    />
                </div>
            </div>
        </header>
    )
}

export { DashboardHeader, type DashboardHeaderProps }
