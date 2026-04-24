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

export type WeeklyScheduleDay = {
    open: string
    close: string
} | null

export type ScheduleException = {
    date: string
    closed?: boolean
    open?: string
    close?: string
}

export type ScheduleData = {
    weekly: Record<string, WeeklyScheduleDay>
    exceptions: ScheduleException[]
}

export type NotificationChannels = {
    sound: boolean
    vibrate: boolean
    toast: boolean
    push: boolean
}

export type MerchantSettingsData = {
    merchant: {
        id: string
        name: string
        slug: string
        logo_url: string | null
        background_url: string | null
        brand_color: string | null
        font_family: string | null
        border_radius: string | null
        theme_pattern: string | null
        default_prep_time_min: number
        is_open: boolean
        /** Auto-computed average prep time (IQR + EMA). `null` = not enough data yet. */
        calculated_avg_prep_time: number | null
        /** UTC timestamp of the last `calculate_avg_prep()` run. */
        avg_prep_computed_at: string | null
    }
    settings: {
        max_capacity: number
        welcome_message: string | null
        thank_you_message: string | null
        qr_regenerated_at: string | null
        notifications_enabled: boolean
        auto_close_enabled: boolean
        schedule: ScheduleData | null
        notification_channels: NotificationChannels
        notification_sound: string
        approaching_position_enabled: boolean
        approaching_position_threshold: number
        approaching_time_enabled: boolean
        approaching_time_threshold_min: number
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
        .select(
            "id, name, slug, logo_url, background_url, brand_color, font_family, border_radius, theme_pattern, default_prep_time_min, is_open, calculated_avg_prep_time, avg_prep_computed_at",
        )
        .eq("id", user.id)
        .single()

    if (merchantError || !merchant) {
        console.error("Merchant fetch error", merchantError);
        return { error: "Commerce introuvable." }
    }

    const { data: settings, error: settingsError } = await supabase
        .from("settings")
        .select(
            "max_capacity, welcome_message, thank_you_message, qr_regenerated_at, notifications_enabled, auto_close_enabled, schedule, notification_channels, notification_sound, approaching_position_enabled, approaching_position_threshold, approaching_time_enabled, approaching_time_threshold_min",
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
                background_url: merchant.background_url,
                brand_color: merchant.brand_color,
                font_family: merchant.font_family,
                border_radius: merchant.border_radius,
                theme_pattern: merchant.theme_pattern,
                default_prep_time_min: merchant.default_prep_time_min,
                is_open: merchant.is_open,
                calculated_avg_prep_time:
                    merchant.calculated_avg_prep_time ?? null,
                avg_prep_computed_at: merchant.avg_prep_computed_at ?? null,
            },
            settings: {
                max_capacity: settings.max_capacity,
                welcome_message: settings.welcome_message,
                thank_you_message: settings.thank_you_message ?? null,
                qr_regenerated_at: settings.qr_regenerated_at,
                notifications_enabled: settings.notifications_enabled,
                auto_close_enabled: settings.auto_close_enabled,
                schedule: (settings.schedule as ScheduleData) ?? null,
                notification_channels: (settings.notification_channels as NotificationChannels) ?? { sound: true, vibrate: true, toast: true, push: true },
                notification_sound: settings.notification_sound ?? "arpeggio",
                approaching_position_enabled: settings.approaching_position_enabled ?? false,
                approaching_position_threshold: settings.approaching_position_threshold ?? 3,
                approaching_time_enabled: settings.approaching_time_enabled ?? false,
                approaching_time_threshold_min: settings.approaching_time_threshold_min ?? 5,
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
            brand_color: parsed.data.brand_color ?? "#4F46E5",
            font_family: parsed.data.font_family ?? "Inter",
            border_radius: parsed.data.border_radius ?? "0.5rem",
            theme_pattern: parsed.data.theme_pattern ?? "none",
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

/**
 * Reset the auto-computed preparation time, returning the merchant to
 * manual mode (`default_prep_time_min`).
 *
 * Sets `calculated_avg_prep_time = NULL` and `avg_prep_computed_at = NULL`.
 * The cron job will re-activate once enough new ticket data accumulates.
 *
 * **Errors:**
 * | `error` string | Cause |
 * |---|---|
 * | `"Session expirée. Veuillez vous reconnecter."` | No authenticated user |
 * | `"Erreur lors de la réinitialisation. Veuillez réessayer."` | Supabase update failed |
 */
export async function resetAvgPrepTimeAction(): Promise<
    { data: null } | { error: string }
> {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Session expirée. Veuillez vous reconnecter." }
    }

    const { error } = await supabase
        .from("merchants")
        .update({
            calculated_avg_prep_time: null,
            avg_prep_computed_at: null,
        })
        .eq("id", user.id)

    if (error) {
        return {
            error: "Erreur lors de la réinitialisation. Veuillez réessayer.",
        }
    }

    return { data: null }
}

// ─────────────────────────────────────────────────────────────────────────────
// Banned Words CRUD
// ─────────────────────────────────────────────────────────────────────────────

export type BannedWord = {
    id: string
    word: string
    created_at: string
}

/**
 * Fetch all banned words for the authenticated merchant.
 */
export async function getBannedWordsAction(): Promise<
    { data: BannedWord[] } | { error: string }
> {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Session expirée. Veuillez vous reconnecter." }
    }

    const { data, error } = await supabase
        .from("banned_words")
        .select("id, word, created_at")
        .eq("merchant_id", user.id)
        .order("created_at", { ascending: false })

    if (error) {
        return { error: "Impossible de charger les mots bannis." }
    }

    return { data: data ?? [] }
}

/**
 * Add a banned word for the authenticated merchant.
 * Silently ignores duplicates (unique constraint on word+merchant_id).
 */
export async function addBannedWordAction(
    word: string,
): Promise<{ data: BannedWord } | { error: string }> {
    if (!word || word.trim().length < 1) {
        return { error: "Le mot ne peut pas être vide." }
    }

    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Session expirée. Veuillez vous reconnecter." }
    }

    const { data, error } = await supabase
        .from("banned_words")
        .insert({
            word: word.toLowerCase().trim(),
            merchant_id: user.id,
        })
        .select("id, word, created_at")
        .single()

    if (error) {
        if (error.code === "23505") {
            return { error: "Ce mot est déjà dans la liste." }
        }
        return { error: "Impossible d'ajouter ce mot." }
    }

    return { data }
}

