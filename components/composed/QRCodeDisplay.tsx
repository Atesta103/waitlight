"use client"

import { useRef } from "react"
import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils/cn"
import { Download, QrCode, Copy, Check } from "lucide-react"
import { useState } from "react"

type QRCodeDisplayProps = {
    slug: string
    baseUrl?: string
    size?: number
    className?: string
}

function QRCodeDisplay({
    slug,
    baseUrl = "https://waitlight.app",
    size = 200,
    className,
}: QRCodeDisplayProps) {
    const [copied, setCopied] = useState(false)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const url = `${baseUrl}/${slug}/join`

    /* Minimal QR placeholder — in production, use qrcode.react */
    const handleDownload = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        const link = document.createElement("a")
        link.download = `qr-${slug}.png`
        link.href = canvas.toDataURL("image/png")
        link.click()
    }

    const handleCopy = async () => {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Card className={cn("max-w-sm", className)}>
            <CardContent>
                <div className="flex flex-col items-center gap-4">
                    {/* QR Code placeholder — visual demo area */}
                    <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border-default bg-white p-4">
                        <canvas
                            ref={canvasRef}
                            width={size}
                            height={size}
                            className="rounded"
                            aria-label={`QR Code pour ${url}`}
                        >
                            {/* Render a placeholder grid pattern */}
                        </canvas>
                        {/* Overlay icon for visual demo */}
                        <div className="absolute flex flex-col items-center gap-2 text-text-secondary">
                            <QrCode size={64} strokeWidth={1} />
                            <span className="text-xs font-medium">QR Code</span>
                        </div>
                    </div>

                    {/* URL display */}
                    <div className="flex w-full items-center gap-2 rounded-md border border-border-default bg-surface-base px-3 py-2">
                        <span className="flex-1 truncate text-sm text-text-secondary">
                            {url}
                        </span>
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="shrink-0 rounded p-1 text-text-secondary transition-colors hover:text-text-primary focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:outline-none"
                            aria-label="Copier le lien"
                        >
                            {copied ? (
                                <Check
                                    size={16}
                                    className="text-feedback-success"
                                />
                            ) : (
                                <Copy size={16} />
                            )}
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="flex w-full gap-2">
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleDownload}
                            className="flex-1"
                        >
                            <Download size={16} aria-hidden="true" />
                            Télécharger PNG
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export { QRCodeDisplay, type QRCodeDisplayProps }
