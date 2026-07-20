"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import maplibregl from "maplibre-gl"
import { Badge } from "@/components/ui/Badge"
import { getButtonClasses } from "@/components/ui/button-classes"
import { cn } from "@/lib/utils/cn"
import type { NearbyMerchant } from "@/lib/actions/directory"

type MerchantsMapProps = {
    center: { lat: number; lng: number }
    merchants: NearbyMerchant[]
}

/**
 * OpenFreeMap's "Liberty" vector style — no API key, no billing. Vector tiles
 * are what make zooming continuous the way Google and Apple Maps are: the GPU
 * redraws geometry at any fractional scale, so labels stay sharp mid-gesture
 * instead of being a raster image stretched between whole zoom levels.
 */
const MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty"

const DEFAULT_ZOOM = 13

/**
 * Builds the DOM node MapLibre anchors at the merchant's coordinates. Styling
 * lives in `globals.css` (`.wl-pin`) since the element sits outside React.
 *
 * Built with DOM APIs rather than an HTML string so merchant-supplied values
 * (name, logo URL) are assigned as text and attributes and can never be parsed
 * as markup — a shop must not be able to name itself into script execution on
 * every visitor's map.
 */
function createPinElement(merchant: NearbyMerchant): HTMLElement {
    const pin = document.createElement("div")
    pin.className = `wl-pin wl-pin--${merchant.is_open ? "open" : "closed"}`

    const halo = document.createElement("span")
    halo.className = "wl-pin__halo"

    const disc = document.createElement("span")
    disc.className = "wl-pin__disc"

    if (merchant.logo_url) {
        const img = document.createElement("img")
        img.src = merchant.logo_url
        img.alt = ""
        img.loading = "lazy"
        disc.appendChild(img)
    } else {
        const initial = document.createElement("span")
        initial.className = "wl-pin__initial"
        initial.textContent = merchant.name.trim().charAt(0).toUpperCase() || "?"
        disc.appendChild(initial)
    }

    // Hover label. MapLibre has no tooltip primitive, so it ships inside the
    // marker and is revealed by CSS on hover/focus.
    const label = document.createElement("span")
    label.className = "wl-pin__label"
    label.textContent = merchant.name

    pin.append(halo, disc, label)

    // Keyboard reachable: markers are the only way into a merchant's details.
    pin.tabIndex = 0
    pin.setAttribute("role", "button")
    pin.setAttribute(
        "aria-label",
        `${merchant.name}, ${merchant.is_open ? "ouvert" : "fermé"}, à ${merchant.distance_km.toFixed(1)} kilomètres`,
    )

    return pin
}

/** Popup body. Kept in React so it reuses Badge, Link and the button classes. */
function MerchantPopup({ merchant }: { merchant: NearbyMerchant }) {
    return (
        <div className="flex flex-col gap-2 p-1 min-w-[200px]">
            <div className="flex items-center gap-2">
                {merchant.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={merchant.logo_url}
                        alt=""
                        className="h-8 w-8 shrink-0 rounded-lg object-cover"
                    />
                ) : (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-sm font-bold text-brand-primary">
                        {merchant.name.trim().charAt(0).toUpperCase() || "?"}
                    </span>
                )}
                <span className="truncate text-sm font-semibold text-text-primary">
                    {merchant.name}
                </span>
            </div>

            <div className="flex items-center gap-2">
                <Badge status={merchant.is_open ? "called" : "cancelled"} showIcon={false}>
                    {merchant.is_open ? "Ouvert" : "Fermé"}
                </Badge>
                <span className="text-xs text-text-secondary">
                    {merchant.distance_km.toFixed(1)} km
                </span>
            </div>

            {merchant.address ? (
                <p className="text-xs text-text-secondary">{merchant.address}</p>
            ) : null}

            {/* A closed shop has no live queue, so the action would dead-end.
                Say why it's absent instead of leaving a gap. */}
            {merchant.is_open ? (
                <Link
                    href={`/${merchant.slug}/retrouver`}
                    className={cn(getButtonClasses({ variant: "secondary", size: "sm" }), "w-full")}
                >
                    Retrouver ma place
                </Link>
            ) : (
                <p className="text-xs text-text-secondary">
                    Ce commerce est fermé. Revenez à son ouverture pour rejoindre la file.
                </p>
            )}
        </div>
    )
}

function MerchantsMap({ center, merchants }: MerchantsMapProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const mapRef = useRef<maplibregl.Map | null>(null)
    const markersRef = useRef<maplibregl.Marker[]>([])

    // One portal host per merchant: each popup's body is a detached node React
    // portals into, so the content stays a real React tree (Badge, Link) rather
    // than an HTML string. MapLibre owns opening/closing the popup on marker
    // click — hand-wiring that click was what broke.
    const [popupHosts, setPopupHosts] = useState<Map<string, HTMLElement>>(new Map())

    // Map instance: created once. `center` changes are handled separately so a
    // new search pans the existing map instead of rebuilding it.
    useEffect(() => {
        if (!containerRef.current || mapRef.current) return

        const map = new maplibregl.Map({
            container: containerRef.current,
            style: MAP_STYLE_URL,
            center: [center.lng, center.lat],
            zoom: DEFAULT_ZOOM,
            attributionControl: { compact: true },
        })
        map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right")
        mapRef.current = map

        return () => {
            map.remove()
            mapRef.current = null
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Markers, rebuilt whenever the result set changes.
    useEffect(() => {
        const map = mapRef.current
        if (!map) return

        markersRef.current.forEach((marker) => marker.remove())
        markersRef.current = []

        const hosts = new Map<string, HTMLElement>()

        markersRef.current = merchants.map((merchant) => {
            const host = document.createElement("div")
            hosts.set(merchant.slug, host)

            const popup = new maplibregl.Popup({
                offset: 26,
                closeButton: true,
                maxWidth: "280px",
            }).setDOMContent(host)

            const element = createPinElement(merchant)
            const marker = new maplibregl.Marker({ element })
                .setLngLat([merchant.longitude, merchant.latitude])
                .setPopup(popup) // MapLibre toggles the popup on marker click
                .addTo(map)

            // Keyboard parity: the pin is focusable, so Enter/Space must open the
            // popup too. togglePopup() is the same path MapLibre runs on click.
            element.addEventListener("keydown", (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    marker.togglePopup()
                }
            })

            return marker
        })

        setPopupHosts(hosts)

        return () => {
            markersRef.current.forEach((marker) => marker.remove())
            markersRef.current = []
        }
    }, [merchants])

    // Recenter on a new search without tearing the map down.
    useEffect(() => {
        mapRef.current?.easeTo({ center: [center.lng, center.lat], duration: 600 })
    }, [center])

    return (
        <>
            <div ref={containerRef} className="h-full w-full rounded-2xl" />
            {merchants.map((merchant) => {
                const host = popupHosts.get(merchant.slug)
                return host
                    ? createPortal(<MerchantPopup merchant={merchant} />, host, merchant.slug)
                    : null
            })}
        </>
    )
}

export { MerchantsMap, type MerchantsMapProps }
