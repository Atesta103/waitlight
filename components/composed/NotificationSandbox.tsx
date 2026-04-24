"use client"

import { useState, useRef, useCallback, useId, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
    Bell,
    Vibrate,
    MessageSquare,
    Sparkles,
    Smartphone,
    Volume2,
    Music2,
    ShieldAlert,
    RotateCcw,
    X,
} from "lucide-react"
import { Toast, type ToastVariant } from "@/components/ui/Toast"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils/cn"


/* ─── Web Audio context factory ─── */
function makeCtx() {
    return new (
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext
    )()
}

/* ─── Sound definitions ─── */
export type SoundChoice =
    | "arpeggio"
    | "double-ping"
    | "doorbell"
    | "alert"
    | "soft-chime"

export const SOUND_LABELS: Record<SoundChoice, string> = {
    arpeggio: "Arpège C-E-G",
    "double-ping": "Double ping",
    doorbell: "Sonnette",
    alert: "Alerte",
    "soft-chime": "Carillon doux",
}

function playSound(choice: SoundChoice) {
    const ctx = makeCtx()
    const now = ctx.currentTime

    type Note = {
        freq: number
        t: number
        dur: number
        vol: number
        type: OscillatorType
    }

    const schedules: Record<SoundChoice, Note[]> = {
        arpeggio: [
            { freq: 523.25, t: 0, dur: 0.55, vol: 0.28, type: "sine" },
            { freq: 659.25, t: 0.16, dur: 0.55, vol: 0.28, type: "sine" },
            { freq: 783.99, t: 0.32, dur: 0.55, vol: 0.28, type: "sine" },
        ],
        "double-ping": [
            { freq: 1046.5, t: 0, dur: 0.35, vol: 0.3, type: "sine" },
            { freq: 1046.5, t: 0.22, dur: 0.35, vol: 0.3, type: "sine" },
        ],
        doorbell: [
            { freq: 587.33, t: 0, dur: 0.45, vol: 0.3, type: "triangle" },
            { freq: 493.88, t: 0.28, dur: 0.55, vol: 0.25, type: "triangle" },
        ],
        alert: [
            { freq: 880, t: 0, dur: 0.12, vol: 0.35, type: "square" },
            { freq: 880, t: 0.16, dur: 0.12, vol: 0.35, type: "square" },
            { freq: 1108.7, t: 0.32, dur: 0.25, vol: 0.35, type: "square" },
        ],
        "soft-chime": [
            { freq: 523.25, t: 0, dur: 0.8, vol: 0.22, type: "sine" },
            { freq: 659.25, t: 0.2, dur: 0.8, vol: 0.2, type: "sine" },
            { freq: 987.77, t: 0.4, dur: 0.9, vol: 0.18, type: "sine" },
            { freq: 1318.5, t: 0.6, dur: 0.7, vol: 0.15, type: "sine" },
        ],
    }

    // All sounds pass through a compressor to avoid clipping
    const compressor = ctx.createDynamicsCompressor()
    compressor.threshold.value = -12
    compressor.ratio.value = 6
    compressor.connect(ctx.destination)

    schedules[choice].forEach(({ freq, t, dur, vol, type }) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(compressor)
        osc.type = type
        osc.frequency.value = freq
        const start = now + t
        gain.gain.setValueAtTime(0, start)
        gain.gain.linearRampToValueAtTime(vol, start + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur)
        osc.start(start)
        osc.stop(start + dur)
    })
}

/* ─── iOS haptic fallback ───
 * Vibration API is not implemented in Safari/iOS WebKit.
 * We play a cluster of low-frequency sawtooth pulses through Web Audio
 * to produce a physical buzz sensation through phone speakers / earbuds.
 * On iOS 16.4+ as an installed PWA, the OS push itself triggers the Taptic Engine.
 */
