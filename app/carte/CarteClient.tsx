"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { Loader2, LocateFixed, RotateCw, SearchX, Settings2 } from "lucide-react"
import { AddressAutocomplete } from "@/components/composed/AddressAutocomplete"
import { Button } from "@/components/ui/Button"
import { getNearbyMerchantsAction, type NearbyMerchant } from "@/lib/actions/directory"

// Leaflet touches `window` — must never render during SSR.
const MerchantsMap = dynamic(
    () => import("@/components/composed/MerchantsMap").then((m) => m.MerchantsMap),
    { ssr: false },
)

type Status = "locating" | "manual" | "loading-merchants" | "ready" | "error"

// Desktop Wi-Fi-based positioning (no GPS) can take longer than a phone's
// first fix — 8s was cutting it too close and produced spurious timeouts.
const GEOLOCATION_TIMEOUT_MS = 15000

/**
 * How each `GeolocationPositionError.code` is presented, and which recovery
 * action makes sense for it.
 *
 * A page cannot open the browser's own permission settings — `chrome://…` and
 * equivalents are unreachable from web content. So a denied permission gets an
 * explanation of where the control lives (the padlock in the address bar) plus
 * the same "retry" button, which succeeds as soon as the user has re-allowed.
 * Unavailable/timeout are transient, so retrying alone is usually enough.
 */
const GEOLOCATION_ERRORS: Record<
    number,
    { message: string; hint?: string; retryLabel: string }
> = {
    1: {
        message: "Vous avez refusé la localisation.",
        hint: "Pour l'autoriser, cliquez sur l'icône de cadenas à gauche de l'adresse du site, activez la localisation, puis réessayez.",
        retryLabel: "J'ai autorisé, réessayer",
    },
    2: {
        message: "Impossible de déterminer votre position.",
        retryLabel: "Réessayer",
    },
    3: {
        message: "La localisation a pris trop de temps.",
        retryLabel: "Réessayer",
    },
}

const GEOLOCATION_UNSUPPORTED = {
    message: "La géolocalisation n'est pas disponible sur cet appareil.",
    retryLabel: "Réessayer",
} as const

