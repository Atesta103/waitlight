"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import maplibregl from "maplibre-gl"
import { LocateFixed } from "lucide-react"
import { Badge } from "@/components/ui/Badge"
import { getButtonClasses } from "@/components/ui/button-classes"
import { cn } from "@/lib/utils/cn"
import type { NearbyMerchant } from "@/lib/actions/directory"

type MerchantsMapProps = {
    center: { lat: number; lng: number }
    merchants: NearbyMerchant[]
    /** The visitor's GPS position, if geolocation succeeded. Drives the "you are
     *  here" marker and the recenter button; absent for a manual-only visitor. */
    userPosition?: { lat: number; lng: number } | null
}

/** Pins closer than this many screen pixels collapse into one cluster. */
const CLUSTER_RADIUS_PX = 46

/**
 * OpenFreeMap's "Liberty" vector style — no API key, no billing. Vector tiles
 * are what make zooming continuous the way Google and Apple Maps are: the GPU
 * redraws geometry at any fractional scale, so labels stay sharp mid-gesture
 * instead of being a raster image stretched between whole zoom levels.
 */
const MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty"

const DEFAULT_ZOOM = 13

/** The circle standing in for several overlapping pins, showing how many.
 *  A shop's own logo would be misleading here, so the count carries it. */
function createClusterElement(count: number): HTMLElement {
    const el = document.createElement("div")
    el.className = "wl-cluster"
    el.tabIndex = 0
    el.setAttribute("role", "button")
    el.setAttribute("aria-label", `${count} commerces regroupés, zoomer pour les séparer`)

    // The visual lives on an inner span. MapLibre positions the marker by
    // writing `transform: translate(...)` onto the root element on every frame
    // of a pan, so the root must carry no transform transition — otherwise the
    // marker eases toward each new position and visibly lags the map. The hover
    // scale therefore rides the inner span, which MapLibre never touches.
    const inner = document.createElement("span")
    inner.className = "wl-cluster__inner"
    inner.textContent = String(count)
    el.appendChild(inner)

    return el
}

/** The "you are here" dot — deliberately unlike the merchant pins so the
 *  visitor never mistakes their own position for a shop. Styled in globals.css. */
function createUserDotElement(): HTMLElement {
    const dot = document.createElement("div")
    dot.className = "wl-userdot"
    dot.setAttribute("aria-label", "Votre position")
    dot.innerHTML = `<span class="wl-userdot__pulse"></span><span class="wl-userdot__core"></span>`
    return dot
}

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
        // Fixed width, not min-width: a long address (which wraps to two lines
        // instead of truncating, so the info stays readable) must not change the
        // card's width from one merchant to the next — only its height, which
        // is fine since the popup is anchored to the pin, not the card's edge.
        <div className="flex w-[240px] flex-col gap-2 p-1">
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

/**
 * Groups merchants whose pins fall within CLUSTER_RADIUS_PX of each other at
 * the map's current scale. Greedy and O(n²), fine for ≤30 merchants. Returns
 * one array of members per group (singletons included).
 */
function computeClusters(map: maplibregl.Map, merchants: NearbyMerchant[]): NearbyMerchant[][] {
    const projected = merchants.map((merchant) => ({
        merchant,
        point: map.project([merchant.longitude, merchant.latitude]),
    }))

    const grouped = new Set<number>()
    const groups: NearbyMerchant[][] = []

    projected.forEach(({ merchant, point }, i) => {
        if (grouped.has(i)) return
        grouped.add(i)

        const members = [merchant]
        for (let j = i + 1; j < projected.length; j++) {
            if (grouped.has(j)) continue
            const other = projected[j].point
            if (Math.hypot(point.x - other.x, point.y - other.y) < CLUSTER_RADIUS_PX) {
                grouped.add(j)
                members.push(projected[j].merchant)
            }
        }
        groups.push(members)
    })

    return groups
}

/** A stable identity for a grouping, so markers are rebuilt only when the
 *  grouping actually changes — not on every frame of a continuous zoom. */
function clusterSignature(groups: NearbyMerchant[][]): string {
    return groups
        .map((members) => members.map((m) => m.slug).sort().join(","))
        .sort()
        .join("|")
}

/** A single merchant pin wired to its popup, with keyboard parity. */
function buildMerchantMarker(
    map: maplibregl.Map,
    merchant: NearbyMerchant,
    host: HTMLElement,
): maplibregl.Marker {
    const popup = new maplibregl.Popup({
        // Anchor at the bottom so the card always opens above the pin, pointing
        // down at it. Left to auto, MapLibre flips the side near screen edges,
        // which is what made the card land inconsistently. Offset clears the
        // 44px pin (radius 22 + a little gap).
        anchor: "bottom",
        offset: 30,
        closeButton: true,
        // The card itself is a fixed 240px (see MerchantPopup); with the content
        // wrapper's padding (14px left + 34px right, for the close button) that
        // needs ~288px total. 280 was tighter than that — bumped so the fixed
        // width is never the thing actually constraining the popup.
        maxWidth: "320px",
        focusAfterOpen: false,
    }).setDOMContent(host)

    const element = createPinElement(merchant)
    const marker = new maplibregl.Marker({ element })
        .setLngLat([merchant.longitude, merchant.latitude])
        .setPopup(popup) // MapLibre toggles the popup on marker click
        .addTo(map)

    element.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            marker.togglePopup()
        }
    })

    return marker
}

