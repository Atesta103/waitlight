"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/Card"
import { JoinForm } from "@/components/composed/JoinForm"
import { StatusBanner } from "@/components/composed/StatusBanner"
import { joinQueueAction } from "@/lib/actions/queue"
import { QrCode, Store, Sparkles } from "lucide-react"

type Merchant = {
    id: string
    name: string
    slug: string
    is_open: boolean
}

type Settings = {
    welcome_message: string | null
    max_capacity: number
} | null

type JoinClientProps = {
    merchant: Merchant
    settings: Settings
    token: string | null
}

const STORAGE_KEY_PREFIX = "waitlight_ticket_"

function JoinClient({ merchant, settings, token }: JoinClientProps) {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [checkedStorage, setCheckedStorage] = useState(false)

    // Check localStorage for existing active ticket
    useEffect(() => {
        try {
            const stored = localStorage.getItem(
                `${STORAGE_KEY_PREFIX}${merchant.slug}`,
            )
            if (stored) {
                const { ticketId } = JSON.parse(stored)
                if (ticketId) {
                    router.replace(`/${merchant.slug}/wait/${ticketId}`)
                    return
                }
            }
        } catch {
            // Invalid JSON in localStorage — ignore
        }
        setCheckedStorage(true)
    }, [merchant.slug, router])

    async function handleSubmit(data: {
        customerName: string
        consent: boolean
    }) {
        if (!token) return

        setIsLoading(true)
        setError(null)

        const result = await joinQueueAction({
            customerName: data.customerName,
            consent: data.consent as true,
            token,
            slug: merchant.slug,
        })

        if ("error" in result) {
            setError(result.error)
            setIsLoading(false)
            return
        }

        // Save ticket to localStorage
        try {
            localStorage.setItem(
                `${STORAGE_KEY_PREFIX}${merchant.slug}`,
                JSON.stringify({ ticketId: result.data.ticketId }),
            )
        } catch {
            // localStorage full or unavailable — continue anyway
        }

        router.push(`/${merchant.slug}/wait/${result.data.ticketId}`)
    }

    // Don't render until we've checked localStorage
    if (!checkedStorage) return null

    // No token — instruct user to scan QR
    if (!token) {
        return (
            <div className="flex flex-col items-center gap-6 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-primary/10">
                    <QrCode
                        size={40}
                        className="text-brand-primary"
                        aria-hidden="true"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <h1 className="text-xl font-bold text-text-primary">
                        Scannez le QR code
                    </h1>
                    <p className="text-sm text-text-secondary">
                        Présentez-vous au comptoir et scannez le QR code affiché
                        pour rejoindre la file d&apos;attente.
                    </p>
                </div>

            </div>
        )
    }

    // Queue closed
    if (!merchant.is_open) {
        return (
            <StatusBanner
                variant="closed"
                title="File d'attente fermée"
                description={`${merchant.name} n'accepte pas de nouveaux clients pour le moment.`}
            />
        )
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary/10">
                    <Store
                        size={28}
                        className="text-brand-primary"
                        aria-hidden="true"
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <h1 className="text-xl font-bold text-text-primary">
                        {merchant.name}
                    </h1>
                    {settings?.welcome_message ? (
                        <div className="w-full px-4 mt-2">
                            <div className="flex items-start gap-3 rounded-2xl border border-brand-primary/10 bg-surface-card p-4 shadow-sm sm:max-w-sm sm:mx-auto">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-primary/10">
                                    <Sparkles
                                        size={16}
                                        className="text-brand-primary"
                                        aria-hidden="true"
                                    />
                                </div>
                                <div className="flex flex-col gap-0.5 text-left">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-brand-primary">
                                        Message d&apos;accueil
                                    </p>
                                    <p className="text-sm leading-relaxed text-text-primary">
                                        {settings.welcome_message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-text-secondary">
                            Rejoignez la file d&apos;attente
                        </p>
                    )}



                </div>

            </div>

            {/* Join form */}
            <Card>
                <JoinForm onSubmit={handleSubmit} isLoading={isLoading} />
            </Card>

            {/* Server error */}
            {error ? (
                <StatusBanner variant="error" title="Erreur" description={error} />
            ) : null}
        </div>
    )
}

export { JoinClient }
