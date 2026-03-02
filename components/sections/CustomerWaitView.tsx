"use client"

import { QueuePositionCard } from "@/components/composed/QueuePositionCard"
import { ConnectionStatus } from "@/components/composed/ConnectionStatus"
import { StatusBanner } from "@/components/composed/StatusBanner"
import { cn } from "@/lib/utils/cn"
import type { ConnectionState } from "@/components/composed/ConnectionStatus"

type TicketStatus = "waiting" | "called" | "done" | "cancelled"

type CustomerWaitViewProps = {
    status: TicketStatus
    position: number | null
    /** total people waiting in the queue (including the customer) */
    totalWaiting: number | null
    estimatedWaitMinutes: number | null
    connectionState: ConnectionState
    customerName: string
    className?: string
}

function CustomerWaitView({
    status,
    position,
    totalWaiting,
    estimatedWaitMinutes,
    connectionState,
    customerName,
    className,
}: CustomerWaitViewProps) {
    return (
        <div className={cn("flex flex-col gap-6", className)}>
            {connectionState !== "connected" ? (
                <ConnectionStatus state={connectionState} />
            ) : null}

            {status === "called" ? (
                <StatusBanner
                    variant="called"
                    title="C'est votre tour !"
                    description={`${customerName}, présentez-vous au comptoir.`}
                />
            ) : status === "done" ? (
                <StatusBanner
                    variant="done"
                    title="Merci !"
                    description="Votre visite est terminée. Bonne journée !"
                />
            ) : status === "cancelled" ? (
                <StatusBanner
                    variant="error"
                    title="Ticket annulé"
                    description="Votre ticket a été annulé."
                />
            ) : (
                <>
                    <div className="flex flex-col items-center gap-4">
                        <h1 className="text-xl font-bold text-text-primary">
                            Bonjour {customerName} !
                        </h1>
                        <QueuePositionCard
                            position={position}
                            totalWaiting={totalWaiting}
                            estimatedMinutes={estimatedWaitMinutes}
                        />
                    </div>
                    <p className="text-center text-sm text-text-secondary">
                        Gardez cette page ouverte pour être notifié quand ce
                        sera votre tour.
                    </p>
                </>
            )}
        </div>
    )
}

export { CustomerWaitView, type CustomerWaitViewProps }
