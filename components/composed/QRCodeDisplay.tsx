"use client"

import { useState, useEffect } from "react"
import { QRCodeCanvas } from "qrcode.react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils/cn"
import { Copy, Check, Camera } from "lucide-react"
import { duration } from "@/lib/utils/motion"
import { Skeleton } from "@/components/ui/Skeleton"
import { QR_REFRESH_INTERVAL_MS } from "@/lib/utils/qr-token"
import { generateQrTokenAction } from "@/lib/actions/qr"

/** Shared with server-side validation — see lib/utils/qr-token.ts */
const REFRESH_INTERVAL_MS = QR_REFRESH_INTERVAL_MS
const TOTAL_S = REFRESH_INTERVAL_MS / 1000

type QRCodeDisplayProps = {
    slug: string
    baseUrl?: string
    /** Pixel size of the QR code. Default 220. */
    size?: number
    className?: string
}


/* ─── Main component ────────────────────────────────────────────────────────── */
function QRCodeDisplay({
    slug,
    baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://waitlight.app",
    size = 220,
    className,
}: QRCodeDisplayProps) {
    const [copied, setCopied] = useState(false)
    const [token, setToken] = useState<string | null>(null)
    const [countdown, setCountdown] = useState(TOTAL_S)
    const [progress, setProgress] = useState(1) // 0 to 1 for smooth animation
    const [qrVisible, setQrVisible] = useState(false) // Wait for first token

    const url = `${baseUrl}/${slug}/join`
    const qrValue = token ? `${url}?t=${token}` : url

    const fetchToken = async () => {
        setQrVisible(false)
        const result = await generateQrTokenAction()

        // Wait for skeleton animation
        setTimeout(() => {
            if ("data" in result) {
                setToken(result.data.nonce)
            }
            // Ideally handle error if it fails
            setCountdown(TOTAL_S)
            setProgress(1)
            setQrVisible(true)
        }, 300)
    }

    /* Rotate token every REFRESH_INTERVAL_MS */
    useEffect(() => {
        fetchToken() // Initial fetch

        const tick = setInterval(() => {
            fetchToken()
        }, REFRESH_INTERVAL_MS)
        return () => clearInterval(tick)
    }, [])

    /* Precision timer for smooth animation and exact 0s end */
    useEffect(() => {
        if (!token) return

        const startTime = Date.now()
        const endTime = startTime + REFRESH_INTERVAL_MS

        const timer = setInterval(() => {
            const now = Date.now()
            const remaining = Math.max(0, endTime - now)
            const p = remaining / REFRESH_INTERVAL_MS
            
            setProgress(p)
            setCountdown(Math.ceil(remaining / 1000))
        }, 50) // 20fps for progress updates

        return () => clearInterval(timer)
    }, [token])

    const handleCopy = async () => {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

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
                "w-full max-w-sm rounded-2xl border border-border-default bg-surface-card shadow-md",
                className,
            )}
        >
            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="flex flex-col items-center gap-0.5 border-b border-border-default px-6 py-4">
                <p className="text-center text-sm font-semibold text-text-primary">
                    Scannez pour rejoindre la file d&apos;attente
                </p>
                <p className="text-xs text-text-secondary">{slug}</p>
            </div>

            {/* ── QR zone ─────────────────────────────────────────────────── */}
            <div className="flex flex-col items-center gap-6 px-6 py-8">
                {/* Countdown Label - Centered above QR */}
                <div className="flex flex-col items-center gap-1">
                    <span
                        className="text-2xl font-bold tabular-nums transition-colors duration-300"
                        style={{ color }}
                    >
                        {countdown}s
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-text-secondary">
                        Prochain code
                    </span>
                </div>

                {/* QR Container */}
                <div 
                    className="relative flex items-center justify-center"
                    style={{ width: viewSize, height: viewSize }}
                >
                    {/* SVG Progress Border */}
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
                            <path
                                d={d}
                                stroke="currentColor"
                                strokeWidth={strokeWidth}
                                className="text-text-secondary/10"
                            />
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

                    {/* QR Code itself */}
                    <div 
                        className="relative z-10 overflow-hidden rounded-lg bg-white p-2 shadow-sm"
                        style={{ 
                            width: qrContainerSize, 
                            height: qrContainerSize,
                            boxShadow: "0 0 0 1px rgba(0,0,0,0.05)" // Subtle inner border
                        }}
                    >
                        <div className="relative flex h-full w-full items-center justify-center">
                            <QRCodeCanvas
                                value={qrValue}
                                size={size}
                                marginSize={0}
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

                {/* ── URL bar ─────────────────────────────────────────────── */}
                <div className="flex w-full items-center gap-2 rounded-lg border border-border-default bg-surface-base px-3 py-2">
                    <span className="flex-1 truncate font-mono text-xs text-text-secondary">
                        {url}
                    </span>
                    <button
                        type="button"
                        onClick={handleCopy}
                        className="min-h-7 min-w-7 shrink-0 rounded-md p-1 text-text-secondary transition-colors hover:bg-brand-primary/10 hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                        aria-label="Copier le lien"
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            {copied ? (
                                <motion.span
                                    key="check"
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.5, opacity: 0 }}
                                    transition={{ duration: duration.fast }}
                                >
                                    <Check
                                        size={15}
                                        className="text-feedback-success"
                                    />
                                </motion.span>
                            ) : (
                                <motion.span
                                    key="copy"
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.5, opacity: 0 }}
                                    transition={{ duration: duration.fast }}
                                >
                                    <Copy size={15} />
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </button>
                </div>

                {/* ── Footer hint ─────────────────────────────────────────── */}
                <div className="flex items-center gap-1.5 whitespace-nowrap text-sm font-medium text-text-secondary">
                    <Camera size={14} aria-hidden="true" className="shrink-0" />
                    <span>Flashez ce code avec votre appareil photo</span>
                </div>
            </div>
        </div>
    )
}

export { QRCodeDisplay, type QRCodeDisplayProps }
