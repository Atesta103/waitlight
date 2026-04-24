"use client"

import { forwardRef, useState, useCallback, useImperativeHandle } from "react"
import { cn } from "@/lib/utils/cn"
import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Toggle } from "@/components/ui/Toggle"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import {
    Volume2,
    Vibrate,
    MessageSquare,
    BellRing,
    Save,
    Loader2,
    Target,
    Clock,
    CheckCircle2,
} from "lucide-react"
import {
    updateNotificationPreferencesAction,
    type NotificationChannels,
    type NotificationPreferencesInput,
} from "@/lib/actions/settings"

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const SOUND_OPTIONS = [
    { value: "arpeggio", label: "Arpège (défaut)" },
    { value: "chime", label: "Carillon" },
    { value: "bell", label: "Cloche" },
    { value: "ping", label: "Ping" },
    { value: "none", label: "Aucun son" },
]

const CHANNEL_DEFS = [
    {
        key: "sound" as const,
        icon: Volume2,
        label: "Son",
        description: "Joue un son quand c'est le tour du client.",
    },
    {
        key: "vibrate" as const,
        icon: Vibrate,
        label: "Vibration",
        description: "Fait vibrer le téléphone du client (Android / iOS via audio).",
    },
    {
        key: "toast" as const,
        icon: MessageSquare,
        label: "Notification in-app",
        description: "Affiche une alerte visuelle dans le navigateur.",
    },
    {
        key: "push" as const,
        icon: BellRing,
        label: "Notification push",
        description: "Envoie une notification système même si l'onglet est fermé.",
    },
]

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export type NotificationPreferencesEditorProps = {
    initialChannels: NotificationChannels
    initialSound: string
    initialApproachingPosition: {
        enabled: boolean
        threshold: number
    }
    initialApproachingTime: {
        enabled: boolean
        thresholdMin: number
    }
    className?: string
    showSaveButton?: boolean
    onDirtyChange?: (isDirty: boolean) => void
}

export type NotificationPreferencesEditorHandle = {
    save: () => Promise<void>
}

