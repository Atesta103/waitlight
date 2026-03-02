import { cn } from "@/lib/utils/cn"
import { Clock, PhoneCall, CheckCircle2, XCircle } from "lucide-react"
import type { ReactNode } from "react"

const statusConfig = {
    waiting: {
        label: "En attente",
        className: "bg-status-waiting-bg text-status-waiting",
        icon: Clock,
    },
    called: {
        label: "Appelé",
        className: "bg-status-called-bg text-status-called",
        icon: PhoneCall,
    },
    done: {
        label: "Terminé",
        className: "bg-status-done-bg text-status-done",
        icon: CheckCircle2,
    },
    cancelled: {
        label: "Annulé",
        className: "bg-status-cancelled-bg text-status-cancelled",
        icon: XCircle,
    },
} as const

type BadgeProps = {
    status: keyof typeof statusConfig
    showIcon?: boolean
    className?: string
    children?: ReactNode
}

function Badge({ status, showIcon = true, className, children }: BadgeProps) {
    const config = statusConfig[status]
    const Icon = config.icon

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                config.className,
                className,
            )}
        >
            {showIcon ? <Icon size={14} aria-hidden="true" /> : null}
            {children ?? config.label}
        </span>
    )
}

export { Badge, type BadgeProps, statusConfig }