/**
 * Remove a banned word by ID for the authenticated merchant.
 */
export async function removeBannedWordAction(
    wordId: string,
): Promise<{ data: null } | { error: string }> {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Session expirée. Veuillez vous reconnecter." }
    }

    const { error } = await supabase
        .from("banned_words")
        .delete()
        .eq("id", wordId)
        .eq("merchant_id", user.id)

    if (error) {
        return { error: "Impossible de supprimer ce mot." }
    }

    return { data: null }
}

// ─────────────────────────────────────────────────────────────────────────────
// Schedule
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Update the merchant's queue schedule (weekly + exception dates).
 */
export async function updateScheduleAction(
    schedule: ScheduleData | null,
): Promise<{ data: null } | { error: string }> {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Session expirée. Veuillez vous reconnecter." }
    }

    const { error } = await supabase
        .from("settings")
        .update({ schedule: schedule as unknown as string })
        .eq("merchant_id", user.id)

    if (error) {
        return { error: "Erreur lors de la sauvegarde des horaires." }
    }

    return { data: null }
}

// ─────────────────────────────────────────────────────────────────────────────
// Thank You Message
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Update the custom "thank you" message shown to clients when their ticket is completed.
 */
export async function updateThankYouMessageAction(
    message: string | null,
): Promise<{ data: null } | { error: string }> {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Session expirée. Veuillez vous reconnecter." }
    }

    const trimmed = message?.trim() || null

    const { error } = await supabase
        .from("settings")
        .update({ thank_you_message: trimmed })
        .eq("merchant_id", user.id)

    if (error) {
        return { error: "Erreur lors de la sauvegarde." }
    }

    return { data: null }
}

// ─────────────────────────────────────────────────────────────────────────────
// Notification Preferences
// ─────────────────────────────────────────────────────────────────────────────

export type NotificationPreferencesInput = {
    notification_channels: NotificationChannels
    notification_sound: string
    approaching_position_enabled: boolean
    approaching_position_threshold: number
    approaching_time_enabled: boolean
    approaching_time_threshold_min: number
}

/**
 * Update the merchant's notification preferences.
 */
export async function updateNotificationPreferencesAction(
    input: NotificationPreferencesInput,
): Promise<{ data: null } | { error: string }> {
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
            notification_channels: input.notification_channels as unknown as string,
            notification_sound: input.notification_sound,
            approaching_position_enabled: input.approaching_position_enabled,
            approaching_position_threshold: input.approaching_position_threshold,
            approaching_time_enabled: input.approaching_time_enabled,
            approaching_time_threshold_min: input.approaching_time_threshold_min,
        })
        .eq("merchant_id", user.id)

    if (error) {
        return { error: "Erreur lors de la sauvegarde des préférences." }
    }

    return { data: null }
}

// ─────────────────────────────────────────────────────────────────────────────
// Background Image
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Remove the merchant's background image from Storage and clear `background_url`.
 */
export async function deleteBackgroundAction(): Promise<
    { data: null } | { error: string }
> {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Session expirée. Veuillez vous reconnecter." }
    }

    const { data: files, error: listError } = await supabase.storage
        .from("merchant-backgrounds")
        .list(user.id)

    if (listError) {
        return { error: "Erreur lors de la suppression de l'image de fond." }
    }

    if (files && files.length > 0) {
        const paths = files.map((f) => `${user.id}/${f.name}`)
        const { error: removeError } = await supabase.storage
            .from("merchant-backgrounds")
            .remove(paths)
        if (removeError) {
            return { error: "Erreur lors de la suppression de l'image de fond." }
        }
    }

    const { error: updateError } = await supabase
        .from("merchants")
        .update({ background_url: null })
        .eq("id", user.id)

    if (updateError) {
        return { error: "Erreur lors de la mise à jour du profil." }
    }

    return { data: null }
}
