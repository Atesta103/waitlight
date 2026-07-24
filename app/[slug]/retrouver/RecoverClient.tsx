"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { StatusBanner } from "@/components/composed/StatusBanner"
import { findTicketByRecoveryCodeAction } from "@/lib/actions/queue"
import { parseRecoverParams } from "@/lib/utils/ticket-download"
import { Search } from "lucide-react"

type RecoverClientProps = {
    slug: string
    merchantName: string
}

const STORAGE_KEY_PREFIX = "waitlight_ticket_"

/**
 * Lets a customer who lost their tracking link retrieve it with their first
 * name + the recovery code shown when they joined.
 */
function RecoverClient({ slug, merchantName }: RecoverClientProps) {
    const router = useRouter()
    const [customerName, setCustomerName] = useState("")
    const [code, setCode] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    // Pre-fill from a scanned ticket QR code (see buildRecoverUrl / TicketDownloadCard).
    // Read directly from window.location rather than useSearchParams(), which
    // avoids that hook's Suspense-boundary requirement and any hydration
    // mismatch from differing server/client initial state — this runs once,
    // client-side only, after the form's normal empty state has mounted.
    useEffect(() => {
        const { name, code: prefillCode } = parseRecoverParams(
            new URLSearchParams(window.location.search),
        )
        if (!name && !prefillCode) return
        // Defer to avoid a synchronous setState in the effect body.
        const t = setTimeout(() => {
            if (name) setCustomerName(name)
            if (prefillCode) setCode(prefillCode)
        }, 0)
        return () => clearTimeout(t)
        // Only ever want this once, on mount, to seed from a scanned link.
    }, [])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        const result = await findTicketByRecoveryCodeAction({
            slug,
            customerName,
            code,
        })

        if ("error" in result) {
            setError(result.error)
            setIsLoading(false)
            return
        }

        // Re-seed localStorage so future visits auto-redirect too.
        try {
            localStorage.setItem(
                `${STORAGE_KEY_PREFIX}${slug}`,
                JSON.stringify({ ticketId: result.data.ticketId }),
            )
        } catch {
            // localStorage unavailable — continue anyway
        }

        router.push(`/${slug}/wait/${result.data.ticketId}`)
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary/10">
                    <Search size={26} className="text-brand-primary" aria-hidden="true" />
                </div>
                <div className="flex flex-col gap-1.5">
                    <h1 className="text-xl font-bold text-text-primary">
                        Retrouvez votre place
                    </h1>
                    <p className="text-sm text-text-secondary">
                        Entrez votre prénom et le code affiché lorsque vous avez rejoint
                        la file de {merchantName}.
                    </p>
                </div>
            </div>

            <Card>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-1">
                    <Input
                        label="Votre prénom"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Ex : Alex"
                        autoComplete="given-name"
                        required
                    />
                    <Input
                        label="Code de suivi"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder="Ex : 4F2K"
                        autoCapitalize="characters"
                        className="font-mono tracking-[0.3em] uppercase"
                        required
                    />
                    <Button
                        type="submit"
                        variant="primary"
                        isLoading={isLoading}
                        disabled={customerName.trim().length < 2 || code.trim().length < 1}
                    >
                        Retrouver ma place
                    </Button>
                </form>
            </Card>

            {error ? (
                <StatusBanner variant="error" title="Introuvable" description={error} />
            ) : null}

            <p className="text-center text-xs text-text-secondary">
                Pas encore dans la file ?{" "}
                <Link
                    href={`/${slug}/join`}
                    className="font-semibold text-brand-primary hover:underline"
                >
                    Scannez le QR code
                </Link>
            </p>
        </div>
    )
}

export { RecoverClient }
