"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { QRCodeCanvas } from "qrcode.react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils/cn"
import { Camera } from "lucide-react"
import { Skeleton } from "@/components/ui/Skeleton"
import { Button } from "@/components/ui/Button"
import { QR_ROTATION_INTERVAL_MS } from "@/lib/utils/qr-config"
import {
    generateQrTokenAction,
    generateAssistedQrTokenAction,
    checkQrTokenUsedAction,
} from "@/lib/actions/qr"
import { getBusinessWording } from "@/lib/utils/business-wording"

/** Shared with server-side validation — see lib/utils/qr-token.ts */
const REFRESH_INTERVAL_MS = QR_ROTATION_INTERVAL_MS
const TOTAL_S = REFRESH_INTERVAL_MS / 1000
/** Poll interval to detect that the currently displayed assisted QR was scanned. */
const ASSISTED_POLL_INTERVAL_MS = 2000

type QRCodeDisplayProps = {
    slug: string
    businessType?: string | null
    baseUrl?: string
    /** Pixel size of the QR code. Default 220. */
    size?: number
    className?: string
    /** Si true, désactive les appels API et l'intervalle de rafraîchissement (pour les démos marketing) */
    mockMode?: boolean
    /**
     * "kiosk" (défaut) : QR rotatif toutes les 15s, affiché en libre-service.
     * "assisted" : QR unique généré à la volée, montré par le commerçant à
     * un client précis au moment de la prise en charge. Pas de rotation.
     */
    mode?: "kiosk" | "assisted"
    /**
     * Optional actions rendered inside this same card, below the QR zone,
     * separated by a top border — lets a caller (e.g. the dashboard) anchor
     * its own buttons to the bottom of the card when it's stretched to a
     * given height via `className`, without a second, visually separate card.
     */
    footer?: React.ReactNode
}

