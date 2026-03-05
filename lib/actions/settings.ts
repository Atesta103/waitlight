/**
 * @module actions/settings
 * @category Actions
 *
 * Server Actions for merchant settings management.
 * Covers merchant identity, queue config, QR regeneration, logo, and slug.
 */
"use server"

import { createClient } from "@/lib/supabase/server"
import {
    MerchantIdentitySchema,
    QueueSettingsSchema,
    type MerchantIdentityInput,
    type QueueSettingsInput,
} from "@/lib/validators/settings"

// ─────────────────────────────────────────────────────────────────────────────
// Rate-limit constants
// ─────────────────────────────────────────────────────────────────────────────

/** Minimum time (ms) a merchant must wait between two slug changes (1 hour). */
const SLUG_CHANGE_COOLDOWN_MS = 60 * 60 * 1000

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type MerchantSettingsData = {
    merchant: {
        id: string
        name: string
        slug: string
        logo_url: string | null
        default_prep_time_min: number
        is_open: boolean
    }
    settings: {
        max_capacity: number
        welcome_message: string | null
        qr_regenerated_at: string | null
        notifications_enabled: boolean
        auto_close_enabled: boolean
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch the current merchant profile and settings for the authenticated user.
 *
 * Used by the settings Server Component to populate initial form values.
 *
 * **Errors:**
 * | `error` string | Cause |
 * |---|---|
 * | `"Session expirée. Veuillez vous reconnecter."` | No authenticated user |
 * | `"Commerce introuvable."` | No `merchants` row found |
 * | `"Configuration introuvable."` | No `settings` row found |
 */
export async function getMerchantSettingsAction(): Promise<
    { data: MerchantSettingsData } | { error: string }
> {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Session expirée. Veuillez vous reconnecter." }
    }

    const { data: merchant, error: merchantError } = await supabase
        .from("merchants")
        .select("id, name, slug, logo_url, default_prep_time_min, is_open")
        .eq("id", user.id)
        .single()

    if (merchantError || !merchant) {
        return { error: "Commerce introuvable." }
    }

    const { data: settings, error: settingsError } = await supabase
        .from("settings")
        .select(
            "max_capacity, welcome_message, qr_regenerated_at, notifications_enabled, auto_close_enabled",
        )
        .eq("merchant_id", user.id)
        .single()

    if (settingsError || !settings) {
        return { error: "Configuration introuvable." }
    }

    return {
        data: {
            merchant: {
                id: merchant.id,
                name: merchant.name,
                slug: merchant.slug,
                logo_url: merchant.logo_url,
                default_prep_time_min: merchant.default_prep_time_min,
                is_open: merchant.is_open,
            },
            settings: {
                max_capacity: settings.max_capacity,
                welcome_message: settings.welcome_message,
                qr_regenerated_at: settings.qr_regenerated_at,
                notifications_enabled: settings.notifications_enabled,
                auto_close_enabled: settings.auto_close_enabled,
            },
        },
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Update the merchant's display name, public slug, logo URL, and default prep time.
 *
 * Enforces a **1-hour cooldown** on slug changes to prevent enumeration attacks.
 * Returns the new slug so the caller can refresh QR Code rendering.
 *
 * @param input - Merchant identity fields. Validated by {@link MerchantIdentitySchema}.
 * @returns The (potentially new) slug — use it to refresh QR Code rendering.
 *
 * **Errors:**
 * | `error` string | Cause | Postgres code |
 * |---|---|---|
 * | Zod message or `"Données invalides."` | Validation failure | — |
 * | `"Session expirée. Veuillez vous reconnecter."` | No authenticated user | — |
 * | `"Commerce introuvable."` | Merchant row not found | — |
 * | `"Vous devez attendre encore {N} minute(s)..."` | Slug change cooldown (1 h) | — |
 * | `"Ce slug est déjà utilisé. Choisissez-en un autre."` | Slug uniqueness conflict | `23505` |
 * | `"Format du slug invalide."` | DB check constraint violation | `23514` |
 * | `"Erreur lors de la sauvegarde. Veuillez réessayer."` | Other Supabase error | — |
 */
export async function updateMerchantIdentityAction(
    input: MerchantIdentityInput,
): Promise<{ data: { slug: string } } | { error: string }> {
    const parsed = MerchantIdentitySchema.safeParse(input)
    if (!parsed.success) {
        return {
            error: parsed.error.issues[0]?.message ?? "Données invalides.",
        }
    }

    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Session expirée. Veuillez vous reconnecter." }
    }

    // Fetch current slug and last-changed timestamp to enforce the rate limit.
    const { data: current, error: fetchError } = await supabase
        .from("merchants")
        .select("slug, slug_last_changed_at")
        .eq("id", user.id)
        .single()

    if (fetchError || !current) {
        return { error: "Commerce introuvable." }
    }

    const slugChanged = parsed.data.slug !== current.slug

    if (slugChanged && current.slug_last_changed_at) {
        const lastChangedAt = new Date(current.slug_last_changed_at).getTime()
        const elapsed = Date.now() - lastChangedAt

        if (elapsed < SLUG_CHANGE_COOLDOWN_MS) {
            const minutesLeft = Math.ceil(
                (SLUG_CHANGE_COOLDOWN_MS - elapsed) / 60_000,
            )
            return {
                error: `Vous devez attendre encore ${minutesLeft} minute${
                    minutesLeft > 1 ? "s" : ""
                } avant de changer le slug.`,
            }
        }
    }

    const { error } = await supabase
        .from("merchants")
        .update({
            name: parsed.data.name,
            slug: parsed.data.slug,
            logo_url: parsed.data.logo_url ?? null,
            default_prep_time_min: parsed.data.default_prep_time_min,
            // Record when the slug changed so the next call can enforce the cooldown.
            ...(slugChanged
                ? { slug_last_changed_at: new Date().toISOString() }
                : {}),
        })
        .eq("id", user.id)

    if (error) {
        if (error.code === "23505") {
            return {
                error: "Ce slug est déjà utilisé. Choisissez-en un autre.",
            }
        }
        if (error.code === "23514") {
            return { error: "Format du slug invalide." }
        }
        return { error: "Erreur lors de la sauvegarde. Veuillez réessayer." }
    }

    return { data: { slug: parsed.data.slug } }
}

/**
 * Update queue configuration: capacity, welcome message, and notification flags.
 *
 * @param input - Validated by {@link QueueSettingsSchema}.
 *
 * **Errors:**
 * | `error` string | Cause |
 * |---|---|
 * | Zod message or `"Données invalides."` | Validation failure |
 * | `"Session expirée. Veuillez vous reconnecter."` | No authenticated user |
 * | `"Erreur lors de la sauvegarde. Veuillez réessayer."` | Supabase update failed |
 */
export async function updateQueueSettingsAction(
    input: QueueSettingsInput,
): Promise<{ data: null } | { error: string }> {
    const parsed = QueueSettingsSchema.safeParse(input)
    if (!parsed.success) {
        return {
            error: parsed.error.issues[0]?.message ?? "Données invalides.",
        }
    }

    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Session expirée. Veuillez vous reconnecter." }
    }

    const { error } = await supabase
        .from("settings")
        .update({
            max_capacity: parsed.data.max_capacity,
            welcome_message: parsed.data.welcome_message ?? null,
            notifications_enabled: parsed.data.notifications_enabled,
            auto_close_enabled: parsed.data.auto_close_enabled,
        })
        .eq("merchant_id", user.id)

    if (error) {
        return { error: "Erreur lors de la sauvegarde. Veuillez réessayer." }
    }

    return { data: null }
}

/**
 * Trigger a visual QR Code re-render by bumping `qr_regenerated_at`.
 *
 * Does **not** change the merchant slug or join URL. The `qr_regenerated_at`
 * timestamp is used client-side as a React key to force the QR component to remount.
 *
 * @returns ISO 8601 timestamp of the bump — used as a React key to force QR remount.
 *
 * **Errors:**
 * | `error` string | Cause |
 * |---|---|
 * | `"Session expirée. Veuillez vous reconnecter."` | No authenticated user |
 * | `"Erreur lors de la régénération du QR Code."` | Supabase update failed |
 */
export async function regenerateQRAction(): Promise<
    { data: { qr_regenerated_at: string } } | { error: string }
> {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Session expirée. Veuillez vous reconnecter." }
    }

    const now = new Date().toISOString()

    const { error } = await supabase
        .from("settings")
        .update({ qr_regenerated_at: now })
        .eq("merchant_id", user.id)

    if (error) {
        return { error: "Erreur lors de la régénération du QR Code." }
    }

    return { data: { qr_regenerated_at: now } }
}