function playHapticBuzz() {
    const ctx = makeCtx()
    const compressor = ctx.createDynamicsCompressor()
    compressor.threshold.value = -6
    compressor.ratio.value = 20
    compressor.connect(ctx.destination)

    // 3 bursts at 55 Hz sawtooth — as low as possible for physical vibration feel
    const bursts = [0, 0.14, 0.28]
    bursts.forEach((offset) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(compressor)
        osc.type = "sawtooth"
        osc.frequency.value = 55
        const t = ctx.currentTime + offset
        gain.gain.setValueAtTime(0, t)
        gain.gain.linearRampToValueAtTime(1.0, t + 0.005)
        gain.gain.setValueAtTime(1.0, t + 0.07)
        gain.gain.linearRampToValueAtTime(0, t + 0.1)
        osc.start(t)
        osc.stop(t + 0.11)
    })
}

/* ─── Real browser push notification ─── */
async function sendBrowserPush(
    title: string,
    body: string,
    onBlocked: () => void,
): Promise<boolean> {
    if (!("Notification" in window)) return false

    let perm = Notification.permission
    if (perm === "default") {
        perm = await Notification.requestPermission()
    }
    if (perm !== "granted") {
        onBlocked()
        return false
    }

    const n = new Notification(title, {
        body,
        icon: "/favicon.svg",
        tag: "waitlight-turn",
        requireInteraction: false,
    })
    // Auto-close after 6 s
    setTimeout(() => n.close(), 6000)
    return true
}

/* ─── Types ─── */
type MerchantChannels = {
    sound: boolean
    vibrate: boolean
    toast: boolean
    push: boolean
}

type RepeatInterval = 15 | 30 | 60

type ToastItem = {
    id: string
    variant: ToastVariant
    title: string
    description?: string
}

type NotificationSandboxProps = {
    customerName?: string
    className?: string
}

/* ─── Push notification mock card ─── */
function PushCard({ name }: { name: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="flex items-start gap-3 rounded-2xl bg-white/80 p-3 shadow-lg backdrop-blur-md"
            style={{ WebkitBackdropFilter: "blur(12px)" }}
        >
            {/* App icon */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-primary">
                <Bell size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                        Wait-Light
                    </span>
                    <span className="text-[10px] tabular-nums text-zinc-400">
                        maintenant
                    </span>
                </div>
                <p className="mt-0.5 text-sm font-semibold leading-snug text-zinc-900">
                    C&apos;est votre tour, {name} !
                </p>
                <p className="mt-0.5 text-xs leading-snug text-zinc-600">
                    Présentez-vous au comptoir.
                </p>
            </div>
        </motion.div>
    )
}

/* ─── Phone frame wrapper ─── */
function PhoneMock({ children }: { children: React.ReactNode }) {
    // Current time for the status bar
    const now = new Date()
    const time = now.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
    })

    return (
        <div className="relative mx-auto w-56 overflow-hidden rounded-[2.5rem] border-[5px] border-zinc-800 bg-zinc-800 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.4)]">
            {/* Dynamic island */}
            <div className="absolute left-1/2 top-2.5 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-zinc-900" />

            {/* Screen */}
            <div
                className="relative overflow-hidden"
                style={{
                    background:
                        "linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
                    minHeight: "180px",
                }}
            >
                {/* Status bar */}
                <div className="flex items-center justify-between px-5 pb-1 pt-3">
                    <span className="text-[11px] font-semibold text-white/90">
                        {time}
                    </span>
                    <div className="flex items-center gap-1.5">
                        {/* Signal bars */}
                        <div className="flex items-end gap-[2px]">
                            {[3, 5, 7, 9].map((h, i) => (
                                <div
                                    key={i}
                                    className="w-[3px] rounded-sm bg-white/90"
                                    style={{ height: `${h}px` }}
                                />
                            ))}
                        </div>
                        {/* WiFi */}
                        <svg
                            width="14"
                            height="10"
                            viewBox="0 0 14 10"
                            fill="none"
                        >
                            <path
                                d="M7 7.5a1 1 0 110 2 1 1 0 010-2z"
                                fill="white"
                                fillOpacity="0.9"
                            />
                            <path
                                d="M4.1 5.2A4.1 4.1 0 017 4a4.1 4.1 0 012.9 1.2"
                                stroke="white"
                                strokeOpacity="0.9"
                                strokeWidth="1.2"
                                strokeLinecap="round"
                            />
                            <path
                                d="M1.5 2.8A7.5 7.5 0 017 1a7.5 7.5 0 015.5 1.8"
                                stroke="white"
                                strokeOpacity="0.9"
                                strokeWidth="1.2"
                                strokeLinecap="round"
                            />
                        </svg>
                        {/* Battery */}
                        <div className="flex items-center gap-[1px]">
                            <div className="relative h-[9px] w-[18px] rounded-sm border border-white/80">
                                <div className="absolute inset-y-[1px] left-[1px] w-3/4 rounded-[1px] bg-white/80" />
                            </div>
                            <div className="h-[4px] w-[1.5px] rounded-r-sm bg-white/70" />
                        </div>
                    </div>
                </div>

                {/* Lock screen time */}
                <div className="px-5 py-4 text-center">
                    <p className="text-4xl font-thin tracking-tight text-white/95">
                        {time}
                    </p>
                    <p className="mt-0.5 text-xs text-white/60">
                        {now.toLocaleDateString("fr-FR", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                        })}
                    </p>
                </div>

                {/* Notification area */}
                <div className="px-3 pb-4">{children}</div>
            </div>

            {/* Home bar */}
            <div className="flex justify-center bg-zinc-900 py-2">
                <div className="h-1 w-24 rounded-full bg-zinc-600" />
            </div>
        </div>
    )
}

