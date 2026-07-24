"use client"

import { forwardRef } from "react"
import { QRCodeCanvas } from "qrcode.react"
import { cn } from "@/lib/utils/cn"
import { formatArrivalTime } from "@/lib/utils/ticket-download"

type TicketCardProps = {
    merchantName: string
    merchantLogoUrl: string | null
    /** Falls back to the app's own brand color when the merchant has none set. */
    merchantBrandColor: string | null
    customerName: string
    /**
     * Live queue position at the moment the ticket was saved — a snapshot,
     * never updated after. Null when unavailable (e.g. the ticket has
     * already been called, when position is no longer meaningful).
     */
    position: number | null
    arrivalTimeIso: string
    recoveryCode: string
    /** Full URL encoded in the QR code — see buildRecoverUrl. */
    recoverUrl: string
    className?: string
}

const DEFAULT_BRAND_COLOR = "#6366f1"

/**
 * The visual captured to PNG when a customer downloads their ticket. Pure
 * presentation — no state, no network calls — so it renders identically
 * whether shown live in a dialog or captured off-screen.
 */
const TicketCard = forwardRef<HTMLDivElement, TicketCardProps>(function TicketCard(
    {
        merchantName,
        merchantLogoUrl,
        merchantBrandColor,
        customerName,
        position,
        arrivalTimeIso,
        recoveryCode,
        recoverUrl,
        className,
    },
    ref,
) {
    const brandColor = merchantBrandColor ?? DEFAULT_BRAND_COLOR

    return (
        <div
            ref={ref}
            className={cn(
                // max-w rather than a fixed width: the ticket must still fit
                // the Dialog's own width on a narrow phone (Dialog caps at
                // calc(100%-2rem), ~288px on a 320px-wide screen) — a hard
                // 340px would overflow there. html-to-image captures whatever
                // size actually rendered, so shrinking here is harmless.
                "flex w-full max-w-[340px] flex-col overflow-hidden rounded-2xl border border-border-default bg-surface-card",
                className,
            )}
        >
            <div
                className="flex items-center gap-3 p-5"
                style={{ backgroundColor: brandColor }}
            >
                {merchantLogoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={merchantLogoUrl}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-lg object-cover"
                    />
                ) : (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/20 text-lg font-bold text-white">
                        {merchantName.trim().charAt(0).toUpperCase() || "?"}
                    </span>
                )}
                <span className="truncate text-lg font-bold text-white">
                    {merchantName}
                </span>
            </div>

            <div className="flex flex-col gap-4 p-5">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 flex-col">
                        <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                            Client
                        </span>
                        <span className="truncate text-base font-bold text-text-primary">
                            {customerName}
                        </span>
                    </div>
                    {position !== null ? (
                        <div className="flex shrink-0 flex-col items-end">
                            <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                                Position
                            </span>
                            <span className="text-base font-bold text-text-primary">
                                #{position}
                            </span>
                        </div>
                    ) : null}
                </div>

                <div className="flex flex-col">
                    <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                        Arrivée
                    </span>
                    <span className="text-base font-bold text-text-primary">
                        {formatArrivalTime(arrivalTimeIso)}
                    </span>
                </div>

                <div className="my-1 border-t border-dashed border-border-default" />

                <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                            Code de suivi
                        </span>
                        <span className="font-mono text-2xl font-bold tracking-[0.25em] text-text-primary">
                            {recoveryCode}
                        </span>
                        <span className="text-[11px] text-text-secondary">
                            Prénom + code sur waitlight.app
                        </span>
                    </div>
                    <QRCodeCanvas value={recoverUrl} size={84} />
                </div>
            </div>
        </div>
    )
})

export { TicketCard, type TicketCardProps }
