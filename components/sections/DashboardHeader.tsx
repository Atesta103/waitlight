"use client"

import Link from "next/link"
import { Toggle } from "@/components/ui/Toggle"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils/cn"
import { Store, Users, QrCode } from "lucide-react"

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
                "flex flex-col gap-4 rounded-xl border border-border-default bg-surface-card px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6",
                className,
            )}
        >
            {/* Left: branding + counter */}
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
                    <div
                        className="flex items-center gap-2 text-sm text-text-secondary"
                        aria-live="polite"
                        aria-atomic="true"
                    >
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

            {/* Right: QR button + open/close toggle */}
            <div className="flex items-center gap-3">
                <Link href="/dashboard/qr-display" tabIndex={-1}>
                    <Button
                        variant="secondary"
                        size="sm"
                        aria-label="Afficher le QR Code pour les clients"
                    >
                        <QrCode size={16} aria-hidden="true" />
                        Afficher QR
                    </Button>
                </Link>

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