/* ─── Main component ─── */
function NotificationSandbox({
    customerName = "Marie",
    className,
}: NotificationSandboxProps) {
    const [toasts, setToasts] = useState<ToastItem[]>([])
    const [selectedSound, setSelectedSound] = useState<SoundChoice>("arpeggio")
    const [showSoundPicker, setShowSoundPicker] = useState(false)
    const [showPush, setShowPush] = useState(false)
    const [pushPermission, setPushPermission] = useState<
        NotificationPermission | "unsupported"
    >("default")
    const [vibrateFlash, setVibrateFlash] = useState(false)
    // Lazy initializer: runs once on mount (client only), avoids synchronous setState in effect
    const [onIos] = useState(() => {
        if (typeof navigator === "undefined") return false
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window)
    })

    // Merchant channel preferences
    const [merchantChannels, setMerchantChannels] = useState<MerchantChannels>({
        sound: true,
        vibrate: true,
        toast: true,
        push: true,
    })

    // Repeat system
    const [repeatEnabled, setRepeatEnabled] = useState(false)
    const [repeatInterval, setRepeatInterval] = useState<RepeatInterval>(30)
    const [repeatActive, setRepeatActive] = useState(false)
    const [repeatAcknowledged, setRepeatAcknowledged] = useState(false)

    const pushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const repeatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const toastIdRef = useRef(0)
    const uid = useId()

    // Init platform + auto-request push permission on mount
    useEffect(() => {
        // Defer all setState calls to avoid synchronous setState inside effect
        setTimeout(() => {
            if (!("Notification" in window)) {
                setPushPermission("unsupported")
            } else {
                const perm = Notification.permission
                setPushPermission(perm)
                if (perm === "default") {
                    Notification.requestPermission().then((result) => {
                        setPushPermission(result)
                    })
                }
            }
        }, 0)
    }, [])

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    const addToast = useCallback(
        (variant: ToastVariant, title: string, description?: string) => {
            const id = `${uid}-${++toastIdRef.current}`
            setToasts((prev) => [
                ...prev.slice(-3),
                { id, variant, title, description },
            ])
        },
        [uid],
    )

    // Repeat notification timer
    useEffect(() => {
        if (repeatActive && !repeatAcknowledged) {
            repeatTimerRef.current = setInterval(() => {
                if (merchantChannels.sound) {
                    try {
                        playSound(selectedSound)
                    } catch {
                        /* blocked */
                    }
                }
                if (merchantChannels.vibrate) {
                    if ("vibrate" in navigator) {
                        navigator.vibrate([250, 80, 250, 80, 500])
                    } else {
                        try {
                            playHapticBuzz()
                        } catch {
                            /* fallback */
                        }
                    }
                }
                if (merchantChannels.toast) {
                    const id = `${uid}-${++toastIdRef.current}`
                    setToasts((prev) => [
                        ...prev.slice(-3),
                        {
                            id,
                            variant: "advance" as ToastVariant,
                            title: "Rappel — toujours votre tour !",
                            description:
                                "Appuyez sur « J'ai vu » pour arrêter les alertes.",
                        },
                    ])
                }
            }, repeatInterval * 1000)
        } else {
            if (repeatTimerRef.current) clearInterval(repeatTimerRef.current)
        }
        return () => {
            if (repeatTimerRef.current) clearInterval(repeatTimerRef.current)
        }
    }, [
        repeatActive,
        repeatAcknowledged,
        repeatInterval,
        merchantChannels,
        selectedSound,
        uid,
    ])

    /** Explicitly request push permission (for the banner CTA) */
    async function requestPushPermission() {
        if (!("Notification" in window)) return
        const result = await Notification.requestPermission()
        setPushPermission(result)
        if (result === "granted") {
            addToast(
                "info",
                "Notifications autorisées",
                "Vous recevrez les alertes en temps réel.",
            )
        }
    }

    /** Customer has acknowledged the alert — stop the repeat loop */
    function acknowledgeRepeat() {
        setRepeatAcknowledged(true)
        setRepeatActive(false)
        addToast(
            "info",
            "Alerte acquittée",
            "Le client a confirmé avoir vu la notification.",
        )
    }

    /** Toggle a merchant notification channel */
    function toggleChannel(ch: keyof MerchantChannels) {
        setMerchantChannels((prev) => ({ ...prev, [ch]: !prev[ch] }))
    }

    /** Fire sound (respects merchant channels) */
    function triggerSound(sound = selectedSound) {
        if (!merchantChannels.sound) {
            addToast(
                "error",
                "Son désactivé",
                "Canal désactivé dans les préférences marchand.",
            )
            return
        }
        try {
            playSound(sound)
        } catch {
            addToast(
                "error",
                "Son bloqué",
                "Interagissez avec la page d'abord.",
            )
        }
    }

    /** Fire vibration (respects merchant channels) */
    function triggerVibrate() {
        if (!merchantChannels.vibrate) {
            addToast(
                "error",
                "Vibration désactivée",
                "Canal désactivé dans les préférences marchand.",
            )
            return
        }
        if ("vibrate" in navigator) {
            const result = navigator.vibrate([250, 80, 250, 80, 500])
            if (!result) {
                addToast(
                    "info",
                    "Vibration ignor\u00e9e",
                    "La page doit \u00eatre au premier plan.",
                )
            }
        } else {
            try {
                playHapticBuzz()
            } catch {
                /* fallback */
            }
        }
        setVibrateFlash(true)
        setTimeout(() => setVibrateFlash(false), 400)
    }

    /** Fire in-app toast (respects merchant channels) */
    function triggerToast(
        variant: ToastVariant,
        title: string,
        description?: string,
    ) {
        if (!merchantChannels.toast) {
            addToast(
                "error",
                "Toast désactivé",
                "Canal désactivé dans les préférences marchand.",
            )
            return
        }
        addToast(variant, title, description)
    }

    /** Send a real OS push notification (respects merchant channels) */
    async function triggerPush() {
        if (!merchantChannels.push) {
            addToast(
                "error",
                "Push désactivé",
                "Canal désactivé dans les préférences marchand.",
            )
            return
        }
        setShowPush(true)
        if (pushTimerRef.current) clearTimeout(pushTimerRef.current)
        pushTimerRef.current = setTimeout(() => setShowPush(false), 5000)

        const sent = await sendBrowserPush(
            "C'est votre tour !",
            `${customerName}, présentez-vous au comptoir.`,
            () => {
                addToast(
                    "error",
                    "Notifications bloquées",
                    "Autorisez les notifications dans vos paramètres navigateur.",
                )
            },
        )
        if (sent) {
            setPushPermission("granted")
        } else if ("Notification" in window) {
            setPushPermission(Notification.permission)
        }
    }

    /** Full alert — everything at once */
    async function triggerAll() {
        triggerSound()
        triggerVibrate()
        await triggerPush()
        addToast(
            "called",
            `C'est votre tour, ${customerName} !`,
            "Présentez-vous au comptoir.",
        )
    }

    const CHANNEL_META: {
        key: keyof MerchantChannels
        label: string
        icon: React.ReactNode
    }[] = [
        { key: "sound", label: "Son", icon: <Volume2 size={14} /> },
        {
            key: "vibrate",
            label: onIos ? "Taptic (iOS)" : "Vibration",
            icon: <Vibrate size={14} />,
        },
        {
            key: "toast",
            label: "Toast in-app",
            icon: <MessageSquare size={14} />,
        },
        { key: "push", label: "Push OS", icon: <Smartphone size={14} /> },
    ]

    return (
        <div className={cn("space-y-4", className)}>
            {/* ─── Toast area ─── */}
            <div className="pointer-events-none fixed right-4 top-4 z-50 flex flex-col gap-2">
                <AnimatePresence mode="sync">
                    {toasts.map((t) => (
                        <Toast
                            key={t.id}
                            variant={t.variant}
                            title={t.title}
                            description={t.description}
                            duration={4000}
                            onClose={() => removeToast(t.id)}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {/* ─── Permission banners ─── */}
            <AnimatePresence>
                {pushPermission === "default" && (
                    <motion.div
                        key="perm-default"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex items-center gap-3 rounded-lg border border-brand-primary/30 bg-brand-primary/5 px-4 py-3"
                    >
                        <Bell
                            size={16}
                            className="shrink-0 text-brand-primary"
                        />
                        <p className="flex-1 text-sm text-text-secondary">
                            <span className="font-medium text-text-primary">
                                Activez les notifications
                            </span>{" "}
                            pour tester le canal Push OS en conditions réelles.
                        </p>
                        <button
                            type="button"
                            onClick={requestPushPermission}
                            className="cursor-pointer shrink-0 rounded-md bg-brand-primary px-3 py-1 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                        >
                            Activer
                        </button>
                    </motion.div>
                )}
                {pushPermission === "denied" && (
                    <motion.div
                        key="perm-denied"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex items-start gap-3 rounded-lg border border-feedback-error/30 bg-feedback-error-bg px-4 py-3"
                    >
                        <ShieldAlert
                            size={16}
                            className="mt-0.5 shrink-0 text-feedback-error"
                        />
                        <div>
                            <p className="text-sm font-medium text-text-primary">
                                Notifications bloquées
                            </p>
                            <p className="mt-0.5 text-xs text-text-secondary">
                                Pour débloquer&nbsp;: icône 🔒 dans la barre
                                d&apos;adresse → <strong>Notifications</strong>{" "}
                                → <strong>Autoriser</strong>. Sur mobile&nbsp;:
                                Réglages → Navigateur → Notifications →
                                Wait-Light → Autoriser.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ─── Repeat active banner ─── */}
            <AnimatePresence>
                {repeatActive && !repeatAcknowledged && (
                    <motion.div
                        key="repeat-active"
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        className="flex items-center gap-3 rounded-lg border border-status-called/30 bg-status-called-bg px-4 py-3"
                    >
                        <RotateCcw
                            size={15}
                            className="animate-spin shrink-0 text-status-called"
                        />
                        <p className="flex-1 text-sm text-text-secondary">
                            <span className="font-medium text-text-primary">
                                Rappel actif
                            </span>{" "}
                            — Le client n&apos;a pas encore acquitté. Alerte
                            toutes les{" "}
                            <strong>
                                {repeatInterval === 60
                                    ? "60 s (1 min)"
                                    : `${repeatInterval} s`}
                            </strong>
                            .
                        </p>
                        <button
                            type="button"
                            onClick={acknowledgeRepeat}
                            className="cursor-pointer flex shrink-0 items-center gap-1.5 rounded-md bg-status-called px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                        >
                            J&apos;ai vu ✓
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid gap-4 md:grid-cols-2">
                {/* ─── Left: trigger buttons ─── */}
                <div className="flex flex-col gap-4 rounded-xl border border-border-default bg-surface-card p-5">
                    <p className="text-sm font-semibold text-text-primary">
                        Simuler une alerte client
                    </p>

                    {/* 2×2 trigger grid */}
                    <div className="grid grid-cols-2 gap-2">
                        {/* Sound */}
                        <div className="flex flex-col gap-1.5">
                            <button
                                type="button"
                                onClick={() => triggerSound()}
                                disabled={!merchantChannels.sound}
                                className={cn(
                                    "flex flex-col items-center gap-2 rounded-lg border p-3 text-center transition-colors",
                                    merchantChannels.sound
                                        ? "cursor-pointer border-border-default hover:border-brand-primary/40 hover:bg-brand-primary/5"
                                        : "cursor-not-allowed border-border-default opacity-40",
                                )}
                            >
                                <Volume2
                                    size={20}
                                    className="text-brand-primary"
                                />
                                <span className="text-xs font-medium text-text-primary">
                                    Son
                                </span>
                                <span className="w-full truncate text-center text-[10px] text-text-secondary">
                                    {SOUND_LABELS[selectedSound]}
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowSoundPicker((v) => !v)}
                                className="cursor-pointer flex items-center justify-center gap-1 rounded border border-dashed border-border-default px-2 py-1 text-[10px] text-text-secondary transition-colors hover:border-brand-primary/40 hover:text-brand-primary"
                            >
                                <Music2 size={10} />
                                Choisir le son
                            </button>
                        </div>

                        {/* Vibration */}
                        <button
                            type="button"
                            onClick={triggerVibrate}
                            disabled={!merchantChannels.vibrate}
                            className={cn(
                                "flex flex-col items-center gap-2 rounded-lg border p-3 text-center transition-all",
                                !merchantChannels.vibrate
                                    ? "cursor-not-allowed border-border-default opacity-40"
                                    : vibrateFlash
                                      ? "cursor-pointer border-brand-primary bg-brand-primary/10 scale-95"
                                      : "cursor-pointer border-border-default hover:border-brand-primary/40 hover:bg-brand-primary/5",
                            )}
                        >
                            <Vibrate
                                size={20}
                                className={cn(
                                    "transition-transform text-brand-primary",
                                    vibrateFlash && "animate-bounce",
                                )}
                            />
                            <span className="text-xs font-medium text-text-primary">
                                {onIos ? "Buzz (iOS)" : "Vibration"}
                            </span>
                            <span className="text-[10px] text-text-secondary">
                                {onIos ? "Sawtooth 55 Hz" : "250+250+500 ms"}
                            </span>
                        </button>

                        {/* Toast */}
                        <button
                            type="button"
                            onClick={() =>
                                triggerToast(
                                    "called",
                                    `C'est votre tour, ${customerName} !`,
                                    "Pr\u00e9sentez-vous au comptoir.",
                                )
                            }
                            disabled={!merchantChannels.toast}
                            className={cn(
                                "flex flex-col items-center gap-2 rounded-lg border p-3 text-center transition-colors",
                                merchantChannels.toast
                                    ? "cursor-pointer border-border-default hover:border-brand-primary/40 hover:bg-brand-primary/5"
                                    : "cursor-not-allowed border-border-default opacity-40",
                            )}
                        >
                            <MessageSquare
                                size={20}
                                className="text-brand-primary"
                            />
                            <span className="text-xs font-medium text-text-primary">
                                Toast
                            </span>
                            <span className="text-[10px] text-text-secondary">
                                In-app banner
                            </span>
                        </button>

                        {/* Push */}
                        <button
                            type="button"
                            onClick={triggerPush}
                            disabled={!merchantChannels.push}
                            className={cn(
                                "flex flex-col items-center gap-2 rounded-lg border p-3 text-center transition-colors",
                                !merchantChannels.push
                                    ? "cursor-not-allowed border-border-default opacity-40"
                                    : pushPermission === "granted"
                                      ? "cursor-pointer border-status-called/40 bg-status-called-bg hover:border-brand-primary/40 hover:bg-brand-primary/5"
                                      : pushPermission === "denied"
                                        ? "cursor-pointer border-feedback-error/40 bg-feedback-error-bg"
                                        : "cursor-pointer border-border-default hover:border-brand-primary/40 hover:bg-brand-primary/5",
                            )}
                        >
                            <Smartphone
                                size={20}
                                className={cn(
                                    pushPermission === "granted"
                                        ? "text-status-called"
                                        : pushPermission === "denied"
                                          ? "text-feedback-error"
                                          : "text-brand-primary",
                                )}
                            />
                            <span className="text-xs font-medium text-text-primary">
                                Push OS
                            </span>
                            <span className="text-[10px] text-text-secondary">
                                {pushPermission === "granted"
                                    ? "Autorisé ✓"
                                    : pushPermission === "denied"
                                      ? "Bloqué ✗"
                                      : pushPermission === "unsupported"
                                        ? "Non supporté"
                                        : "En attente…"}
                            </span>
                        </button>
                    </div>

                    {/* Sound picker panel */}
                    {showSoundPicker && (
                        <div className="rounded-lg border border-border-default bg-surface-base p-3">
                            <p className="mb-2 text-[10px] uppercase tracking-widest text-text-disabled">
                                Son de notification
                            </p>
                            <div className="flex flex-col gap-1">
                                {(
                                    Object.keys(SOUND_LABELS) as SoundChoice[]
                                ).map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => {
                                            setSelectedSound(s)
                                            if (merchantChannels.sound)
                                                playSound(s)
                                        }}
                                        className={cn(
                                            "cursor-pointer flex items-center justify-between rounded px-2 py-1.5 text-sm transition-colors",
                                            selectedSound === s
                                                ? "bg-brand-primary/10 font-medium text-brand-primary"
                                                : "text-text-secondary hover:bg-surface-card",
                                        )}
                                    >
                                        {SOUND_LABELS[s]}
                                        {selectedSound === s && (
                                            <span className="text-[10px] text-brand-primary/70">
                                                actif
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* iOS note */}
                    {onIos && (
                        <p className="rounded-lg border border-status-waiting/30 bg-status-waiting-bg px-3 py-2 text-[11px] leading-relaxed text-status-waiting">
                            <strong>iOS Safari</strong> — La Vibration API
                            n&apos;est pas implémentée par Apple. Le bouton
                            «&nbsp;Buzz&nbsp;» joue des pulses audio basses
                            fréquences. Sur iOS&nbsp;16.4+ en PWA installée, le
                            push OS déclenche le Taptic Engine.
                        </p>
                    )}

                    {/* Fire all */}
                    <Button onClick={triggerAll} className="w-full gap-2">
                        <Sparkles size={15} />
                        Simuler toutes les alertes
                    </Button>

                    {/* Toast variant sampler */}
                    <div className="space-y-1.5 border-t border-border-default pt-3">
                        <p className="text-[10px] uppercase tracking-widest text-text-disabled">
                            Variantes de toast
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {(
                                [
                                    ["called", "Tour"],
                                    ["advance", "Avancé"],
                                    ["info", "Info"],
                                    ["error", "Erreur"],
                                ] as [ToastVariant, string][]
                            ).map(([v, label]) => (
                                <button
                                    key={v}
                                    type="button"
                                    onClick={() =>
                                        triggerToast(
                                            v,
                                            label,
                                            "Exemple de notification.",
                                        )
                                    }
                                    className="cursor-pointer rounded-full border border-border-default px-2.5 py-0.5 text-xs text-text-secondary transition-colors hover:border-brand-primary/30 hover:text-brand-primary"
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ─── Right column ─── */}
                <div className="flex flex-col gap-4">
                    {/* Merchant notification preferences */}
                    <div className="rounded-xl border border-border-default bg-surface-card p-5">
                        <p className="text-sm font-semibold text-text-primary">
                            Préférences marchand
                        </p>
                        <p className="mb-4 mt-0.5 text-xs text-text-secondary">
                            Canaux activés pour les clients de cette file
                        </p>
                        <div className="flex flex-col gap-2">
                            {CHANNEL_META.map(({ key, label, icon }) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => toggleChannel(key)}
                                    className={cn(
                                        "cursor-pointer flex items-center justify-between rounded-lg border px-3 py-2.5 transition-colors",
                                        merchantChannels[key]
                                            ? "border-brand-primary/30 bg-brand-primary/5"
                                            : "border-border-default bg-surface-base",
                                    )}
                                >
                                    <div className="flex items-center gap-2 text-sm">
                                        <span
                                            className={cn(
                                                merchantChannels[key]
                                                    ? "text-brand-primary"
                                                    : "text-text-disabled",
                                            )}
                                        >
                                            {icon}
                                        </span>
                                        <span
                                            className={cn(
                                                merchantChannels[key]
                                                    ? "text-text-primary"
                                                    : "text-text-disabled",
                                            )}
                                        >
                                            {label}
                                        </span>
                                    </div>
                                    {/* Toggle switch */}
                                    <div
                                        className={cn(
                                            "flex h-5 w-9 items-center rounded-full border transition-all",
                                            merchantChannels[key]
                                                ? "border-brand-primary bg-brand-primary justify-end"
                                                : "border-border-default bg-surface-base justify-start",
                                        )}
                                    >
                                        <div className="mx-0.5 h-3.5 w-3.5 rounded-full bg-white shadow-sm" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Repeat / re-alert card */}
                    <div className="rounded-xl border border-border-default bg-surface-card p-5">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <p className="text-sm font-semibold text-text-primary">
                                    Rappel automatique
                                </p>
                                <p className="mt-0.5 text-xs text-text-secondary">
                                    Répéter jusqu&apos;à acquittement du client
                                </p>
                            </div>
                            {/* Toggle */}
                            <button
                                type="button"
                                onClick={() => {
                                    const next = !repeatEnabled
                                    setRepeatEnabled(next)
                                    if (!next) {
                                        setRepeatActive(false)
                                        setRepeatAcknowledged(false)
                                    }
                                }}
                                className={cn(
                                    "cursor-pointer mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full border transition-all",
                                    repeatEnabled
                                        ? "border-brand-primary bg-brand-primary justify-end"
                                        : "border-border-default bg-surface-base justify-start",
                                )}
                            >
                                <div className="mx-0.5 h-3.5 w-3.5 rounded-full bg-white shadow-sm" />
                            </button>
                        </div>

                        {repeatEnabled && (
                            <div className="mt-4 space-y-3">
                                {/* Interval selector */}
                                <div>
                                    <p className="mb-1.5 text-[10px] uppercase tracking-widest text-text-disabled">
                                        Intervalle
                                    </p>
                                    <div className="flex gap-1.5">
                                        {([15, 30, 60] as RepeatInterval[]).map(
                                            (s) => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() =>
                                                        setRepeatInterval(s)
                                                    }
                                                    className={cn(
                                                        "cursor-pointer flex-1 rounded-md border py-1.5 text-xs transition-colors",
                                                        repeatInterval === s
                                                            ? "border-brand-primary bg-brand-primary/10 font-semibold text-brand-primary"
                                                            : "border-border-default text-text-secondary hover:bg-surface-base",
                                                    )}
                                                >
                                                    {s === 60
                                                        ? "1 min"
                                                        : `${s} s`}
                                                </button>
                                            ),
                                        )}
                                    </div>
                                </div>

                                {!repeatActive ? (
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => {
                                            setRepeatAcknowledged(false)
                                            setRepeatActive(true)
                                            triggerSound()
                                            triggerVibrate()
                                            addToast(
                                                "called",
                                                `C'est votre tour, ${customerName} !`,
                                                "Présentez-vous au comptoir.",
                                            )
                                        }}
                                        className="w-full gap-1.5"
                                    >
                                        <RotateCcw size={13} />
                                        Démarrer le rappel
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={acknowledgeRepeat}
                                            className="cursor-pointer flex-1 rounded-md bg-status-called px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                                        >
                                            J&apos;ai vu ✓
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setRepeatActive(false)
                                                setRepeatAcknowledged(false)
                                            }}
                                            className="cursor-pointer flex items-center justify-center rounded-md border border-border-default p-1.5 text-text-secondary transition-colors hover:border-feedback-error/50 hover:text-feedback-error"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Phone push preview */}
                    <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-xl border border-border-default bg-surface-base p-5">
                        <PhoneMock>
                            <AnimatePresence>
                                {showPush && <PushCard name={customerName} />}
                            </AnimatePresence>
                        </PhoneMock>
                        <p className="text-[10px] text-text-disabled">
                            Cliquez&nbsp;«&nbsp;Push OS&nbsp;» pour voir
                            l&apos;aperçu
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export { NotificationSandbox, type NotificationSandboxProps }
