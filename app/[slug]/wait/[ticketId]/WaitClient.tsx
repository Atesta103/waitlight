"use client"

import { useEffect, useState, useRef } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { CustomerWaitView } from "@/components/sections/CustomerWaitView"
import { Spinner } from "@/components/ui/Spinner"
import { StatusBanner } from "@/components/composed/StatusBanner"
import { Dialog, DialogHeader, DialogContent, DialogFooter } from "@/components/ui/Dialog"
import { Button } from "@/components/ui/Button"
import { TicketDownloadCard } from "@/components/composed/TicketDownloadCard"
import { type ConnectionState } from "@/components/composed/ConnectionStatus"
import { BellRing, Smartphone, MessageSquare, AlertCircle, Download } from "lucide-react"
import { playHapticBuzz, playSound, unlockAudio, type SoundChoice } from "@/lib/utils/notifications"
import { getBusinessWording } from "@/lib/utils/business-wording"
import { buildRecoverUrl } from "@/lib/utils/ticket-download"
import { toPng } from "html-to-image"

type NotificationChannels = {
    sound: boolean
    vibrate: boolean
    toast: boolean
    push: boolean
}

type Merchant = {
    id: string
    name: string
    slug: string
    background_url: string | null
    business_type: string
    default_prep_time_min: number
    /** Auto-computed average prep time. null = not enough data, fall back to default. */
    calculated_avg_prep_time: number | null
    logo_url: string | null
    brand_color: string | null
    settings: {
        notification_channels: NotificationChannels
        notification_sound: SoundChoice
        approaching_position_enabled: boolean
        approaching_position_threshold: number
        approaching_time_enabled: boolean
        approaching_time_threshold_min: number
        thank_you_title: string | null
        thank_you_message: string | null
    }
}

type TicketData = {
    id: string
    merchant_id: string
    customer_name: string
    name_flagged: boolean
    status: "waiting" | "called" | "done" | "cancelled"
    joined_at: string
    called_at: string | null
    done_at: string | null
    recovery_code: string | null
}

type WaitClientProps = {
    merchant: Merchant
    ticketId: string
}

const STORAGE_KEY_PREFIX = "waitlight_ticket_"
const ALERTS_INIT_KEY = "waitlight_alerts_init_"