/** A cluster bubble at the members' centroid; clicking zooms in to split it. */
function buildClusterMarker(map: maplibregl.Map, members: NearbyMerchant[]): maplibregl.Marker {
    const lng = members.reduce((sum, m) => sum + m.longitude, 0) / members.length
    const lat = members.reduce((sum, m) => sum + m.latitude, 0) / members.length

    const element = createClusterElement(members.length)
    const marker = new maplibregl.Marker({ element }).setLngLat([lng, lat]).addTo(map)

    const zoomIn = () => {
        map.easeTo({ center: [lng, lat], zoom: map.getZoom() + 2, duration: 500 })
    }
    element.addEventListener("click", zoomIn)
    element.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            zoomIn()
        }
    })

    return marker
}

function MerchantsMap({ center, merchants, userPosition }: MerchantsMapProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const mapRef = useRef<maplibregl.Map | null>(null)
    const markersRef = useRef<maplibregl.Marker[]>([])
    const clusterSigRef = useRef<string>("")

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
            // Default attribution control lands bottom-right — the same corner
            // as the recenter button below, where the two visibly overlapped.
            // Disabled here and re-added explicitly at bottom-left instead.
            attributionControl: false,
        })
        map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-left")
        map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right")
        mapRef.current = map

        // MapLibre measures its container's size at construction time, which can
        // land before the page's own layout (web fonts, flex/grid reflow) has
        // settled — a container measured too early leaves MapLibre's cached
        // dimensions wrong until something forces a re-measure. That stale cache
        // is what threw off the very first popup opened after each load: it
        // positioned against the wrong size, while later popups — opened once
        // the map had settled — were fine. `resize()` forces a fresh
        // measurement; called once the style has fully loaded, and again next
        // frame to catch any layout that finished settling in between.
        map.on("load", () => {
            map.resize()
            requestAnimationFrame(() => map.resize())
        })

        return () => {
            map.remove()
            mapRef.current = null
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Markers with pixel-proximity clustering. One portal host is created per
    // merchant up front (stable while the result set holds). Clustering is
    // recomputed live on zoom — pins that overlap at the new scale collapse into
    // a counted cluster and split apart again — but the markers are only rebuilt
    // when the grouping actually changes, keyed on a signature. That gives an
    // instant response the moment two pins merge, without rebuilding (and
    // flickering) every frame of a continuous zoom. Not recomputed on pan:
    // panning translates every point equally, so pairwise distances hold.
    // At most 30 merchants, so the O(n²) grouping is trivial.
    useEffect(() => {
        const map = mapRef.current
        if (!map) return

        const hosts = new Map<string, HTMLElement>()
        merchants.forEach((merchant) => hosts.set(merchant.slug, document.createElement("div")))
        setPopupHosts(hosts)

        // Force the first pass to build (no grouping matches an empty signature).
        clusterSigRef.current = ""

        const renderMarkers = () => {
            const groups = computeClusters(map, merchants)
            const signature = clusterSignature(groups)
            if (signature === clusterSigRef.current) return
            clusterSigRef.current = signature

            markersRef.current.forEach((marker) => marker.remove())
            markersRef.current = groups.map((members) =>
                members.length === 1
                    ? buildMerchantMarker(map, members[0], hosts.get(members[0].slug)!)
                    : buildClusterMarker(map, members),
            )
        }

        renderMarkers()
        // Live during a zoom for immediate merge/split; the signature check makes
        // the per-frame calls cheap no-ops until the grouping flips.
        map.on("zoom", renderMarkers)

        return () => {
            map.off("zoom", renderMarkers)
            markersRef.current.forEach((marker) => marker.remove())
            markersRef.current = []
        }
    }, [merchants])

    // The "you are here" dot. Created fresh with a cleanup that removes it —
    // essential under StrictMode's mount/unmount/remount, where the map effect
    // tears down and rebuilds the map between the two passes. Without this
    // cleanup the marker would stay bound to the discarded first map and never
    // reattach to the live one, so the dot would silently never appear.
    useEffect(() => {
        const map = mapRef.current
        if (!map || !userPosition) return

        // setLngLat must precede addTo: addTo runs an internal _update that reads
        // the position, so adding before setting throws on lngLat.
        const marker = new maplibregl.Marker({ element: createUserDotElement() })
            .setLngLat([userPosition.lng, userPosition.lat])
            .addTo(map)

        return () => {
            marker.remove()
        }
    }, [userPosition])

    // Recenter on a new search without tearing the map down.
    useEffect(() => {
        mapRef.current?.easeTo({ center: [center.lng, center.lat], duration: 600 })
    }, [center])

    const recenterOnUser = () => {
        if (!userPosition) return
        mapRef.current?.easeTo({
            center: [userPosition.lng, userPosition.lat],
            zoom: DEFAULT_ZOOM,
            duration: 600,
        })
    }

    return (
        <div className="relative h-full w-full">
            <div ref={containerRef} className="h-full w-full rounded-2xl" />

            {userPosition ? (
                <button
                    type="button"
                    onClick={recenterOnUser}
                    aria-label="Recentrer la carte sur ma position"
                    title="Ma position"
                    className="absolute bottom-4 right-4 z-[1] flex h-11 w-11 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#4F46E5] shadow-[0_2px_10px_rgba(0,0,0,0.12)] transition-colors hover:bg-[#F5F3FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#6366F1] focus-visible:outline-offset-2"
                >
                    <LocateFixed size={20} aria-hidden="true" />
                </button>
            ) : null}

            {merchants.map((merchant) => {
                const host = popupHosts.get(merchant.slug)
                return host
                    ? createPortal(<MerchantPopup merchant={merchant} />, host, merchant.slug)
                    : null
            })}
        </div>
    )
}

export { MerchantsMap, type MerchantsMapProps }