const NotificationPreferencesEditor = forwardRef<NotificationPreferencesEditorHandle, NotificationPreferencesEditorProps>(function NotificationPreferencesEditor({
    initialChannels,
    initialSound,
    initialApproachingPosition,
    initialApproachingTime,
    className,
    showSaveButton = true,
    onDirtyChange,
}: NotificationPreferencesEditorProps, ref) {
    const [channels, setChannels] = useState<NotificationChannels>(initialChannels)
    const [sound, setSound] = useState(initialSound)
    const [positionEnabled, setPositionEnabled] = useState(initialApproachingPosition.enabled)
    const [positionThreshold, setPositionThreshold] = useState(initialApproachingPosition.threshold)
    const [timeEnabled, setTimeEnabled] = useState(initialApproachingTime.enabled)
    const [timeThreshold, setTimeThreshold] = useState(initialApproachingTime.thresholdMin)

    const [isSaving, setIsSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)
    const [saveError, setSaveError] = useState<string | null>(null)

    const markDirty = useCallback(() => {
        setSaveSuccess(false)
        onDirtyChange?.(true)
    }, [onDirtyChange])

    const toggleChannel = useCallback((key: keyof NotificationChannels) => {
        setChannels((prev) => ({ ...prev, [key]: !prev[key] }))
        markDirty()
    }, [markDirty])

    const handleSave = useCallback(async () => {
        setIsSaving(true)
        setSaveError(null)
        setSaveSuccess(false)

        const input: NotificationPreferencesInput = {
            notification_channels: channels,
            notification_sound: sound,
            approaching_position_enabled: positionEnabled,
            approaching_position_threshold: positionThreshold,
            approaching_time_enabled: timeEnabled,
            approaching_time_threshold_min: timeThreshold,
        }

        const result = await updateNotificationPreferencesAction(input)

        if ("error" in result) {
            setSaveError(result.error)
        } else {
            setSaveSuccess(true)
            onDirtyChange?.(false)
        }
        setIsSaving(false)
    }, [channels, sound, positionEnabled, positionThreshold, timeEnabled, timeThreshold, onDirtyChange])

    useImperativeHandle(ref, () => ({
        save: handleSave,
    }), [handleSave])

    return (
        <div className={cn("flex flex-col gap-5", className)}>
            {/* ── Notification Channels ──────────────────────────────────── */}
            <div className="flex flex-col gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    Canaux de notification
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CHANNEL_DEFS.map((ch) => {
                    const Icon = ch.icon
                    const isChecked = channels[ch.key]

                    return (
                        <div
                            key={ch.key}
                            className={cn(
                                "flex items-start justify-between gap-4 rounded-xl border p-4 transition-colors",
                                isChecked
                                    ? "border-brand-primary/40 bg-brand-primary/10"
                                    : "border-border-default bg-surface-base",
                            )}
                        >
                            <div className="flex items-start gap-3">
                                <span
                                    className={cn(
                                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors",
                                        isChecked
                                            ? "border-brand-primary/40 bg-brand-primary/20 text-text-primary"
                                            : "border-border-default bg-border-default/50 text-text-secondary",
                                    )}
                                    aria-hidden="true"
                                >
                                    <Icon size={15} />
                                </span>
                                <div>
                                    <p className="text-sm font-medium text-text-primary">{ch.label}</p>
                                    <p className="mt-0.5 text-xs text-text-secondary">{ch.description}</p>
                                </div>
                            </div>
                            <Toggle
                                checked={isChecked}
                                onChange={() => toggleChannel(ch.key)}
                                label={ch.label}
                                className="shrink-0 [&>span]:hidden"
                            />
                        </div>
                    )
                })}
                </div>
            </div>

            {/* ── Sound Preset ───────────────────────────────────────────── */}
            {channels.sound && (
                <Card>
                    <CardContent>
                        <Select
                            label="Son de notification"
                            value={sound}
                            onChange={(e) => {
                                setSound(e.target.value)
                                    markDirty()
                            }}
                            options={SOUND_OPTIONS}
                            hint="Le son joué quand un client est appelé."
                        />
                    </CardContent>
                </Card>
            )}

            {/* ── Approaching Turn ──────────────────────────────────────── */}
            <div className="flex flex-col gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    Notification « Bientôt ton tour »
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Position-based */}
                <div
                    className={cn(
                        "flex flex-col gap-3 rounded-xl border p-4 transition-colors",
                        positionEnabled
                            ? "border-brand-primary/40 bg-brand-primary/10"
                            : "border-border-default bg-surface-base",
                    )}
                >
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <span
                                className={cn(
                                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors",
                                    positionEnabled
                                        ? "border-brand-primary/40 bg-brand-primary/20 text-text-primary"
                                        : "border-border-default bg-border-default/50 text-text-secondary",
                                )}
                                aria-hidden="true"
                            >
                                <Target size={15} />
                            </span>
                            <div>
                                <p className="text-sm font-medium text-text-primary">
                                    Par position dans la file
                                </p>
                                <p className="mt-0.5 text-xs text-text-secondary">
                                    Notifie quand le client est à N positions du passage.
                                </p>
                            </div>
                        </div>
                        <Toggle
                            checked={positionEnabled}
                            onChange={(v) => {
                                setPositionEnabled(v)
                                markDirty()
                            }}
                            label="Position"
                            className="shrink-0 [&>span]:hidden"
                        />
                    </div>

                    {positionEnabled && (
                        <div className="pl-11">
                            <Input
                                label="Seuil (nombre de positions)"
                                type="number"
                                min={1}
                                max={20}
                                value={positionThreshold}
                                onChange={(e) => {
                                    setPositionThreshold(Number(e.target.value))
                                    markDirty()
                                }}
                                hint={`Le client sera notifié quand il est en position ≤ ${positionThreshold}`}
                            />
                        </div>
                    )}
                </div>

                {/* Time-based */}
                <div
                    className={cn(
                        "flex flex-col gap-3 rounded-xl border p-4 transition-colors",
                        timeEnabled
                            ? "border-brand-primary/40 bg-brand-primary/10"
                            : "border-border-default bg-surface-base",
                    )}
                >
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <span
                                className={cn(
                                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors",
                                    timeEnabled
                                        ? "border-brand-primary/40 bg-brand-primary/20 text-text-primary"
                                        : "border-border-default bg-border-default/50 text-text-secondary",
                                )}
                                aria-hidden="true"
                            >
                                <Clock size={15} />
                            </span>
                            <div>
                                <p className="text-sm font-medium text-text-primary">
                                    Par temps estimé restant
                                </p>
                                <p className="mt-0.5 text-xs text-text-secondary">
                                    Notifie quand le temps d&apos;attente estimé est inférieur au seuil.
                                </p>
                            </div>
                        </div>
                        <Toggle
                            checked={timeEnabled}
                            onChange={(v) => {
                                setTimeEnabled(v)
                                markDirty()
                            }}
                            label="Temps"
                            className="shrink-0 [&>span]:hidden"
                        />
                    </div>

                    {timeEnabled && (
                        <div className="pl-11">
                            <Input
                                label="Seuil (minutes)"
                                type="number"
                                min={1}
                                max={30}
                                value={timeThreshold}
                                onChange={(e) => {
                                    setTimeThreshold(Number(e.target.value))
                                    markDirty()
                                }}
                                hint={`Le client sera notifié quand il reste moins de ${timeThreshold} min.`}
                            />
                        </div>
                    )}
                </div>
                </div>
            </div>

            {showSaveButton ? (
                <div className="flex items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2 text-sm">
                        {saveSuccess && (
                            <span className="flex items-center gap-1.5 text-green-600">
                                <CheckCircle2 size={14} />
                                Préférences enregistrées.
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
                        Enregistrer
                    </Button>
                </div>
            ) : null}
        </div>
    )
})

export { NotificationPreferencesEditor }
