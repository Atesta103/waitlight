"use client"

import { Toggle } from "@/components/ui/Toggle"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils/cn"
import { Users, Store, QrCode } from "lucide-react"

type DashboardHeaderProps = {
    merchantName: string
    merchantSlug: string
    isOpen: boolean
    waitingCount: number
    onToggleOpen: (isOpen: boolean) => void
    className?: string
}

function DashboardHeader({
    merchantName,
    merchantSlug,
    isOpen,
    waitingCount,
    onToggleOpen,
    className,
}: DashboardHeaderProps) {
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
                            ? "Aucun client"
                            : waitingCount === 1
                              ? "1 client"
                              : `${waitingCount} clients`}
                    </span>
                </div>

                {/* Action block */}
                <div className="flex items-center justify-between gap-3 rounded-lg bg-surface-base px-3 py-2 sm:justify-end sm:bg-transparent sm:p-0">
                    <span className="text-sm font-medium text-text-primary sm:hidden">
                        {isOpen ? "File ouverte" : "File fermée"}
                    </span>
                    
                    <div className="flex items-center gap-3">
                        {!isOpen ? (
                            <Button size="sm" onClick={() => onToggleOpen(true)}>
                                Ouvrir la file
                            </Button>
                        ) : (
                            <a
                                href={`/qr?slug=${encodeURIComponent(merchantSlug)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Button size="sm" className="gap-2">
                                    <QrCode size={14} aria-hidden="true" />
                                    <span className="hidden sm:inline">Afficher le QR code</span>
                                    <span className="sm:hidden">QR code</span>
                                </Button>
                            </a>
                        )}

                        {isOpen && (
                            <div className="flex items-center gap-2 border-l border-border-default pl-3">
                                <Toggle
                                    checked={isOpen}
                                    onChange={onToggleOpen}
                                    label="Fermer"
                                    className="[&>span]:hidden sm:[&>span]:inline"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}

export { DashboardHeader, type DashboardHeaderProps }
