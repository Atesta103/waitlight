/**
 * @module actions/qr
 * @category Actions
 *
 * Server Action for generating cryptographic one-time QR tokens.
 * Tokens are stored in `qr_tokens`, valid for 30 seconds, single-use.
 */
"use server"

import { createClient } from "@/lib/supabase/server"
import {
    QR_TOKEN_TTL_SECONDS,
    QR_MAX_TOKENS_PER_MINUTE,
} from "@/lib/utils/qr-config"

/**
 * Generate a cryptographic one-time token for the authenticated merchant's
 * rotating QR code.
 *
 * **Nonce construction:** `{randomUUID}-{HMAC-SHA256(secret, uuid) as hex}`
 * (~256 bits of entropy). Stored in `qr_tokens` with a 30-second TTL.
 *
 * **Rate limit:** max {@link QR_MAX_TOKENS_PER_MINUTE} generations per merchant
 * per 60-second window.
 *
 * The generated nonce is embedded in the QR URL as `/{slug}/join?token={nonce}`.
 * On scan, the join page calls the `validate_qr_token` RPC to atomically verify
 * and mark the token as used.
 *
 * @returns `expiresAt` is an ISO 8601 timestamp (now + {@link QR_TOKEN_TTL_SECONDS} s).
 *
 * **Errors:**
 * | `error` string | Cause |
 * |---|---|
 * | `"Session expirée. Veuillez vous reconnecter."` | No authenticated user |
 * | `"Erreur lors de la vérification des limites."` | Rate-limit count query failed |
 * | `"Trop de QR codes générés. Veuillez patienter une minute."` | ≥10 tokens in last 60 s |
 * | `"Impossible de générer le QR Code. Veuillez réessayer."` | DB insert failed |
 */
export async function generateQrTokenAction(): Promise<
    { data: { nonce: string; expiresAt: string } } | { error: string }
> {
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
        return { error: "Erreur lors de la vérification des limites." }
    }

    if ((count ?? 0) >= QR_MAX_TOKENS_PER_MINUTE) {
        return {
            error: "Trop de QR codes générés. Veuillez patienter une minute.",
        }
    }

    // ── Generate cryptographic nonce ──────────────────────────────────────────
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

    // Nonce: uuid-hmac (unguessable, ~256 bits of entropy)
    const nonce = `${rawUuid}-${hexSig}`

    const expiresAt = new Date(
        Date.now() + QR_TOKEN_TTL_SECONDS * 1000,
    ).toISOString()

    // ── Store in DB ───────────────────────────────────────────────────────────
    const { error: insertError } = await supabase.from("qr_tokens").insert({
        merchant_id: user.id,
        nonce,
        expires_at: expiresAt,
    })

    if (insertError) {
        return {
            error: "Impossible de générer le QR Code. Veuillez réessayer.",
        }
    }

    return { data: { nonce, expiresAt } }
}
