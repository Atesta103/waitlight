"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { QRCodeSVG } from "qrcode.react"
import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils/cn"
import { generateQrTokenAction } from "@/lib/actions/qr"
import { QR_ROTATION_INTERVAL_MS } from "@/lib/utils/qr-config"
import { Maximize2, Minimize2, AlertTriangle } from "lucide-react"

type TokenState = {
    nonce: string
    url: string
}

type QRCodeDisplayProps = {
    slug: string
    merchantName: string
    baseUrl?: string
    size?: number
    showFullscreenButton?: boolean
    className?: string
}

/**
 * QRCodeDisplay — rotating secure QR code with countdown ring.
 *
 * Generates a new cryptographic one-time token every QR_ROTATION_INTERVAL_MS,
 * crossfades to the new QR code with Framer Motion, and shows a countdown ring.
 * Handles token failures with exponential backoff and offline detection.
 */
function QRCodeDisplay({
    slug,
    merchantName,
    baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://waitlight.app",
    size = 240,
    showFullscreenButton = true,
    className,
}: QRCodeDisplayProps) {
    const prefersReduced = useReducedMotion()
    const [token, setToken] = useState<TokenState | null>(null)
    const [countdown, setCountdown] = useState(QR_ROTATION_INTERVAL_MS / 1000)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [isOffline, setIsOffline] = useState(false)
    const retryRef = useRef(0)
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const isOfflineRef = useRef(false)

    // ── Token generation ──────────────────────────────────────────────────────
    const generateToken = useCallback(async () => {
        if (isOfflineRef.current) return

        try {
            const result = await generateQrTokenAction()
            if ("error" in result) {
                setError(result.error)
                const delay = Math.min(2000 * 2 ** retryRef.current, 30_000)
                retryRef.current += 1
                setTimeout(generateToken, delay)
                return
            }
            retryRef.current = 0
            setError(null)
            const { nonce } = result.data
            const url = `${baseUrl}/${slug}/join?token=${nonce}`
            setToken({ nonce, url })
            setCountdown(QR_ROTATION_INTERVAL_MS / 1000)
        } catch {
            setError("Actualisation du QR échouée — nouvelle tentative…")
            const delay = Math.min(2000 * 2 ** retryRef.current, 30_000)
            retryRef.current += 1
            setTimeout(generateToken, delay)
        } finally {
            setIsLoading(false)
        }
    }, [slug, baseUrl])

    // ── Initial + rotation interval ───────────────────────────────────────────
    useEffect(() => {
        generateToken()

        intervalRef.current = setInterval(() => {
            generateToken()
        }, QR_ROTATION_INTERVAL_MS)

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [generateToken])

    // ── Countdown tick (resets when token nonce changes) ──────────────────────
    useEffect(() => {
        const tick = setInterval(() => {
            setCountdown((c) => Math.max(0, c - 1))
        }, 1_000)
        return () => clearInterval(tick)
    }, [token?.nonce])

    // ── Offline / online detection ────────────────────────────────────────────
    useEffect(() => {
        const handleOffline = () => {
            isOfflineRef.current = true
            setIsOffline(true)
            setError("Connexion perdue — la rotation est suspendue.")
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
        const handleOnline = () => {
            isOfflineRef.current = false
            setIsOffline(false)
            setError(null)
            generateToken()
            intervalRef.current = setInterval(generateToken, QR_ROTATION_INTERVAL_MS)
        }
        window.addEventListener("offline", handleOffline)
        window.addEventListener("online", handleOnline)
        return () => {
            window.removeEventListener("offline", handleOffline)
            window.removeEventListener("online", handleOnline)
        }
    }, [generateToken])

    // ── Fullscreen toggle ─────────────────────────────────────────────────────
    const toggleFullscreen = useCallback(async () => {
        if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen()
        } else {
            await document.exitFullscreen()
        }
    }, [])

    useEffect(() => {
        const handleChange = () => {
            setIsFullscreen(!!document.fullscreenElement)
        }
        document.addEventListener("fullscreenchange", handleChange)
        return () => document.removeEventListener("fullscreenchange", handleChange)
    }, [])

    // ── Countdown ring geometry ───────────────────────────────────────────────
    const totalSeconds = QR_ROTATION_INTERVAL_MS / 1000
    const ringPadding = 16 // px on each side
    const svgSize = size + ringPadding * 2
    const cx = svgSize / 2
    const cy = svgSize / 2
    const radius = size / 2 + ringPadding / 2 - 2
    const circumference = 2 * Math.PI * radius
    const dashOffset = circumference * (1 - countdown / totalSeconds)

    return (
        <Card className={cn("w-full max-w-sm", className)}>
            <CardContent className="flex flex-col items-center gap-5 p-6">
                {/* Error/offline banner */}
                {error && (
                    <div
                        role="alert"
                        className="flex w-full items-center gap-2 rounded-lg bg-feedback-error-bg px-3 py-2 text-sm text-feedback-error"
                    >
                        <AlertTriangle size={16} aria-hidden="true" />
                        {error}
                    </div>
                )}

                {/* QR code + countdown ring wrapper */}
                <div
                    className="relative flex items-center justify-center"
                    style={{ width: svgSize, height: svgSize }}
                >
                    {/* SVG countdown ring — sits behind the QR */}
                    <svg
                        className="absolute inset-0 pointer-events-none"
                        width={svgSize}
                        height={svgSize}
                        aria-hidden="true"
                    >
                        {/* Track ring */}
                        <circle
                            cx={cx}
                            cy={cy}
                            r={radius}
                            fill="none"
                            stroke="var(--color-border-default)"
                            strokeWidth={3}
                        />
                        {/* Progress ring */}
                        <circle
                            cx={cx}
                            cy={cy}
                            r={radius}
                            fill="none"
                            stroke="var(--color-brand-primary)"
                            strokeWidth={3}
                            strokeDasharray={circumference}
                            strokeDashoffset={dashOffset}
                            strokeLinecap="round"
                            transform={`rotate(-90 ${cx} ${cy})`}
                            style={{
                                transition: prefersReduced
                                    ? "none"
                                    : "stroke-dashoffset 0.95s linear",
                            }}
                        />
                    </svg>

                    {/* QR code with crossfade on token change */}
                    <div
                        className="relative z-10 overflow-hidden rounded-xl bg-white p-3 shadow-sm"
                        style={{ width: size, height: size }}
                    >
                        <AnimatePresence mode="wait">
                            {isLoading ? (
                                <motion.div
                                    key="skeleton"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="h-full w-full animate-pulse rounded-lg bg-surface-base"
                                    aria-label="Génération du QR Code…"
                                />
                            ) : token ? (
                                <motion.div
                                    key={token.nonce}
                                    initial={prefersReduced ? false : { opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={prefersReduced ? {} : { opacity: 0 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    <QRCodeSVG
                                        value={token.url}
                                        size={size - 24}
                                        bgColor="#ffffff"
                                        fgColor="#000000"
                                        level="H"
                                        aria-label={`QR Code pour rejoindre la file de ${merchantName}`}
                                    />
                                </motion.div>
                            ) : null}
                        </AnimatePresence>
                    </div>

                    {/* Countdown badge */}
                    <div
                        className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 rounded-full bg-surface-card px-2.5 py-0.5 text-xs font-semibold text-text-secondary shadow-sm ring-1 ring-border-default"
                        aria-hidden="true"
                    >
                        {countdown}s
                    </div>
                </div>

                {/* Branding */}
                <div className="mt-2 text-center">
                    <p className="text-base font-bold text-text-primary">
                        {merchantName}
                    </p>
                    <p className="mt-0.5 text-sm text-text-secondary">
                        Scannez pour rejoindre la file
                    </p>
                </div>

                {/* Fullscreen toggle */}
                {showFullscreenButton && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleFullscreen}
                        aria-label={
                            isFullscreen
                                ? "Quitter le mode plein écran"
                                : "Passer en plein écran (mode kiosque)"
                        }
                        className="w-full"
                    >
                        {isFullscreen ? (
                            <Minimize2 size={16} aria-hidden="true" />
                        ) : (
                            <Maximize2 size={16} aria-hidden="true" />
                        )}
                        {isFullscreen ? "Quitter le plein écran" : "Mode kiosque"}
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}

export { QRCodeDisplay, type QRCodeDisplayProps }