function WaitClient({ merchant, ticketId }: WaitClientProps) {
    const queryClient = useQueryClient()
    const wording = getBusinessWording(merchant.business_type)
    const serviceDesk = wording.serviceDesk
    const [connectionState, setConnectionState] =
        useState<ConnectionState>("connected")
    const [acknowledgedFlag, setAcknowledgedFlag] = useState(false)
    const [calledReminderAcknowledged, setCalledReminderAcknowledged] = useState(false)
    const hasNotifiedApproachingRef = useRef(false)
    const supabaseRef = useRef(createClient())
    const calledReminderTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const [alertsInitialized, setAlertsInitialized] = useState(() => {
        try {
            return sessionStorage.getItem(`${ALERTS_INIT_KEY}${ticketId}`) === "1"
        } catch {
            return false
        }
    })

    const [ticketDialogOpen, setTicketDialogOpen] = useState(false)
    const [isDownloading, setIsDownloading] = useState(false)
    const [downloadError, setDownloadError] = useState<string | null>(null)
    const ticketCardRef = useRef<HTMLDivElement>(null)

    async function handleDownloadTicket() {
        if (!ticketCardRef.current) return
        setIsDownloading(true)
        setDownloadError(null)
        try {
            const dataUrl = await toPng(ticketCardRef.current, { pixelRatio: 2 })
            const link = document.createElement("a")
            link.href = dataUrl
            link.download = `ticket-${merchant.slug}.png`
            link.click()
        } catch (err) {
            console.error("[WaitClient] Ticket image export failed:", err)
            setDownloadError(
                "Impossible de générer l'image. Notez le code ci-dessus pour retrouver votre place.",
            )
        } finally {
            setIsDownloading(false)
        }
    }


    // ── TanStack Query ────────────────────────────────────────────────────────
    // TANSTACK: Fetches ticket details. Tracks loading state and handles caching automatically.
    const {
        data: ticket,
        isError: ticketNotFound,
    } = useQuery({
        queryKey: ["ticket", ticketId],
        queryFn: async () => {
            const supabase = supabaseRef.current
            const { data, error } = await supabase
                .from("queue_items")
                .select("id, merchant_id, customer_name, name_flagged, status, joined_at, called_at, done_at, recovery_code")
                .eq("id", ticketId)
                .single()

            if (error || !data) {
                throw new Error("Ticket introuvable")
            }

            // Cleanup localStorage if done or cancelled
            if (data.status === "done" || data.status === "cancelled") {
                try {
                    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${merchant.slug}`)
                } catch {
                    // Ignore localStorage errors
                }
            }

            return data as TicketData
        },
    })

    // TANSTACK: Fetches customer position in queue.
    const { data: position } = useQuery({
        queryKey: ["position", ticketId],
        queryFn: async () => {
            const supabase = supabaseRef.current
            const { data, error } = await supabase.rpc("get_position", {
                ticket_id: ticketId,
            })
            if (error || data === null) throw new Error("Erreur ou position introuvable")
            return data
        },
        // TANSTACK: Conditional fetching. This query won't run at all unless enabled is true.
        enabled: !!ticket && ticket.status === "waiting",
        staleTime: 5000,
    })

    // Derive onboarding visibility from ticket status and initialization state
    const showOnboarding = ticket?.status === "waiting" && !alertsInitialized

    // ── Onboarding ────────────────────────────────────────────────────────────

    const handleEnableAlerts = async () => {
        // Unlock Web Audio (Must be inside user gesture)
        await unlockAudio()
        
        // Request Push Notifications if supported
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
            try {
                await Notification.requestPermission()
            } catch (err) {
                console.error("Erreur permission notifications:", err)
            }
        }

        // Test haptic feedback
        playHapticBuzz()

        try {
            sessionStorage.setItem(`${ALERTS_INIT_KEY}${ticketId}`, "1")
        } catch {
            // Ignore storage errors
        }
        setAlertsInitialized(true)
    }

    // ── Realtime subscription ─────────────────────────────────────────────────
    useEffect(() => {
        const supabase = supabaseRef.current
        const channel = supabase
            .channel(`queue:merchant_id=eq.${merchant.id}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "queue_items",
                    filter: `merchant_id=eq.${merchant.id}`,
                },
                () => {
                    // TANSTACK: When Supabase realtime pushes an event, we invalidate active queries.
                    // Instead of mutating state manually, we just tell TanStack it's stale, 
                    // and it fetches fresh data securely in the background.
                    queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] })
                    queryClient.invalidateQueries({ queryKey: ["position", ticketId] })
                },
            )
            .subscribe((status) => {
                if (status === "SUBSCRIBED") {
                    setConnectionState("connected")
                } else if (status === "CHANNEL_ERROR") {
                    setConnectionState("offline")
                } else if (status === "TIMED_OUT") {
                    setConnectionState("reconnecting")
                }
            })

        return () => {
            supabase.removeChannel(channel)
        }
    }, [merchant.id, ticketId, queryClient])

    // Dynamic page title
    useEffect(() => {
        if (!ticket) return

        if (ticket.status === "called") {
            document.title = "C'est votre tour ! — WaitLight"
        } else if (position !== undefined && position > 0) {
            document.title = `(${position}) En attente — WaitLight`
        } else {
            document.title = `File d'attente — ${merchant.name}`
        }
    }, [ticket, position, merchant.name])

    // Effective prep time: prefer calculated value, fall back to default
    const effectivePrepTime =
        merchant.calculated_avg_prep_time ?? merchant.default_prep_time_min

    // Estimate wait time based on position and effective prep time
    const estimatedWaitMinutes =
        position !== undefined && position > 0
            ? position * effectivePrepTime
            : null

    // ── Client-side Notifications ─────────────────────────────────────────────
    useEffect(() => {
        if (!ticket || ticket.status === "done" || ticket.status === "cancelled") return

        if (calledReminderTimerRef.current) {
            clearInterval(calledReminderTimerRef.current)
            calledReminderTimerRef.current = null
        }

        if (ticket.status !== "called" || calledReminderAcknowledged) {
            return
        }

        const triggerReminder = () => {
            const prefs = merchant.settings

            if (prefs.notification_channels.sound) {
                playSound(prefs.notification_sound)
            }

            if (prefs.notification_channels.vibrate) {
                if ("vibrate" in navigator) {
                    navigator.vibrate([250, 80, 250, 80, 500])
                } else {
                    playHapticBuzz()
                }
            }

            if (
                prefs.notification_channels.push &&
                typeof window !== "undefined" &&
                "Notification" in window &&
                Notification.permission === "granted"
            ) {
                new Notification("C'est votre tour !", {
                    body: `${ticket.customer_name}, présentez-vous au ${serviceDesk}.`,
                    icon: "/favicon.svg",
                    tag: "waitlight-turn",
                })
            }
        }

        triggerReminder()
        calledReminderTimerRef.current = setInterval(triggerReminder, 2500)

        return () => {
            if (calledReminderTimerRef.current) {
                clearInterval(calledReminderTimerRef.current)
                calledReminderTimerRef.current = null
            }
        }
    }, [ticket, calledReminderAcknowledged, merchant.settings, serviceDesk])

    // Approaching notification
    useEffect(() => {
        if (!ticket || ticket.status === "done" || ticket.status === "cancelled") return

        // Approaching notification
        if (
            ticket.status === "waiting" &&
            !hasNotifiedApproachingRef.current &&
            position !== undefined &&
            estimatedWaitMinutes !== null
        ) {
            const s = merchant.settings
            let isApproaching = false

            if (s.approaching_position_enabled && position <= s.approaching_position_threshold) {
                isApproaching = true
            }
            if (s.approaching_time_enabled && estimatedWaitMinutes <= s.approaching_time_threshold_min) {
                isApproaching = true
            }

            if (isApproaching) {
                hasNotifiedApproachingRef.current = true
                const prefs = merchant.settings

                if (prefs.notification_channels.sound) {
                    playSound(prefs.notification_sound)
                }

                if (prefs.notification_channels.vibrate) {
                    if ("vibrate" in navigator) {
                        navigator.vibrate([250, 80, 250, 80, 500])
                    } else {
                        playHapticBuzz()
                    }
                }

                if (
                    prefs.notification_channels.push &&
                    typeof window !== "undefined" &&
                    "Notification" in window &&
                    Notification.permission === "granted"
                ) {
                new Notification(`Vous approchez du ${serviceDesk}`, {
                        body: `${ticket.customer_name}, votre tour approche.`,
                        icon: "/favicon.svg",
                        tag: "waitlight-approaching",
                    })
                }
            }
        }
    }, [ticket, position, estimatedWaitMinutes, merchant.settings, serviceDesk])


    if (ticketNotFound) {
        return (
            <StatusBanner
                variant="error"
                title="Ticket introuvable"
                description="Ce ticket n'existe pas ou a été supprimé."
            />
        )
    }

    if (!ticket) {
        return (
            <div className="flex flex-col items-center gap-4">
                <Spinner size="lg" />
                <p className="text-sm text-text-secondary">
                    Chargement de votre ticket…
                </p>
            </div>
        )
    }

    // Count total waiting (position is 1-based, so it gives us
    // the count of people ahead + 1 for the customer themselves)
    // We default to null if position isn't loaded yet
    const totalWaiting = position ?? null
    
    // Check if we need to show the moderation warning dialog
    const showModerationWarning = ticket.name_flagged && !acknowledgedFlag

    // Same lifecycle as the recovery-code card just below: a ticket can be
    // saved while it's still active, not once it's done or cancelled.
    const canDownloadTicket =
        (ticket.status === "waiting" || ticket.status === "called") && !!ticket.recovery_code

    const recoverUrl = ticket.recovery_code
        ? buildRecoverUrl({
              baseUrl: process.env.NEXT_PUBLIC_BASE_URL ?? "https://waitlight.app",
              slug: merchant.slug,
              customerName: ticket.customer_name,
              code: ticket.recovery_code,
          })
        : ""

    return (
        <div className="flex flex-col gap-4">
            <CustomerWaitView
                status={ticket.status}
                position={position ?? null}
                totalWaiting={totalWaiting}
                estimatedWaitMinutes={estimatedWaitMinutes}
                connectionState={connectionState}
                customerName={ticket.customer_name}
                slug={merchant.slug}
                ticketId={ticketId}
                thankYouTitle={merchant.settings.thank_you_title}
                thankYouMessage={merchant.settings.thank_you_message}
                backgroundUrl={merchant.background_url}
                businessType={merchant.business_type}
            />

            {(ticket.status === "waiting" || ticket.status === "called") &&
                ticket.recovery_code && (
                    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border-default bg-surface-card p-4 shadow-sm">
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                                Code de suivi
                            </span>
                            <span className="text-[11px] text-text-secondary">
                                Notez-le pour retrouver votre place si vous fermez cette page.
                            </span>
                        </div>
                        <span className="font-mono text-2xl font-bold tracking-[0.2em] text-text-primary">
                            {ticket.recovery_code}
                        </span>
                    </div>
                )}

            {canDownloadTicket && (
                <Button
                    variant="secondary"
                    onClick={() => {
                        setDownloadError(null)
                        setTicketDialogOpen(true)
                    }}
                >
                    <Download size={16} aria-hidden="true" />
                    Enregistrer mon ticket
                </Button>
            )}

            {canDownloadTicket && (
                <Dialog open={ticketDialogOpen} onClose={() => setTicketDialogOpen(false)}>
                    <DialogHeader>Votre ticket</DialogHeader>
                    <DialogContent>
                        <div className="flex flex-col items-center gap-4">
                            <TicketDownloadCard
                                ref={ticketCardRef}
                                merchantName={merchant.name}
                                merchantLogoUrl={merchant.logo_url}
                                merchantBrandColor={merchant.brand_color}
                                customerName={ticket.customer_name}
                                position={ticket.status === "waiting" ? (position ?? null) : null}
                                arrivalTimeIso={ticket.joined_at}
                                recoveryCode={ticket.recovery_code ?? ""}
                                recoverUrl={recoverUrl}
                            />
                            {downloadError ? (
                                <p className="text-sm text-feedback-error" role="alert">
                                    {downloadError}
                                </p>
                            ) : null}
                        </div>
                    </DialogContent>
                    <DialogFooter>
                        <Button onClick={handleDownloadTicket} isLoading={isDownloading}>
                            <Download size={16} aria-hidden="true" />
                            Télécharger l&apos;image
                        </Button>
                    </DialogFooter>
                </Dialog>
            )}

            {ticket.status === "called" && !calledReminderAcknowledged && (
                <Dialog open onClose={() => setCalledReminderAcknowledged(true)}>
                    <DialogHeader>C&apos;est votre tour</DialogHeader>
                    <DialogContent>
                        <p className="text-sm text-text-secondary">
                            Les rappels vont se répéter toutes les quelques secondes jusqu&apos;à ce
                            que vous confirmiez avoir compris qu&apos;il faut aller chercher votre commande.
                        </p>
                    </DialogContent>
                    <DialogFooter>
                        <Button onClick={() => setCalledReminderAcknowledged(true)}>
                            J&apos;ai compris, j&apos;y vais
                        </Button>
                    </DialogFooter>
                </Dialog>
            )}

            <Dialog 
                open={showModerationWarning} 
                onClose={() => setAcknowledgedFlag(true)}
            >
                <DialogHeader>Nom modifié par modération</DialogHeader>
                <DialogContent>
                    <p className="text-sm text-text-secondary">
                        Votre prénom ou surnom a été signalé pour contenu inapproprié et a été supprimé.
                        Vous apparaissez désormais sous le nom : <strong className="text-text-primary">{ticket.customer_name}</strong>.
                    </p>
                </DialogContent>
                <DialogFooter>
                    <Button onClick={() => setAcknowledgedFlag(true)}>
                        J&apos;ai compris
                    </Button>
                </DialogFooter>
            </Dialog>

            <Dialog 
                open={showOnboarding} 
                onClose={() => {}} // Force user to click the button
            >
                <DialogHeader>Activer les alertes</DialogHeader>
                <DialogContent>
                    <div className="flex flex-col gap-5 py-2">
                        <p className="text-sm text-text-secondary leading-relaxed">
                            Pour être certain de ne pas rater votre tour, nous avons besoin d&apos;activer les alertes sonores et visuelles sur votre appareil.
                        </p>
                        
                        <div className="grid grid-cols-1 gap-3">
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-base border border-border-default">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
                                    <BellRing size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-text-primary">Alertes Sonores</span>
                                    <span className="text-xs text-text-secondary">Un signal retentira à l&apos;appel</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-base border border-border-default">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
                                    <Smartphone size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-text-primary">Vibrations</span>
                                    <span className="text-xs text-text-secondary">Sensation tactile (si supporté)</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-base border border-border-default">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
                                    <MessageSquare size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-text-primary">Notifications Push</span>
                                    <span className="text-xs text-text-secondary">Bannière même écran éteint</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                            <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                            <p className="text-xs text-amber-900/80 leading-tight">
                                <strong>Important :</strong> Pour entendre le signal, assurez-vous que votre téléphone n&apos;est pas en mode silencieux.
                            </p>
                        </div>
                    </div>
                </DialogContent>
                <DialogFooter>
                    <Button 
                        onClick={handleEnableAlerts} 
                        className="w-full h-12 text-base shadow-lg shadow-brand-primary/20"
                    >
                        Activer les alertes
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    )
}

export { WaitClient }
