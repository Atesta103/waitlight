/**
 * @module actions/directory
 * @category Actions
 *
 * Public merchant discovery. Only merchants who opted in (`is_public = true`)
 * are searchable. Powers the global /retrouver merchant picker (and, later,
 * a discovery map).
 */
"use server"

import { headers } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { checkRateLimit } from "@/lib/utils/rate-limit"

export type PublicMerchant = {
    slug: string
    name: string
    business_type: string
    logo_url: string | null
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

    const headersList = await headers()
    const ip =
        headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        headersList.get("x-real-ip") ??
        "unknown"
    if (!checkRateLimit(`directory:${ip}`, 30, 60_000)) {
        return { error: "Trop de recherches. Veuillez patienter une minute." }
    }

    const supabase = await createClient()

    // Escape LIKE wildcards so a user-typed % or _ is treated literally.
    const escaped = trimmed.replace(/[%_]/g, "\\$&")

    const { data, error } = await supabase
        .from("merchants")
        .select("slug, name, business_type, logo_url")
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
