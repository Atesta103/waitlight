"use client"

import { useState, useEffect } from "react"
import { QRCodeCanvas } from "qrcode.react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils/cn"
import { Copy, Check, Camera } from "lucide-react"
import { duration } from "@/lib/utils/motion"
import { Skeleton } from "@/components/ui/Skeleton"
import { QR_REFRESH_INTERVAL_MS } from "@/lib/utils/qr-token"

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

/* ─── Countdown ring ────────────────────────────────────────────────────────── */
function CountdownRing({ remaining }: { remaining: number }) {
    const R = 16
    const cx = 20
    const cy = 20
    const circumference = 2 * Math.PI * R
    /* fraction of arc still remaining — goes from 1 → 0 */
    const fraction = remaining / TOTAL_S
    /* dashoffset: 0 = full ring, circumference = empty ring */
    const dashOffset = circumference * (1 - fraction)

    /* Color shifts: green ≥ 7 s, orange ≥ 4 s, red < 4 s */
    const color =
        remaining >= 7
            ? "var(--color-feedback-success)"
            : remaining >= 4
              ? "var(--color-feedback-warning)"
              : "var(--color-feedback-error)"

    return (
        <svg
            width={40}
            height={40}
            viewBox="0 0 40 40"
            aria-label={`Renouvellement dans ${remaining} secondes`}
            role="timer"
        >
            {/* White disc background so it sits cleanly over the QR corner */}
            <circle cx={cx} cy={cy} r={19} fill="var(--color-surface-card)" />
            {/* Track */}
            <circle
                cx={cx}
                cy={cy}
                r={R}
                fill="none"
                strokeWidth={2.5}
                stroke="var(--color-border-default)"
            />
            {/* Progress arc — counter-clockwise: rotate(-90deg) + scaleY(-1) */}
            <circle
                cx={cx}
                cy={cy}
                r={R}
                fill="none"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                stroke={color}
                style={{
                    transform: "rotate(-90deg) scaleY(-1)",
                    transformOrigin: `${cx}px ${cy}px`,
                    transition: "stroke-dashoffset 1s linear, stroke 0.4s ease",
                }}
            />
            {/* Seconds label */}
            <text
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={10}
                fontWeight={600}
                fill={color}
                style={{ transition: "fill 0.4s ease" }}
            >
                {remaining}
            </text>
        </svg>
    )
}

/* ─── L-shaped corner bracket ──────────────────────────────────────────────── */
function CornerBracket({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
    const classes = {
        tl: "top-0 left-0 border-t-2 border-l-2 rounded-tl-lg",
        tr: "top-0 right-0 border-t-2 border-r-2 rounded-tr-lg",
        bl: "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg",
        br: "bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg",
    }
    return (
        <span
            className={cn(
                "absolute h-6 w-6 border-brand-primary",
                classes[position],
            )}
            aria-hidden="true"
        />
    )
}

/* ─── Main component ────────────────────────────────────────────────────────── */
function QRCodeDisplay({
    slug,
    baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://waitlight.app",
    size = 220,
    className,
}: QRCodeDisplayProps) {
    const [copied, setCopied] = useState(false)
    const [token, setToken] = useState(() =>
        Math.floor(Date.now() / REFRESH_INTERVAL_MS),
    )
    const [countdown, setCountdown] = useState(TOTAL_S)
    const [qrVisible, setQrVisible] = useState(true)

    const url = `${baseUrl}/${slug}/join`
    const qrValue = `${url}?t=${token}`

    /* Rotate token every REFRESH_INTERVAL_MS */
    useEffect(() => {
        const tick = setInterval(() => {
            setQrVisible(false)
            setTimeout(() => {
                setToken(Math.floor(Date.now() / REFRESH_INTERVAL_MS))
                setCountdown(TOTAL_S)
                setQrVisible(true)
            }, 300)
        }, REFRESH_INTERVAL_MS)
        return () => clearInterval(tick)
    }, [])

    /* Per-second countdown */
    useEffect(() => {
        const tick = setInterval(() => {
            setCountdown((s) => Math.max(1, s - 1))
        }, 1000)
        return () => clearInterval(tick)
    }, [token])

    const handleCopy = async () => {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

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
            <div className="flex flex-col items-center gap-4 px-6 py-5">
                {/* Frame — CountdownRing badges the top-right corner */}
                <div className="relative rounded-xl bg-white p-3 shadow-sm ring-1 ring-border-default">
                    <CornerBracket position="tl" />
                    <CornerBracket position="tr" />
                    <CornerBracket position="bl" />
                    <CornerBracket position="br" />

                    {/* Countdown ring — top-right, half-outside the frame */}
                    <div className="absolute -right-5 -top-5 z-10 drop-shadow-sm">
                        <CountdownRing remaining={countdown} />
                    </div>

                    {/* Fixed-size container — height never shifts during refresh */}
                    <div
                        style={{ width: size, height: size }}
                        className="relative"
                    >
                        <QRCodeCanvas
                            value={qrValue}
                            size={size}
                            marginSize={0}
                            aria-label="QR Code pour rejoindre la file d'attente"
                            style={{ display: "block", borderRadius: "6px" }}
                        />
                        {!qrVisible && (
                            <div className="absolute inset-0">
                                <Skeleton className="h-full w-full rounded" />
                            </div>
                        )}
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
