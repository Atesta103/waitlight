"use client"

import { forwardRef, useState, useCallback, useImperativeHandle } from "react"
import { cn } from "@/lib/utils/cn"
import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Toggle } from "@/components/ui/Toggle"
import {
    CalendarOff,
    Plus,
    X,
    Save,
    Loader2,
    CalendarClock,
} from "lucide-react"
import type { ScheduleData, WeeklyScheduleDay, ScheduleException } from "@/lib/actions/settings"
import { updateScheduleAction } from "@/lib/actions/settings"

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/** Days indexed 0=Mon … 6=Sun to match Postgres extract(isodow). */
const DAY_LABELS = [
    { key: "0", short: "Lun", full: "Lundi" },
    { key: "1", short: "Mar", full: "Mardi" },
    { key: "2", short: "Mer", full: "Mercredi" },
    { key: "3", short: "Jeu", full: "Jeudi" },
    { key: "4", short: "Ven", full: "Vendredi" },
    { key: "5", short: "Sam", full: "Samedi" },
    { key: "6", short: "Dim", full: "Dimanche" },
] as const

const DEFAULT_OPEN = "09:00"
const DEFAULT_CLOSE = "18:00"

function buildEmptyWeekly(): Record<string, WeeklyScheduleDay> {
    return Object.fromEntries(
        DAY_LABELS.map((d) => [d.key, { open: DEFAULT_OPEN, close: DEFAULT_CLOSE }]),
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export type ScheduleEditorProps = {
    initialSchedule: ScheduleData | null
    className?: string
    showSaveButton?: boolean
    onDirtyChange?: (isDirty: boolean) => void
}

export type ScheduleEditorHandle = {
    save: () => Promise<void>
}

const ScheduleEditor = forwardRef<ScheduleEditorHandle, ScheduleEditorProps>(function ScheduleEditor({ initialSchedule, className, showSaveButton = true, onDirtyChange }: ScheduleEditorProps, ref) {
    const [enabled, setEnabled] = useState(initialSchedule !== null)
    const [weekly, setWeekly] = useState<Record<string, WeeklyScheduleDay>>(
        initialSchedule?.weekly ?? buildEmptyWeekly(),
    )
    const [exceptions, setExceptions] = useState<ScheduleException[]>(
        initialSchedule?.exceptions ?? [],
    )
    const [isSaving, setIsSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)
    const [saveError, setSaveError] = useState<string | null>(null)

    const markDirty = useCallback(() => {
        setSaveSuccess(false)
        onDirtyChange?.(true)
    }, [onDirtyChange])

    // ── Day toggle ──────────────────────────────────────────────────────────
    const toggleDay = useCallback((dayKey: string) => {
        setWeekly((prev) => ({
            ...prev,
            [dayKey]: prev[dayKey] ? null : { open: DEFAULT_OPEN, close: DEFAULT_CLOSE },
        }))
        markDirty()
    }, [markDirty])

    const updateDayTime = useCallback(
        (dayKey: string, field: "open" | "close", value: string) => {
            setWeekly((prev) => {
                const day = prev[dayKey]
                if (!day) return prev
                return { ...prev, [dayKey]: { ...day, [field]: value } }
            })
            markDirty()
        },
        [markDirty],
    )

    // ── Exceptions ──────────────────────────────────────────────────────────
    const addException = useCallback(() => {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        const dateStr = tomorrow.toISOString().split("T")[0]
        setExceptions((prev) => [...prev, { date: dateStr, closed: true }])
        markDirty()
    }, [markDirty])

    const updateException = useCallback(
        (idx: number, update: Partial<ScheduleException>) => {
            setExceptions((prev) =>
                prev.map((ex, i) => (i === idx ? { ...ex, ...update } : ex)),
            )
            markDirty()
        },
        [markDirty],
    )

    const removeException = useCallback((idx: number) => {
        setExceptions((prev) => prev.filter((_, i) => i !== idx))
        markDirty()
    }, [markDirty])

    // ── Save ────────────────────────────────────────────────────────────────
    const handleSave = useCallback(async () => {
        setIsSaving(true)
        setSaveError(null)
        setSaveSuccess(false)

        const schedule: ScheduleData | null = enabled
            ? { weekly, exceptions }
            : null

        const result = await updateScheduleAction(schedule)

        if ("error" in result) {
            setSaveError(result.error)
        } else {
            setSaveSuccess(true)
            onDirtyChange?.(false)
        }
        setIsSaving(false)
    }, [enabled, weekly, exceptions, onDirtyChange])

    useImperativeHandle(ref, () => ({
        save: handleSave,
    }), [handleSave])

    return (
        <div className={cn("flex flex-col gap-4", className)}>
            {/* Master toggle */}
            <Toggle
                checked={enabled}
                onChange={(v) => {
                    setEnabled(v)
                    markDirty()
                }}
                label="Activer les horaires d'ouverture"
            />

            {enabled && (
                <div className="flex flex-col gap-4">
                    {/* Weekly schedule */}
                    <Card>
                        <CardContent>
                            <div className="flex flex-col gap-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                                    Horaires hebdomadaires
                                </p>
                                {DAY_LABELS.map((day) => {
                                    const dayData = weekly[day.key]
                                    const isOpen = dayData !== null

                                    return (
                                        <div
                                            key={day.key}
                                            className={cn(
                                                "flex items-center gap-3 rounded-xl border p-3.5 transition-all shadow-sm",
                                                isOpen
                                                    ? "border-border-default bg-white"
                                                    : "border-transparent bg-surface-base/50 opacity-50",
                                            )}
                                        >
                                            {/* Day name + toggle */}
                                            <button
                                                onClick={() => toggleDay(day.key)}
                                                className="flex w-14 shrink-0 items-center justify-start"
                                                aria-label={`${isOpen ? "Fermer" : "Ouvrir"} le ${day.full}`}
                                            >
                                                <span
                                                    className={cn(
                                                        "text-sm font-bold uppercase tracking-wider transition-colors",
                                                        isOpen ? "text-brand-primary" : "text-text-secondary line-through",
                                                    )}
                                                >
                                                    {day.short}
                                                </span>
                                            </button>

                                            {isOpen ? (
                                                <div className="flex flex-1 items-center gap-2">
                                                    <input
                                                        type="time"
                                                        value={dayData.open}
                                                        onChange={(e) =>
                                                            updateDayTime(day.key, "open", e.target.value)
                                                        }
                                                        className="rounded-lg border border-border-default bg-surface-base px-2.5 py-1.5 text-sm font-medium text-text-primary focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all w-24 text-center"
                                                        aria-label={`Heure d'ouverture ${day.full}`}
                                                    />
                                                    <span className="text-xs font-medium text-text-secondary">à</span>
                                                    <input
                                                        type="time"
                                                        value={dayData.close}
                                                        onChange={(e) =>
                                                            updateDayTime(day.key, "close", e.target.value)
                                                        }
                                                        className="rounded-lg border border-border-default bg-surface-base px-2.5 py-1.5 text-sm font-medium text-text-primary focus:border-brand-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all w-24 text-center"
                                                        aria-label={`Heure de fermeture ${day.full}`}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex flex-1 items-center gap-2">
                                                    <CalendarOff size={16} className="text-text-secondary" />
                                                    <span className="text-sm font-medium text-text-secondary">Fermé</span>
                                                </div>
                                            )}

                                            {/* Open/close toggle */}
                                            <Toggle
                                                checked={isOpen}
                                                onChange={() => toggleDay(day.key)}
                                                label={`${day.full} ouvert`}
                                                className="shrink-0 [&>span]:hidden"
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Exception dates */}
                    <Card>
                        <CardContent>
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                                        Jours exceptionnels
                                    </p>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={addException}
                                        className="text-xs"
                                    >
                                        <Plus size={14} />
                                        Ajouter
                                    </Button>
                                </div>

                                {exceptions.length === 0 ? (
                                    <p className="py-4 text-center text-xs text-text-secondary">
                                        Aucun jour exceptionnel. Ajoutez des jours fériés ou des fermetures spéciales.
                                    </p>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        {exceptions.map((ex, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-3 rounded-lg border border-border-default bg-surface-base p-3"
                                            >
                                                <input
                                                    type="date"
                                                    value={ex.date}
                                                    onChange={(e) =>
                                                        updateException(idx, { date: e.target.value })
                                                    }
                                                    className="rounded-md border border-border-default bg-white px-2 py-1.5 text-sm text-text-primary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                                                    aria-label="Date de l'exception"
                                                />

                                                <Toggle
                                                    checked={!ex.closed}
                                                    onChange={(v) =>
                                                        updateException(idx, {
                                                            closed: !v,
                                                            ...(v
                                                                ? { open: DEFAULT_OPEN, close: DEFAULT_CLOSE }
                                                                : { open: undefined, close: undefined }),
                                                        })
                                                    }
                                                    label="Ouvert"
                                                    className="shrink-0"
                                                />

                                                {!ex.closed && (
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="time"
                                                            value={ex.open ?? DEFAULT_OPEN}
                                                            onChange={(e) =>
                                                                updateException(idx, { open: e.target.value })
                                                            }
                                                            className="rounded-md border border-border-default bg-white px-2 py-1.5 text-sm text-text-primary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                                                            aria-label="Heure d'ouverture exception"
                                                        />
                                                        <span className="text-xs text-text-secondary">à</span>
                                                        <input
                                                            type="time"
                                                            value={ex.close ?? DEFAULT_CLOSE}
                                                            onChange={(e) =>
                                                                updateException(idx, { close: e.target.value })
                                                            }
                                                            className="rounded-md border border-border-default bg-white px-2 py-1.5 text-sm text-text-primary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                                                            aria-label="Heure de fermeture exception"
                                                        />
                                                    </div>
                                                )}

                                                <button
                                                    onClick={() => removeException(idx)}
                                                    className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-text-secondary hover:bg-red-50 hover:text-red-600 transition-colors"
                                                    aria-label="Supprimer l'exception"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {showSaveButton ? (
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm">
                        {saveSuccess && (
                            <span className="flex items-center gap-1.5 text-green-600">
                                <CalendarClock size={14} />
                                Horaires enregistrés.
                            </span>
                        )}
                        {saveError && (
                            <span className="text-red-600">{saveError}</span>
                        )}
                    </div>
                    <Button
                        variant="primary"
                        size="md"
                        onClick={handleSave}
                        disabled={isSaving}
                        isLoading={isSaving}
                    >
                        {isSaving ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Save size={16} />
                        )}
                        Enregistrer les horaires
                    </Button>
                </div>
            ) : null}
        </div>
    )
})

export { ScheduleEditor }
