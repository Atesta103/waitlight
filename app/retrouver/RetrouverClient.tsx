"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Store, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/Input"
import { searchPublicMerchantsAction, type PublicMerchant } from "@/lib/actions/directory"

/**
 * Global recovery entry point: the customer searches the merchant they
 * ordered from, picks it, and is sent to that merchant's branded recovery
 * page where they enter their first name + code.
 */
export function RetrouverClient() {
    const router = useRouter()
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<PublicMerchant[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [hasSearched, setHasSearched] = useState(false)

    useEffect(() => {
        const trimmed = query.trim()

        // All state updates run inside the timer (deferred), never synchronously
        // in the effect body — avoids cascading renders on every keystroke.
        const timeout = setTimeout(
            async () => {
                if (trimmed.length < 2) {
                    setResults([])
                    setHasSearched(false)
                    setError(null)
                    setIsSearching(false)
                    return
                }

                setIsSearching(true)
                const result = await searchPublicMerchantsAction(trimmed)
                if ("error" in result) {
                    setError(result.error)
                    setResults([])
                } else {
                    setError(null)
                    setResults(result.data)
                }
                setHasSearched(true)
                setIsSearching(false)
            },
            trimmed.length < 2 ? 0 : 300,
        )

        return () => clearTimeout(timeout)
    }, [query])

    return (
        <div className="flex flex-col gap-5">
            <Input
                label="Nom du commerce"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex : Le Bistrot du Coin"
                autoFocus
            />

            {error ? (
                <p className="text-sm text-feedback-error" role="alert">
                    {error}
                </p>
            ) : null}

            {results.length > 0 && (
                <ul className="flex flex-col gap-2">
                    {results.map((merchant) => (
                        <li key={merchant.slug}>
                            <button
                                type="button"
                                onClick={() => router.push(`/${merchant.slug}/retrouver`)}
                                className="flex w-full items-center gap-3 rounded-xl border border-border-default bg-surface-card p-3 text-left transition-colors hover:bg-surface-base"
                            >
                                {merchant.logo_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={merchant.logo_url}
                                        alt=""
                                        className="h-10 w-10 shrink-0 rounded-lg object-cover"
                                    />
                                ) : (
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10">
                                        <Store size={18} className="text-brand-primary" aria-hidden="true" />
                                    </span>
                                )}
                                <span className="flex-1 truncate text-sm font-semibold text-text-primary">
                                    {merchant.name}
                                </span>
                                <ChevronRight size={16} className="shrink-0 text-text-secondary" aria-hidden="true" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {!isSearching && hasSearched && results.length === 0 && !error && (
                <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border-default p-6 text-center">
                    <Search size={20} className="text-text-secondary" aria-hidden="true" />
                    <p className="text-sm text-text-secondary">
                        Aucun commerce trouvé. Vérifiez l&apos;orthographe, ou scannez à nouveau
                        le QR code sur place pour retrouver votre file.
                    </p>
                </div>
            )}
        </div>
    )
}
