"use client"

import { useState } from "react"
import { Clock, Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils/cn"

/* ─── Types ─── */
type WaitTimeMode = "auto" | "manual"

const PRESET_MINUTES = [5, 10, 15, 20, 30] as const

type WaitTimePickerProps = {
    /** Current queue avg (shown in auto mode) — null means "calcul en cours" */
    queueAvgMinutes?: number | null
    className?: string
}

/* ─── Component ─── */
function WaitTimePicker({
    queueAvgMinutes = 12,
    className,
}: WaitTimePickerProps) {
    const [mode, setMode] = useState<WaitTimeMode>("manual")
    const [minutes, setMinutes] = useState(10)

    const effectiveMinutes = mode === "auto" ? (queueAvgMinutes ?? 0) : minutes

    const now = new Date()
    const readyAt = new Date(now.getTime() + effectiveMinutes * 60_000)
    const readyAtStr = readyAt.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
    })

    function clamp(v: number) {
        return Math.min(120, Math.max(1, v))
    }

    return (
        <div
            className={cn(
                "rounded-xl border border-border-default bg-surface-card p-5",
                className,
            )}
        >
            {/* Header */}
            <div className="mb-4 flex items-center gap-2">
                <Clock size={16} className="text-brand-primary" />
                <p className="text-sm font-semibold text-text-primary">
                    Temps d&apos;attente estimé
                </p>
            </div>

            {/* Mode toggle */}
            <div className="mb-4 flex overflow-hidden rounded-lg border border-border-default">
                {(["manual", "auto"] as WaitTimeMode[]).map((m) => (
                    <button
                        key={m}
                        type="button"
                        onClick={() => setMode(m)}
                        className={cn(
                            "cursor-pointer flex-1 py-2 text-xs font-medium transition-colors",
                            mode === m
                                ? "bg-brand-primary text-white"
                                : "bg-surface-card text-text-secondary hover:bg-surface-base",
                        )}
                    >
                        {m === "manual" ? "Manuel" : "Auto (file)"}
                    </button>
                ))}
            </div>

            {mode === "auto" ? (
                /* Auto mode — show calculated average */
                <div className="space-y-3">
                    <div className="rounded-lg bg-surface-base px-3 py-2.5 text-xs text-text-secondary">
                        Calculé automatiquement d&apos;après la moyenne des
                        tickets précédents.{" "}
                        {queueAvgMinutes != null ? (
                            <span className="font-semibold text-text-primary">
                                ~{queueAvgMinutes} min
                            </span>
                        ) : (
                            <span className="text-text-disabled">
                                En cours de calcul…
                            </span>
                        )}
                    </div>
                    {/* Ready-at preview */}
                    {queueAvgMinutes != null && (
                        <div className="rounded-lg bg-surface-base px-3 py-2.5 text-center">
                            <p className="text-[10px] uppercase tracking-widest text-text-disabled">
                                Prêt vers
                            </p>
                            <p className="mt-0.5 text-xl font-bold tabular-nums text-brand-primary">
                                {readyAtStr}
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                /* Manual mode — presets + stepper */
                <div className="space-y-4">
                    {/* Preset buttons */}
                    <div className="flex gap-1.5">
                        {PRESET_MINUTES.map((m) => (
                            <button
                                key={m}
                                type="button"
                                onClick={() => setMinutes(m)}
                                className={cn(
                                    "cursor-pointer flex-1 rounded-md border py-1.5 text-xs transition-colors",
                                    minutes === m
                                        ? "border-brand-primary bg-brand-primary/10 font-semibold text-brand-primary"
                                        : "border-border-default text-text-secondary hover:bg-surface-base",
                                )}
                            >
                                {m}
                            </button>
                        ))}
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setMinutes((v) => clamp(v - 1))}
                            aria-label="Diminuer"
                            className="cursor-pointer flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border-default text-text-secondary transition-colors hover:border-brand-primary/50 hover:text-brand-primary"
                        >
                            <Minus size={14} />
                        </button>
                        <div className="flex-1 text-center">
                            <span className="text-3xl font-bold tabular-nums text-text-primary">
                                {minutes}
                            </span>
                            <span className="ml-1 text-sm text-text-secondary">
                                min
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setMinutes((v) => clamp(v + 1))}
                            aria-label="Augmenter"
                            className="cursor-pointer flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border-default text-text-secondary transition-colors hover:border-brand-primary/50 hover:text-brand-primary"
                        >
                            <Plus size={14} />
                        </button>
                    </div>

                    {/* Ready-at preview */}
                    <div className="rounded-lg bg-surface-base px-3 py-2.5 text-center">
                        <p className="text-[10px] uppercase tracking-widest text-text-disabled">
                            Prêt vers
                        </p>
                        <p className="mt-0.5 text-xl font-bold tabular-nums text-brand-primary">
                            {readyAtStr}
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}

export { WaitTimePicker, type WaitTimePickerProps }