/**
 * Remove the merchant's logo from Supabase Storage and clear `logo_url`.
 *
 * Lists all files under `merchant-logos/{merchant_id}/` and removes them
 * (handles any file extension without needing to track the exact name).
 *
 * **Errors:**
 * | `error` string | Cause |
 * |---|---|
 * | `"Session expirée. Veuillez vous reconnecter."` | No authenticated user |
 * | `"Erreur lors de la suppression du logo."` | Storage `list` or `remove` failed |
 * | `"Erreur lors de la mise à jour du profil."` | `merchants.logo_url` update failed |
 */
export async function deleteLogoAction(): Promise<
    { data: null } | { error: string }
> {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Session expirée. Veuillez vous reconnecter." }
    }

    // List all files in the merchant's folder (handles any extension).
    const { data: files, error: listError } = await supabase.storage
        .from("merchant-logos")
        .list(user.id)

    if (listError) {
        return { error: "Erreur lors de la suppression du logo." }
    }

    if (files && files.length > 0) {
        const paths = files.map((f) => `${user.id}/${f.name}`)
        const { error: removeError } = await supabase.storage
            .from("merchant-logos")
            .remove(paths)
        if (removeError) {
            return { error: "Erreur lors de la suppression du logo." }
        }
    }

    const { error: updateError } = await supabase
        .from("merchants")
        .update({ logo_url: null })
        .eq("id", user.id)

    if (updateError) {
        return { error: "Erreur lors de la mise à jour du profil." }
    }

    return { data: null }
}

/**
 * Check if a slug is available, **excluding the calling merchant's own slug**.
 *
 * Used in the Settings context so a merchant can re-save their current slug
 * without it being reported as taken. Called client-side with a 500ms debounce.
 * Delegates to the `check_slug_available` RPC (`SECURITY DEFINER`).
 *
 * @param slug - The slug string to check.
 * @returns `true` if available, `false` if taken or on any error (safe default).
 */
export async function checkSlugAvailabilitySettingsAction(
    slug: string,
): Promise<boolean> {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) return false

    const { data, error } = await supabase.rpc("check_slug_available", {
        p_slug: slug,
        p_exclude_merchant_id: user.id,
    })

    if (error) return false
    return data === true
}
