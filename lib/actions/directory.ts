/**
 * @module actions/directory
 * @category Actions
 *
 * Public merchant discovery. Only merchants who opted in (`is_public = true`)
 * are searchable. Powers the global /retrouver merchant picker and the
 * /carte discovery map.
 */
"use server"

import { headers } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { checkRateLimit } from "@/lib/utils/rate-limit"

/**
 * Safety ceiling on the map payload. The public directory is small, so the map
 * loads every geocoded merchant once rather than paging by area; this only
 * guards against a pathological future size. Raise, or switch to viewport
 * loading, if the directory ever approaches it.
 */
const MAX_MAP_MERCHANTS = 1000

export type PublicMerchant = {
    slug: string
    name: string
    business_type: string
    logo_url: string | null
    is_open: boolean
    address: string | null
}

export type MapMerchant = PublicMerchant & {
    /**
     * Exact geocoded position. Not blurred: the merchant's full postal address
     * ships in the same payload by design, so rounding the coordinates would
     * only be decorative — it would suggest a privacy guarantee the response
     * does not actually make. Appearing here is opt-in (`is_public`).
     */
    latitude: number
    longitude: number
}

/** A map merchant with a distance, computed client-side from the view origin. */
export type NearbyMerchant = MapMerchant & {
    distance_km: number
}

function getClientIp(headersList: Headers): string {
    return (
        headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        headersList.get("x-real-ip") ??
        "unknown"
    )
}

/**
 * Search publicly-listed merchants by name (case-insensitive, prefix-friendly).
 * Returns up to 8 matches. IP rate-limited to deter directory scraping.
 *
 * @param query - Partial merchant name. Must be at least 2 characters.
 */
export async function searchPublicMerchantsAction(
    query: string,
): Promise<{ data: PublicMerchant[] } | { error: string }> {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
        return { data: [] }
    }

    const ip = getClientIp(await headers())
    if (!checkRateLimit(`directory:${ip}`, 30, 60_000)) {
        return { error: "Trop de recherches. Veuillez patienter une minute." }
    }

    const supabase = await createClient()

    // Escape LIKE wildcards so a user-typed % or _ is treated literally.
    const escaped = trimmed.replace(/[%_]/g, "\\$&")

    const { data, error } = await supabase
        .from("merchants")
        .select("slug, name, business_type, logo_url, is_open, address")
        .eq("is_public", true)
        .ilike("name", `%${escaped}%`)
        .order("name", { ascending: true })
        .limit(8)

    if (error) {
        console.error("[searchPublicMerchantsAction] DB error:", error.message)
        return { error: "Impossible d'effectuer la recherche." }
    }

    return { data: (data ?? []) as PublicMerchant[] }
}

/**
 * Every publicly-listed, geocoded merchant, for the /carte discovery map. The
 * map loads the full set once and keeps it shown at any zoom — clustering
 * handles density — rather than paging by area, so a visitor never has to
 * refetch while exploring. Distances are computed client-side from wherever the
 * visitor is looking. IP rate-limited to deter directory scraping.
 */
export async function getAllPublicMerchantsAction(): Promise<
    { data: MapMerchant[] } | { error: string }
> {
    const ip = getClientIp(await headers())
    if (!checkRateLimit(`map:${ip}`, 10, 60_000)) {
        return { error: "Trop de recherches. Veuillez patienter une minute." }
    }

    const supabase = await createClient()

    const { data, error } = await supabase
        .from("merchants")
        .select("slug, name, business_type, logo_url, is_open, address, latitude, longitude")
        .eq("is_public", true)
        .not("latitude", "is", null)
        .not("longitude", "is", null)
        .limit(MAX_MAP_MERCHANTS)

    if (error) {
        console.error("[getAllPublicMerchantsAction] DB error:", error.message)
        return { error: "Impossible de charger les commerces." }
    }

    return { data: (data ?? []) as MapMerchant[] }
}
