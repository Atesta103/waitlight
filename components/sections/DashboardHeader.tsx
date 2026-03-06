"use client"

import { Toggle } from "@/components/ui/Toggle"
import { Badge } from "@/components/ui/Badge"
import { cn } from "@/lib/utils/cn"
import { Users, Store } from "lucide-react"

type DashboardHeaderProps = {
    merchantName: string
    isOpen: boolean
    waitingCount: number
    onToggleOpen: (isOpen: boolean) => void
    className?: string
}

function DashboardHeader({
    merchantName,
    isOpen,
    waitingCount,
    onToggleOpen,
    className,
}: DashboardHeaderProps) {
    return (
        <header
            className={cn(
                "flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl border border-border-default bg-surface-card px-4 py-4 sm:px-6",
                className,
            )}
        >
            {/* Merchant identity */}
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
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

            {/* Waiting counter */}
            <div
                className="flex items-center gap-2 text-sm text-text-secondary"
                aria-live="polite"
                aria-atomic="true"
            >
                <Users size={14} aria-hidden="true" />
                <span>
                    {waitingCount === 0
                        ? "Aucun client"
                        : waitingCount === 1
                            ? "1 client"
                            : `${waitingCount} clients`}
                </span>
            </div>

            {/* Status badge + toggle */}
            <div className="ml-auto flex items-center gap-3">
                <Badge
                    status={isOpen ? "called" : "cancelled"}
                    showIcon={false}
                >
                    {isOpen ? "Ouvert" : "Fermé"}
                </Badge>
                <Toggle
                    checked={isOpen}
                    onChange={onToggleOpen}
                    label={isOpen ? "Fermer la file" : "Ouvrir la file"}
                />
            </div>
        </header>
    )
}

export { DashboardHeader, type DashboardHeaderProps }
