"use client"

import { Card } from "@/components/ui/Card"
import { Avatar } from "@/components/ui/Avatar"
import { Button } from "@/components/ui/Button"
import { Dropdown } from "@/components/ui/Dropdown"
import { cn } from "@/lib/utils/cn"
import { PhoneCall, X, CheckCircle2, MoreVertical } from "lucide-react"

type TicketStatus = "waiting" | "called" | "done" | "cancelled"

type TicketCardProps = {
    id: string
    customerName: string
    status: TicketStatus
    position?: number
    joinedAt: string
    onCall?: (id: string) => void
    onComplete?: (id: string) => void
    onCancel?: (id: string) => void
    className?: string
}

function TicketCard({
    id,
    customerName,
    status,
    position,
    joinedAt,
    onCall,
    onComplete,
    onCancel,
    className,
}: TicketCardProps) {
    const formattedTime = new Intl.DateTimeFormat("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(joinedAt))

    return (
        <Card
            as="article"
            className={cn(
                // Effets de base : disposition parfaite flex
                "relative flex items-center justify-between gap-4 p-3 sm:p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
                // Mise en avant si appelé
                status === "called" &&
                "border-status-called/30 bg-status-called-bg ring-1 ring-inset ring-status-called/50 shadow-sm",
                className,
            )}
        >
            {/* Bloc de gauche : Avatar/Position + Nom/Temps */}
            <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
                {position != null ? (
                    <div
                        className={cn(
                            "flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-surface-base text-base sm:text-lg font-bold shadow-sm border border-border-default",
                            status === "called"
                                ? "border-status-called/30 text-status-called"
                                : "text-text-primary"
                        )}
                    >
                        #{position}
                    </div>
                ) : (
                    <Avatar name={customerName} size="md" />
                )}

                <div className="flex min-w-0 flex-col">
                    <p className="truncate text-base font-semibold text-text-primary">
                        {customerName}
                    </p>
                    <p className="mt-0.5 text-xs sm:text-sm font-medium text-text-secondary">
                        {status === "waiting" ? "Attente depuis " : "Appelé à "}
                        <span className="font-semibold text-text-primary">{formattedTime}</span>
                    </p>
                </div>
            </div>

            {/* Bloc de droite : Actions Primaires et au-delà */}
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                {/* Action en attente */}
                {status === "waiting" && onCall && (
                    <Button
                        variant="primary"
                        size="md"
                        onClick={() => onCall(id)}
                        aria-label={`Appeler ${customerName}`}
                        className="flex h-10 w-10 items-center justify-center rounded-full px-0 sm:w-auto sm:rounded-md sm:px-4"
                    >
                        <PhoneCall size={18} aria-hidden="true" />
                        <span className="hidden sm:inline">Appeler</span>
                    </Button>
                )}

                {/* Action appelé */}
                {status === "called" && onComplete && (
                    <Button
                        variant="primary"
                        size="md"
                        onClick={() => onComplete(id)}
                        aria-label={`Terminer le ticket de ${customerName}`}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-status-called px-0 text-white hover:bg-status-called/90 sm:w-auto sm:rounded-md sm:px-4"
                        style={{ color: "white" }}
                    >
                        <CheckCircle2 size={18} aria-hidden="true" />
                        <span className="hidden sm:inline">Terminer</span>
                    </Button>
                )}

                {/* Option "Annuler" masquée dans le Menu Dropdown */}
                {onCancel && (status === "waiting" || status === "called") && (
                    <Dropdown
                        align="right"
                        trigger={
                            <Button
                                variant="ghost"
                                size="md"
                                className="flex h-10 w-10 items-center justify-center px-0 text-text-secondary hover:text-text-primary"
                                aria-label="Plus d'options"
                            >
                                <MoreVertical size={18} />
                            </Button>
                        }
                        items={[
                            {
                                label: "Annuler le ticket",
                                icon: <X size={16} />,
                                variant: "destructive",
                                onClick: () => onCancel(id),
                            },
                        ]}
                    />
                )}
            </div>
        </Card>
    )
}

export { TicketCard, type TicketCardProps, type TicketStatus }
