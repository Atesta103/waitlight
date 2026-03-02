"use client"

import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { TicketCard } from "@/components/composed/TicketCard"
import { EmptyState } from "@/components/composed/EmptyState"
import { cn } from "@/lib/utils/cn"
import { listItem } from "@/lib/utils/motion"
import { Users } from "lucide-react"

type TicketStatus = "waiting" | "called" | "done" | "cancelled"

type QueueItem = {
    id: string
    customerName: string
    status: TicketStatus
    position?: number
    joinedAt: string
}

type QueueListProps = {
    items: QueueItem[]
    onCall?: (id: string) => void
    onComplete?: (id: string) => void
    onCancel?: (id: string) => void
    className?: string
}

function QueueList({
    items,
    onCall,
    onComplete,
    onCancel,
    className,
}: QueueListProps) {
    const prefersReduced = useReducedMotion()

    if (items.length === 0) {
        return (
            <EmptyState
                icon={<Users size={32} />}
                title="La file est vide"
                description="Aucun client n'attend pour le moment."
            />
        )
    }

    return (
        <div className={cn("flex flex-col gap-3", className)} role="list">
            <AnimatePresence mode="popLayout">
                {items.map((item, index) => (
                    <motion.div
                        key={item.id}
                        role="listitem"
                        layout={!prefersReduced}
                        custom={index}
                        variants={prefersReduced ? undefined : listItem}
                        initial="hidden"
                        animate="visible"
                        exit={
                            prefersReduced
                                ? undefined
                                : {
                                      opacity: 0,
                                      x: -20,
                                      transition: { duration: 0.2 },
                                  }
                        }
                    >
                        <TicketCard
                            id={item.id}
                            customerName={item.customerName}
                            status={item.status}
                            position={item.position}
                            joinedAt={item.joinedAt}
                            onCall={onCall}
                            onComplete={onComplete}
                            onCancel={onCancel}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}

export { QueueList, type QueueListProps, type QueueItem }
