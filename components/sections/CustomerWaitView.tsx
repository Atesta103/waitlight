"use client"

import Link from "next/link"
import { motion, AnimatePresence, useReducedMotion, type Variants, type Transition } from "framer-motion"
import { QueuePositionCard } from "@/components/composed/QueuePositionCard"
import { ConnectionStatus } from "@/components/composed/ConnectionStatus"
import { StatusBanner } from "@/components/composed/StatusBanner"
import { cn } from "@/lib/utils/cn"
import { Gamepad2 } from "lucide-react"
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
    slug: string
    ticketId: string
    thankYouMessage?: string | null
    backgroundUrl?: string | null
    className?: string
}

function CustomerWaitView({
    status,
    position,
    totalWaiting,
    estimatedWaitMinutes,
    connectionState,
    customerName,
    slug,
    ticketId,
    thankYouMessage,
    backgroundUrl,
    className,
}: CustomerWaitViewProps) {
    const prefersReduced = useReducedMotion()
    
    const variants: Variants | undefined = prefersReduced ? undefined : {
        initial: { opacity: 0, y: 15, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -15, scale: 0.98 },
    }
    const transition: Transition | undefined = prefersReduced
        ? { duration: 0 }
        : { type: "spring", stiffness: 350, damping: 25 }

    return (
        <div className={cn("flex flex-col gap-6", className)}>
            {backgroundUrl && (
                <div
                    className="fixed inset-0 z-[-1] bg-cover bg-center bg-no-repeat opacity-15 pointer-events-none"
                    style={{ backgroundImage: `url(${backgroundUrl})` }}
                />
            )}

            {connectionState !== "connected" ? (
                <ConnectionStatus state={connectionState} />
            ) : null}

            <AnimatePresence mode="wait">
                {status === "called" ? (
                    <motion.div
                        key="called"
                        variants={variants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={transition}
                    >
                        <StatusBanner
                            variant="called"
                            title="C'est votre tour !"
                            description={`${customerName}, présentez-vous au comptoir.`}
                        />
                    </motion.div>
                ) : status === "done" ? (
                    <motion.div
                        key="done"
                        variants={variants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={transition}
                    >
                        <StatusBanner
                            variant="done"
                            title="Merci !"
                            description={thankYouMessage || "Votre visite est terminée. Bonne journée !"}
                        />
                    </motion.div>
                ) : status === "cancelled" ? (
                    <motion.div
                        key="cancelled"
                        variants={variants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={transition}
                    >
                        <StatusBanner
                            variant="error"
                            title="Ticket annulé"
                            description="Votre ticket a été annulé."
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="waiting"
                        variants={variants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={transition}
                        className="flex flex-col gap-6"
                    >
                        <div className="flex flex-col items-center gap-4">
                            <h1 className="text-xl font-bold text-text-primary text-center">
                                Bonjour {customerName} !
                            </h1>
                            <QueuePositionCard
                                position={position}
                                totalWaiting={totalWaiting}
                                estimatedMinutes={estimatedWaitMinutes}
                            />
                        </div>
                        <p className="text-center text-sm text-text-secondary">
                            Gardez cette page ouverte pour être notifié-e quand ce
                            sera votre tour.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {status === "waiting" && (
                <div className="sticky bottom-0 pt-2">
                    <Link
                        href={`/${slug}/wait/${ticketId}/games`}
                        className={cn(
                            "flex items-center justify-center gap-2.5 rounded-2xl px-5 py-3.5 w-full",
                            "bg-brand-primary text-text-inverse font-semibold text-sm",
                            "shadow-lg hover:opacity-90 active:scale-95 transition-all",
                        )}
                    >
                        <Gamepad2 size={18} aria-hidden="true" />
                        Jouer en attendant
                    </Link>
                </div>
            )}
        </div>
    )
}

export { CustomerWaitView, type CustomerWaitViewProps }
