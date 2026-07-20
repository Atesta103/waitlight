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

/** Server-enforced caps — any client-supplied value beyond these is ignored. */
const MAX_RADIUS_KM = 25
const MAX_NEARBY_RESULTS = 30

export type PublicMerchant = {
    slug: string
    name: string
    business_type: string
    logo_url: string | null
    is_open: boolean
    address: string | null
}

export type NearbyMerchant = PublicMerchant & {
    /**
     * Exact geocoded position. Not blurred: the merchant's full postal address
     * ships in the same payload by design, so rounding the coordinates would
     * only be decorative — it would suggest a privacy guarantee the response
     * does not actually make. Appearing here is opt-in (`is_public`).
     */
    latitude: number
    longitude: number
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
 * Find publicly-listed, geocoded merchants near a given point, nearest first.
 * Powers the /carte discovery map. IP rate-limited more strictly than name
 * search given the sensitivity of aggregate location data — radius and
 * result count are capped server-side regardless of what's requested.
 *
 * @param input.lat - Latitude of the search origin (customer's position or manually picked address).
 * @param input.lng - Longitude of the search origin.
 * @param input.radiusKm - Desired search radius; clamped to {@link MAX_RADIUS_KM}.
 */
export async function getNearbyMerchantsAction(input: {
    lat: number
    lng: number
    radiusKm?: number
}): Promise<{ data: NearbyMerchant[] } | { error: string }> {
    const ip = getClientIp(await headers())
    if (!checkRateLimit(`nearby:${ip}`, 10, 60_000)) {
        return { error: "Trop de recherches. Veuillez patienter une minute." }
    }

    const radiusKm = Math.min(input.radiusKm ?? MAX_RADIUS_KM, MAX_RADIUS_KM)

    const supabase = await createClient()

    const { data, error } = await supabase.rpc("nearby_public_merchants", {
        p_lat: input.lat,
        p_lng: input.lng,
        p_radius_km: radiusKm,
        p_limit: MAX_NEARBY_RESULTS,
    })

    if (error) {
        // Full shape (code + details + hint), not just `message` — PostgREST puts
        // the actionable part in `code`/`hint` (e.g. PGRST202 for a function
        // missing from the schema cache), and `message` alone hides it.
        console.error("[getNearbyMerchantsAction] DB error:", {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
        })
        // The cause is surfaced to the client in development only: in production
        // it would leak schema internals to any visitor.
        return {
            error:
                process.env.NODE_ENV === "development"
                    ? `Impossible de charger les commerces à proximité. [dev] ${error.code ?? "?"}: ${error.message}`
                    : "Impossible de charger les commerces à proximité.",
        }
    }

    const results: NearbyMerchant[] = (data ?? []).map((m) => ({
        slug: m.slug,
        name: m.name,
        business_type: m.business_type,
        logo_url: m.logo_url,
        is_open: m.is_open,
        address: m.address,
        latitude: m.latitude,
        longitude: m.longitude,
        distance_km: m.distance_km,
    }))

    return { data: results }
}
