/**
 * @module actions/qr
 * @category Actions
 *
 * Server Actions for generating cryptographic one-time QR tokens.
 * Tokens are stored in `qr_tokens`, single-use, and tagged with the
 * display mode that created them (kiosk vs assisted).
 */
"use server"

import { createClient } from "@/lib/supabase/server"
import {
    QR_TOKEN_TTL_SECONDS,
    QR_ASSISTED_TOKEN_TTL_SECONDS,
    QR_MAX_TOKENS_PER_MINUTE,
} from "@/lib/utils/qr-config"

type QrTokenResult = { data: { nonce: string; expiresAt: string } } | { error: string }

/**
 * Build a cryptographic nonce: `{randomUUID}-{HMAC-SHA256(secret, uuid) as hex}`
 * (~256 bits of entropy).
 */
async function buildNonce(): Promise<string> {
    const rawUuid = crypto.randomUUID()
    const secret =
        process.env.QR_TOKEN_SECRET ?? "dev-secret-change-in-production"

    const keyData = new TextEncoder().encode(secret)
    const msgData = new TextEncoder().encode(rawUuid)
    const cryptoKey = await crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
    )
    const signature = await crypto.subtle.sign("HMAC", cryptoKey, msgData)
    const hexSig = Array.from(new Uint8Array(signature))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")

    return `${rawUuid}-${hexSig}`
}

/**
 * Shared implementation for token generation: rate-limits, builds the
 * nonce, and inserts it into `qr_tokens` tagged with `source`.
 */
async function generateToken(
    source: "kiosk" | "assisted",
    ttlSeconds: number,
): Promise<QrTokenResult> {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Session expirée. Veuillez vous reconnecter." }
    }

    // ── Rate limiting: max QR_MAX_TOKENS_PER_MINUTE per merchant per minute ──
    const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString()
    const { count, error: countError } = await supabase
        .from("qr_tokens")
        .select("*", { count: "exact", head: true })
        .eq("merchant_id", user.id)
        .gte("created_at", oneMinuteAgo)

    if (countError) {
        console.error("[generateToken] rate-limit count error:", countError.message)
        return { error: "Erreur lors de la vérification des limites." }
    }

    if ((count ?? 0) >= QR_MAX_TOKENS_PER_MINUTE) {
        return {
            error: "Trop de QR codes générés. Veuillez patienter une minute.",
        }
    }

    const nonce = await buildNonce()
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString()

    const { error: insertError } = await supabase.from("qr_tokens").insert({
        merchant_id: user.id,
        nonce,
        expires_at: expiresAt,
        source,
    })

    if (insertError) {
        console.error("[generateToken] DB insert error:", insertError.message)
        return {
            error: "Impossible de générer le QR Code. Veuillez réessayer.",
        }
    }

    return { data: { nonce, expiresAt } }
}

/**
 * Generate a cryptographic one-time token for the authenticated merchant's
 * rotating kiosk QR code. Valid for {@link QR_TOKEN_TTL_SECONDS} seconds.
 *
 * The generated nonce is embedded in the QR URL as `/{slug}/join?token={nonce}`.
 * On scan, the join page calls the `validate_qr_token` RPC to atomically verify
 * and mark the token as used.
 *
 * **Errors:**
 * | `error` string | Cause |
 * |---|---|
 * | `"Session expirée. Veuillez vous reconnecter."` | No authenticated user |
 * | `"Erreur lors de la vérification des limites."` | Rate-limit count query failed |
 * | `"Trop de QR codes générés. Veuillez patienter une minute."` | ≥10 tokens in last 60 s |
 * | `"Impossible de générer le QR Code. Veuillez réessayer."` | DB insert failed |
 */
export async function generateQrTokenAction(): Promise<QrTokenResult> {
    return generateToken("kiosk", QR_TOKEN_TTL_SECONDS)
}

/**
 * Generate a single-use token for the assisted QR mode: no rotation, a
 * longer comfort TTL ({@link QR_ASSISTED_TOKEN_TTL_SECONDS}), shown by
 * staff to one customer at intake. Security still comes from the
 * single-use `used` flag on `qr_tokens`, not from a short TTL.
 */
export async function generateAssistedQrTokenAction(): Promise<QrTokenResult> {
    return generateToken("assisted", QR_ASSISTED_TOKEN_TTL_SECONDS)
}

/**
 * Check whether a given nonce has already been consumed. Used by the
 * assisted QR display to detect that the current customer just scanned,
 * so a fresh QR can be generated automatically for the next customer.
 *
 * Scoped to the authenticated merchant's own tokens.
 */
export async function checkQrTokenUsedAction(
    nonce: string,
): Promise<{ data: { used: boolean } } | { error: string }> {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Session expirée. Veuillez vous reconnecter." }
    }

    const { data, error } = await supabase
        .from("qr_tokens")
        .select("used")
        .eq("nonce", nonce)
        .eq("merchant_id", user.id)
        .single()

    if (error || !data) {
        return { error: "QR code introuvable." }
    }

    return { data: { used: data.used } }
}
