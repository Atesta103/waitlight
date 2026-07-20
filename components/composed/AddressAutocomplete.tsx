"use client"

import { useState, useEffect, useRef } from "react"
import { MapPin, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/Input"
import { cn } from "@/lib/utils/cn"

type AddressSuggestion = {
    label: string
    latitude: number
    longitude: number
}

type AddressAutocompleteProps = {
    label?: string
    placeholder?: string
    /** Pre-filled address label, e.g. when editing an existing value. */
    initialValue?: string
    onSelect: (suggestion: AddressSuggestion) => void
    className?: string
}

type BanFeature = {
    properties: { id?: string; label: string }
    geometry: { coordinates: [number, number] } // [lng, lat]
}

/**
 * A suggestion plus the BAN feature id used as React key. Two distinct
 * addresses can share an identical `label` (e.g. the same locality name in
 * two communes), so the label alone is not a stable key. `id` is optional in
 * the API response and not contractually unique either, so the position within
 * the result list is always folded in.
 */
type KeyedSuggestion = AddressSuggestion & { key: string }

function toKeyed(feature: BanFeature, index: number): KeyedSuggestion {
    return {
        key: `${feature.properties.id ?? feature.properties.label}-${index}`,
        label: feature.properties.label,
        longitude: feature.geometry.coordinates[0],
        latitude: feature.geometry.coordinates[1],
    }
}

/**
 * Address autocomplete backed by the French government's free, keyless
 * "Base Adresse Nationale" API (api-adresse.data.gouv.fr). Only covers
 * French addresses — expected for this app's market, not a bug.
 */
function AddressAutocomplete({
    label = "Adresse",
    placeholder = "Ex : 12 rue de la Paix, 75002 Paris",
    initialValue = "",
    onSelect,
    className,
}: AddressAutocompleteProps) {
    const [query, setQuery] = useState(initialValue)
    const [suggestions, setSuggestions] = useState<KeyedSuggestion[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [notFound, setNotFound] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const skipNextSearch = useRef(false)

    useEffect(() => {
        if (skipNextSearch.current) {
            skipNextSearch.current = false
            return
        }

        const trimmed = query.trim()
        if (trimmed.length < 3) {
            setSuggestions([])
            setNotFound(false)
            return
        }

        setIsSearching(true)
        const controller = new AbortController()

        const timeout = setTimeout(async () => {
            try {
                const res = await fetch(
                    `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(trimmed)}&limit=5`,
                    { signal: controller.signal },
                )
                const data = await res.json()
                const features: BanFeature[] = data.features ?? []
                const results = features.map(toKeyed)
                setSuggestions(results)
                setNotFound(results.length === 0)
                setIsOpen(true)
            } catch {
                // Aborted or network error — silently ignore, keep last results.
            } finally {
                setIsSearching(false)
            }
        }, 300)

        return () => {
            clearTimeout(timeout)
            controller.abort()
        }
    }, [query])

    function handleSelect(suggestion: AddressSuggestion) {
        skipNextSearch.current = true
        setQuery(suggestion.label)
        setSuggestions([])
        setIsOpen(false)
        onSelect(suggestion)
    }

    return (
        <div className={cn("relative flex flex-col gap-1.5", className)}>
            <Input
                label={label}
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => suggestions.length > 0 && setIsOpen(true)}
                onBlur={() => setTimeout(() => setIsOpen(false), 150)}
                autoComplete="off"
            />

            {isSearching ? (
                <Loader2
                    size={16}
                    className="absolute right-3 top-9 animate-spin text-text-secondary"
                    aria-hidden="true"
                />
            ) : null}

            {isOpen && suggestions.length > 0 ? (
                <ul className="absolute top-full z-10 mt-1 w-full overflow-hidden rounded-lg border border-border-default bg-surface-card shadow-md">
                    {suggestions.map((s) => (
                        <li key={s.key}>
                            <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleSelect(s)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-text-primary transition-colors hover:bg-surface-base"
                            >
                                <MapPin
                                    size={14}
                                    className="shrink-0 text-text-secondary"
                                    aria-hidden="true"
                                />
                                <span className="truncate">{s.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            ) : null}

            {notFound && !isSearching ? (
                <p className="text-xs text-text-secondary">
                    Aucune adresse trouvée. Cette recherche ne couvre que la France.
                </p>
            ) : null}
        </div>
    )
}

export { AddressAutocomplete, type AddressAutocompleteProps, type AddressSuggestion }
