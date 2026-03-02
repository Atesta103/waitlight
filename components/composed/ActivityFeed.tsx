"use client"

import { Badge } from "@/components/ui/Badge"
import { Card, CardHeader, CardContent } from "@/components/ui/Card"
import { cn } from "@/lib/utils/cn"
import { Activity } from "lucide-react"

type ActivityItem = {
    id: string
    action: "joined" | "called" | "completed" | "cancelled"
    customerName: string
    timestamp: string
}

type ActivityFeedProps = {
    items: ActivityItem[]
    className?: string
}

const actionConfig = {
    joined: { label: "a rejoint la file", status: "waiting" as const },
    called: { label: "a été appelé(e)", status: "called" as const },
    completed: { label: "terminé", status: "done" as const },
    cancelled: { label: "a annulé", status: "cancelled" as const },
} as const

function ActivityFeed({ items, className }: ActivityFeedProps) {
    const formatTime = (timestamp: string) =>
        new Intl.DateTimeFormat("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(timestamp))

    return (
        <Card className={cn("", className)}>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Activity
                        size={18}
                        className="text-text-secondary"
                        aria-hidden="true"
                    />
                    <span className="font-medium text-text-primary">
                        Activité récente
                    </span>
                </div>
            </CardHeader>
            <CardContent>
                {items.length === 0 ? (
                    <p className="py-4 text-center text-sm text-text-secondary">
                        Aucune activité récente.
                    </p>
                ) : (
                    <ul className="flex flex-col gap-3" role="list">
                        {items.map((item) => {
                            const config = actionConfig[item.action]
                            return (
                                <li
                                    key={item.id}
                                    className="flex items-center justify-between gap-2"
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Badge
                                            status={config.status}
                                            showIcon
                                            className="shrink-0"
                                        />
                                        <span className="truncate text-sm text-text-primary">
                                            <strong className="font-medium">
                                                {item.customerName}
                                            </strong>{" "}
                                            {config.label}
                                        </span>
                                    </div>
                                    <time
                                        dateTime={item.timestamp}
                                        className="shrink-0 text-xs text-text-secondary"
                                    >
                                        {formatTime(item.timestamp)}
                                    </time>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </CardContent>
        </Card>
    )
}

export { ActivityFeed, type ActivityFeedProps, type ActivityItem }