/* ─── Main component ────────────────────────────────────────────────────────── */
function QRCodeDisplay({
    slug,
    businessType,
    baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://waitlight.app",
    size = 220,
    className,
    mockMode = false,
    mode = "kiosk",
    footer,
}: QRCodeDisplayProps) {
    const isAssisted = mode === "assisted"
    const wording = getBusinessWording(businessType)
    const [token, setToken] = useState<string | null>(null)
    const [fetchedAt, setFetchedAt] = useState<number | null>(null)
    const [countdown, setCountdown] = useState(TOTAL_S)
    const [progress, setProgress] = useState(1) // 0 to 1 for smooth animation
    const [qrVisible, setQrVisible] = useState(false) // Wait for first token

    const url = `${baseUrl}/${slug}/join`
    const qrValue = token ? `${url}?t=${token}` : url

    // Guards against overlapping fetchToken calls (e.g. React StrictMode's
    // double effect invocation in dev, or rapid manual clicks): only the
    // most recently started request is allowed to apply its result.
    const requestIdRef = useRef(0)

    const fetchToken = useCallback(async () => {
        if (mockMode) return

        const requestId = ++requestIdRef.current

        // Defer setState to avoid synchronous setState in effect body
        setTimeout(() => setQrVisible(false), 0)
        const result = isAssisted
            ? await generateAssistedQrTokenAction()
            : await generateQrTokenAction()

        // Wait for skeleton animation
        setTimeout(() => {
            if (requestIdRef.current !== requestId) return // superseded by a newer fetch

            if ("data" in result) {
                setToken(result.data.nonce)
                setFetchedAt(Date.now())
            }
            setCountdown(TOTAL_S)
            setProgress(1)
            setQrVisible(true)
        }, 300)
    }, [mockMode, isAssisted])

    /* Rotate token every REFRESH_INTERVAL_MS — kiosk mode only. Assisted mode
       fetches once and waits for the merchant to request the next code. */
    useEffect(() => {
        if (mockMode) {
            // Defer to avoid synchronous setState inside effect
            const t = setTimeout(() => {
                setQrVisible(true)
                setFetchedAt(Date.now())
            }, 0)
            return () => clearTimeout(t)
        }

        fetchToken() // Initial fetch

        if (isAssisted) return

        const tick = setInterval(() => {
            fetchToken()
        }, REFRESH_INTERVAL_MS)
        return () => clearInterval(tick)
    }, [mockMode, isAssisted, fetchToken])

    /* Precision timer — visual countdown based on rotation interval, not token TTL.
       Not relevant in assisted mode since there's no rotation to count down to. */
    useEffect(() => {
        if (isAssisted || !token || !fetchedAt) return

        const visualExpiry = fetchedAt + REFRESH_INTERVAL_MS

        const timer = setInterval(() => {
            const now = Date.now()
            const remaining = Math.max(0, visualExpiry - now)
            const p = remaining / REFRESH_INTERVAL_MS

            setProgress(p)
            setCountdown(Math.ceil(remaining / 1000))
        }, 50) // 20fps for progress updates

        return () => clearInterval(timer)
    }, [isAssisted, token, fetchedAt])

    /* Assisted mode: poll to detect the current QR was scanned, then
       auto-generate a fresh one for the next customer. */
    useEffect(() => {
        if (mockMode || !isAssisted || !token) return

        const poll = setInterval(async () => {
            const result = await checkQrTokenUsedAction(token)
            if ("data" in result && result.data.used) {
                fetchToken()
            }
        }, ASSISTED_POLL_INTERVAL_MS)

        return () => clearInterval(poll)
    }, [mockMode, isAssisted, token, fetchToken])

    const color =
        countdown >= 7
            ? "var(--color-feedback-success)"
            : countdown >= 4
              ? "var(--color-feedback-warning)"
              : "var(--color-feedback-error)"

    // Geometry calculations for pixel-perfect alignment
    const strokeWidth = 3
    const qrContainerSize = size + 16 // QR + white padding (rounded-lg)
    const padding = 8 // larger gap for visibility
    const viewSize = qrContainerSize + (padding + strokeWidth) * 2

    const center = viewSize / 2
    const start = strokeWidth / 2
    const edge = viewSize - strokeWidth / 2

    // Exact concentric radius calculation
    // QR container has rounded-lg (8px).
    // The distance from QR edge to stroke center is (padding + strokeWidth/2)
    const innerRadius = 8
    const r = innerRadius + padding + strokeWidth / 2

    // Path d for a rounded rect starting top-center
    const d = `
        M ${center} ${start}
        H ${edge - r}
        A ${r} ${r} 0 0 1 ${edge} ${start + r}
        V ${edge - r}
        A ${r} ${r} 0 0 1 ${edge - r} ${edge}
        H ${start + r}
        A ${r} ${r} 0 0 1 ${start} ${edge - r}
        V ${start + r}
        A ${r} ${r} 0 0 1 ${start + r} ${start}
        Z
    `

    return (
        <div
            className={cn(
                "flex flex-col",
                mockMode
                    ? "w-full max-w-sm rounded-2xl border border-[#E5E7EB] bg-white shadow-md"
                    : "w-full max-w-sm rounded-2xl border border-border-default bg-surface-card shadow-md",
                className,
            )}
        >
            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="flex flex-col items-center gap-0.5 border-b border-border-default px-6 py-4">
                <p className={cn("text-center text-sm font-semibold", mockMode ? "text-[#111827]" : "text-text-primary")}>
                    Scannez pour {wording.joinCta.toLowerCase()}
                </p>
                <p className={cn("text-xs", mockMode ? "text-[#6B7280]" : "text-text-secondary")}>{slug}</p>
            </div>

            {/* ── QR zone ─────────────────────────────────────────────────── */}
            {/* flex-1 + justify-center: when the card is stretched taller than
                its natural content (via className, e.g. h-full from a caller
                matching a sibling's height), this is the block that absorbs
                and centers in the extra space — header and footer keep their
                natural height either side of it. */}
            <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-8">
                {/* Countdown Label - Centered above QR (kiosk mode only) */}
                {isAssisted ? (
                    <span className={cn("text-[10px] uppercase tracking-wider", mockMode ? "text-[#6B7280]" : "text-text-secondary")}>
                        QR à usage unique
                    </span>
                ) : (
                    <div className="flex flex-col items-center gap-1">
                        <span
                            className="text-2xl font-bold tabular-nums transition-colors duration-300"
                            style={{ color }}
                        >
                            {countdown}s
                        </span>
                        <span className={cn("text-[10px] uppercase tracking-wider", mockMode ? "text-[#6B7280]" : "text-text-secondary")}>
                            Prochain code
                        </span>
                    </div>
                )}

                {/* QR Container */}
                <div
                    className="relative flex items-center justify-center"
                    style={{ width: viewSize, height: viewSize }}
                >
                    {/* SVG Progress Border — kiosk mode only, no rotation to show in assisted mode */}
                    {!isAssisted && (
                        <div className="absolute inset-0 z-0">
                            <svg
                                width={viewSize}
                                height={viewSize}
                                viewBox={`0 0 ${viewSize} ${viewSize}`}
                                className="h-full w-full"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                {/* Background track - subtle but visible */}
                                <path d={d} stroke="currentColor" strokeWidth={strokeWidth} className={mockMode ? "text-[#D1D5DB]" : "text-text-secondary/10"} />
                                {/* Animated path */}
                                <motion.path
                                    d={d}
                                    stroke={color}
                                    strokeWidth={strokeWidth}
                                    strokeLinecap="round"
                                    initial={{ pathLength: 1 }}
                                    animate={{ pathLength: progress }}
                                    transition={{
                                        duration: progress > 0.95 ? 0 : 0.05,
                                        ease: "linear",
                                    }}
                                />
                            </svg>
                        </div>
                    )}

                    {/* QR Code itself */}
                    <div
                        className="relative z-10 overflow-hidden rounded-lg bg-white p-2 shadow-sm"
                        style={{
                            width: qrContainerSize,
                            height: qrContainerSize,
                            boxShadow: "0 0 0 1px rgba(0,0,0,0.05)", // Subtle inner border
                        }}
                    >
                        <div className="relative flex h-full w-full items-center justify-center">
                            <QRCodeCanvas
                                value={qrValue}
                                size={size}
                                marginSize={0}
                                bgColor="#FFFFFF"
                                fgColor="#000000"
                                aria-label="QR Code pour rejoindre la file d'attente"
                                style={{
                                    display: "block",
                                    width: "100%",
                                    height: "100%",
                                }}
                            />
                            {!qrVisible && (
                                <div className="absolute inset-0 z-20">
                                    <Skeleton className="h-full w-full rounded" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Footer hint ─────────────────────────────────────────── */}
                <div className={cn("flex items-center gap-1.5 whitespace-nowrap text-sm font-medium", mockMode ? "text-[#6B7280]" : "text-text-secondary")}>
                    <Camera size={14} aria-hidden="true" className="shrink-0" />
                    <span>Flashez ce code avec votre appareil photo</span>
                </div>

                {isAssisted && !mockMode && (
                    <Button type="button" variant="secondary" size="sm" onClick={fetchToken}>
                        Générer un nouveau QR
                    </Button>
                )}
            </div>

            {footer ? (
                <div className="flex flex-wrap items-center justify-center gap-2 border-t border-border-default px-6 py-4">
                    {footer}
                </div>
            ) : null}
        </div>
    )
}

export { QRCodeDisplay, type QRCodeDisplayProps }
