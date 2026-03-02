"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { X, Bell, CheckCircle2, Info, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils/cn"

export type ToastVariant = "called" | "advance" | "info" | "error"

type ToastProps = {
    variant?: ToastVariant
    title: string
    description?: string
    /** Duration in ms before auto-dismiss. 0 = no auto-dismiss. */
    duration?: number
    onClose?: () => void
}

const CONFIG: Record<
    ToastVariant,
    { icon: React.ReactNode; bg: string; border: string; bar: string }
> = {
    called: {
        icon: <Bell size={18} className="text-status-called" aria-hidden />,
        bg: "bg-status-called-bg",
        border: "border-status-called/40",
        bar: "bg-status-called",
    },
    advance: {
        icon: (
            <CheckCircle2
                size={18}
                className="text-brand-primary"
                aria-hidden
            />
        ),
        bg: "bg-surface-card",
        border: "border-brand-primary/50",
        bar: "bg-brand-primary",
    },
    info: {
        icon: <Info size={18} className="text-feedback-info" aria-hidden />,
        bg: "bg-feedback-info-bg",
        border: "border-feedback-info/30",
        bar: "bg-feedback-info",
    },
    error: {
        icon: (
            <AlertCircle
                size={18}
                className="text-feedback-error"
                aria-hidden
            />
        ),
        bg: "bg-feedback-error-bg",
        border: "border-feedback-error/30",
        bar: "bg-feedback-error",
    },
}

function Toast({
    variant = "info",
    title,
    description,
    duration = 4000,
    onClose,
}: ToastProps) {
    const cfg = CONFIG[variant]
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        if (duration > 0 && onClose) {
            timerRef.current = setTimeout(onClose, duration)
        }
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
        }
    }, [duration, onClose])

    return (
        <motion.div
            role="alert"
            aria-live="assertive"
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={cn(
                "relative w-80 overflow-hidden rounded-lg border shadow-lg",
                cfg.bg,
                cfg.border,
            )}
        >
            {/* Content */}
            <div className="flex items-start gap-3 px-4 py-3">
                <span className="mt-0.5 shrink-0">{cfg.icon}</span>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-text-primary">
                        {title}
                    </p>
                    {description && (
                        <p className="mt-0.5 text-xs text-text-secondary">
                            {description}
                        </p>
                    )}
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        aria-label="Fermer"
                        className="cursor-pointer shrink-0 rounded p-0.5 text-text-secondary transition-colors hover:text-text-primary"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Progress bar */}
            {duration > 0 && (
                <motion.div
                    className={cn("absolute bottom-0 left-0 h-0.5", cfg.bar)}
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: duration / 1000, ease: "linear" }}
                />
            )}
        </motion.div>
    )
}

export { Toast, type ToastProps }
