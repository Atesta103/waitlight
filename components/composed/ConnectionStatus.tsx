"use client"

import { Wifi, WifiOff, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils/cn"

type ConnectionState = "connected" | "reconnecting" | "offline"

type ConnectionStatusProps = {
    state: ConnectionState
    className?: string
}

const stateConfig: Record<
    ConnectionState,
    { label: string; className: string; icon: React.ElementType }
> = {
    connected: {
        label: "Connecté",
        className: "bg-feedback-success-bg text-feedback-success",
        icon: Wifi,
    },
    reconnecting: {
        label: "Reconnexion en cours…",
        className: "bg-feedback-warning-bg text-feedback-warning",
        icon: Loader2,
    },
    offline: {
        label: "Connexion perdue",
        className: "bg-feedback-error-bg text-feedback-error",
        icon: WifiOff,
    },
}

function ConnectionStatus({ state, className }: ConnectionStatusProps) {
    const config = stateConfig[state]
    const Icon = config.icon

    return (
        <div
            role="status"
            aria-live="polite"
            className={cn(
                "flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium",
                config.className,
                className,
            )}
        >
            <Icon
                size={16}
                className={cn(state === "reconnecting" && "animate-spin")}
                aria-hidden="true"
            />
            {config.label}
        </div>
    )
}

export { ConnectionStatus, type ConnectionStatusProps, type ConnectionState }
