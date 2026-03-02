"use client"

import { Toggle } from "@/components/ui/Toggle"
import { Badge } from "@/components/ui/Badge"
import { cn } from "@/lib/utils/cn"
import { Store, Users } from "lucide-react"

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
                "flex flex-col gap-4 border-b border-border-default bg-surface-card px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6",
                className,
            )}
        >
            <div className="flex items-center gap-3">
                <div className="rounded-lg bg-brand-primary/10 p-2">
                    <Store
                        size={24}
                        className="text-brand-primary"
                        aria-hidden="true"
                    />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-text-primary">
                        {merchantName}
                    </h1>
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <Users size={14} aria-hidden="true" />
                        <span>
                            {waitingCount === 0
                                ? "Aucun client en attente"
                                : waitingCount === 1
                                  ? "1 client en attente"
                                  : `${waitingCount} clients en attente`}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
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