function CarteClient() {
    const [status, setStatus] = useState<Status>("locating")
    const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null)
    // The visitor's actual GPS position, kept apart from `center` (which also
    // moves to a typed address). This is what the "you are here" marker and the
    // recenter button point at, so both stay meaningful after an address search.
    // Null until geolocation succeeds — a manual-only visitor has no "me".
    const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null)
    const [merchants, setMerchants] = useState<NearbyMerchant[]>([])
    const [error, setError] = useState<string | null>(null)
    const [geolocationError, setGeolocationError] = useState<{
        message: string
        hint?: string
        retryLabel: string
    } | null>(null)

    const loadNearby = useCallback(async (lat: number, lng: number) => {
        setStatus("loading-merchants")
        setCenter({ lat, lng })
        const result = await getNearbyMerchantsAction({ lat, lng })
        if ("error" in result) {
            setError(result.error)
            setStatus("error")
            return
        }
        setMerchants(result.data)
        setStatus("ready")
    }, [])

    // "Search this area" from the map: refresh in place, keeping the map mounted
    // rather than dropping to the loading screen — the visitor stays oriented on
    // the spot they panned to. A failed refresh leaves the current results as-is.
    const searchArea = useCallback(async (point: { lat: number; lng: number }) => {
        setCenter(point)
        const result = await getNearbyMerchantsAction({ lat: point.lat, lng: point.lng })
        if ("error" in result) return
        setMerchants(result.data)
    }, [])

    /**
     * Deliberately free of synchronous `setState` — it is called straight from
     * the mount effect, and every state change it causes happens inside an
     * async `getCurrentPosition` callback. The "unsupported" and "locating"
     * transitions live at the two call sites instead.
     */
    const requestGeolocation = useCallback(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setGeolocationError(null)
                setUserPosition({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                })
                loadNearby(position.coords.latitude, position.coords.longitude)
            },
            (geoError) => {
                // PERMISSION_DENIED, POSITION_UNAVAILABLE, or TIMEOUT are all
                // expected, benign outcomes (not app bugs) — fall back to the
                // manual address search rather than a stuck loading state, and
                // offer the recovery action that fits this specific code.
                console.info("[CarteClient] Geolocation unavailable:", geoError.code, geoError.message)
                setGeolocationError(GEOLOCATION_ERRORS[geoError.code] ?? GEOLOCATION_UNSUPPORTED)
                setStatus("manual")
            },
            { timeout: GEOLOCATION_TIMEOUT_MS },
        )
    }, [loadNearby])

    /** Retry entry point — an event handler, so setState here is not a cascade. */
    const handleRetry = useCallback(() => {
        if (!("geolocation" in navigator)) {
            setGeolocationError(GEOLOCATION_UNSUPPORTED)
            setStatus("manual")
            return
        }
        setStatus("locating")
        requestGeolocation()
    }, [requestGeolocation])

    // Fire the location request exactly once per mount. Without this guard,
    // React StrictMode's dev-only double-invoke of the mount effect asks the
    // browser for a position twice in quick succession — two stacked permission
    // prompts, which is exactly what trips Chromium/Arc's "prompt ignored
    // repeatedly" auto-block. That block then returns PERMISSION_DENIED even
    // after the user allows location, and can leave the UI stuck on the spinner.
    const didRequestLocation = useRef(false)

    useEffect(() => {
        if (didRequestLocation.current) return
        didRequestLocation.current = true

        if (!("geolocation" in navigator)) {
            // Defer to avoid a synchronous setState in the effect body.
            const t = setTimeout(() => {
                setGeolocationError(GEOLOCATION_UNSUPPORTED)
                setStatus("manual")
            }, 0)
            return () => clearTimeout(t)
        }
        requestGeolocation()
    }, [requestGeolocation])

    return (
        <div className="flex flex-col gap-4">
            {status === "locating" && (
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-10 text-center shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
                    <Loader2 size={24} className="animate-spin text-[#6366F1]" aria-hidden="true" />
                    <p className="text-sm text-[#374151]">Localisation en cours…</p>
                </div>
            )}

            {(status === "manual" || status === "error") && (
                <div className="flex flex-col gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center gap-2 text-sm font-medium text-[#111827]">
                        <LocateFixed size={16} className="text-[#6366F1]" aria-hidden="true" />
                        Indiquez votre position
                    </div>

                    <p className="text-xs text-[#6B7280]">
                        {status === "error"
                            ? error
                            : (geolocationError?.message ??
                              "La géolocalisation n'est pas disponible.")}
                    </p>

                    {status === "manual" && geolocationError?.hint ? (
                        <p className="flex items-start gap-2 rounded-lg bg-[#F3F4F6] p-3 text-xs text-[#374151]">
                            <Settings2 size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                            {geolocationError.hint}
                        </p>
                    ) : null}

                    {status === "manual" && geolocationError ? (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleRetry}
                            className="self-start"
                        >
                            <RotateCw size={14} aria-hidden="true" />
                            {geolocationError.retryLabel}
                        </Button>
                    ) : null}

                    {status === "error" && center ? (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => loadNearby(center.lat, center.lng)}
                            className="self-start"
                        >
                            <RotateCw size={14} aria-hidden="true" />
                            Réessayer
                        </Button>
                    ) : null}

                    <div className="flex items-center gap-3">
                        <span className="h-px flex-1 bg-[#E5E7EB]" />
                        <span className="text-xs text-[#9CA3AF]">ou</span>
                        <span className="h-px flex-1 bg-[#E5E7EB]" />
                    </div>

                    <AddressAutocomplete
                        label="Votre adresse"
                        onSelect={(s) => loadNearby(s.latitude, s.longitude)}
                    />
                </div>
            )}

            {status === "loading-merchants" && (
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-10 text-center shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
                    <Loader2 size={24} className="animate-spin text-[#6366F1]" aria-hidden="true" />
                    <p className="text-sm text-[#374151]">Recherche des commerces à proximité…</p>
                </div>
            )}

            {status === "ready" && center && (
                <>
                    {/* Search elsewhere without leaving the map: plan a trip, or
                        check what's open near someone else. Reuses the same
                        loadNearby path as the initial search. */}
                    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
                        <AddressAutocomplete
                            label="Chercher à une autre adresse"
                            onSelect={(s) => loadNearby(s.latitude, s.longitude)}
                        />
                    </div>

                    <div className="h-[500px] w-full overflow-hidden rounded-2xl border border-[#E5E7EB] shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
                        <MerchantsMap
                            center={center}
                            merchants={merchants}
                            userPosition={userPosition}
                            onSearchArea={searchArea}
                        />
                    </div>

                    {merchants.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[#D1D5DB] p-6 text-center">
                            <SearchX size={20} className="text-[#6B7280]" aria-hidden="true" />
                            <p className="text-sm text-[#6B7280]">
                                Aucun commerce WaitLight trouvé dans un rayon de 25 km.
                            </p>
                        </div>
                    ) : null}
                </>
            )}
        </div>
    )
}

export { CarteClient }
