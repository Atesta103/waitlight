"use client"

import { Card, CardHeader, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Avatar } from "@/components/ui/Avatar"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils/cn"
import { PhoneCall, X, CheckCircle2 } from "lucide-react"

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
                status === "called" && "ring-2 ring-status-called",
                className,
            )}
        >
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Avatar name={customerName} size="md" />
                    <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-text-primary">
                            {customerName}
                        </p>
                        <p className="text-sm text-text-secondary">
                            {position != null ? `#${position} · ` : ""}
                            {formattedTime}
                        </p>
                    </div>
                </div>
                <Badge status={status} />
            </CardHeader>

            {status === "waiting" || status === "called" ? (
                <CardContent>
                    <div className="flex gap-2">
                        {status === "waiting" && onCall ? (
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => onCall(id)}
                                aria-label={`Appeler ${customerName}`}
                            >
                                <PhoneCall size={16} aria-hidden="true" />
                                Appeler
                            </Button>
                        ) : null}
                        {status === "called" && onComplete ? (
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => onComplete(id)}
                                aria-label={`Terminer le service pour ${customerName}`}
                            >
                                <CheckCircle2 size={16} aria-hidden="true" />
                                Terminer
                            </Button>
                        ) : null}
                        {onCancel ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onCancel(id)}
                                aria-label={`Annuler le ticket de ${customerName}`}
                            >
                                <X size={16} aria-hidden="true" />
                                Annuler
                            </Button>
                        ) : null}
                    </div>
                </CardContent>
            ) : null}
        </Card>
    )
}

export { TicketCard, type TicketCardProps, type TicketStatus }
