/**
 * @module actions/onboarding
 * @category Actions
 *
 * Server Actions for the merchant onboarding flow (first-time setup).
 */
"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { OnboardingSchema } from "@/lib/validators/onboarding"

/**
 * Check whether a slug is already taken (no merchant exclusion).
 *
 * Used during onboarding before a merchant row exists. For the settings
 * context (where the merchant's own slug must be excluded), use
 * `checkSlugAvailabilitySettingsAction` instead.
 *
 * Called client-side from `SlugInput` with a **500ms debounce**.
 *
 * @param slug - Slug string to check.
 * @returns `true` if available, `false` if taken.
 */
export async function checkSlugAvailabilityAction(
    slug: string,
): Promise<boolean> {
    const supabase = await createClient()
    const { data } = await supabase
        .from("merchants")
        .select("id")
        .eq("slug", slug)
        .maybeSingle()

    return data === null
}

/**
 * Create the `merchants` and `settings` rows for the authenticated user.
 * Final step of the onboarding wizard.
 *
 * On success, redirects to `/dashboard`. If a merchant row already exists
 * (e.g. duplicate submission), skips creation and redirects directly.
 *
 * **Transaction note:** two sequential inserts with manual rollback — if
 * `settings.insert` fails, the `merchants` row is deleted to stay consistent.
 *
 * @param formData - Mapped to {@link OnboardingSchema} before validation.
 * @returns Redirects to `/dashboard` on success.
 *
 * **Errors:**
 * | `error` string | Cause | Postgres code |
 * |---|---|---|
 * | Zod message or `"Données invalides."` | Validation failure | — |
 * | `"Session expirée. Veuillez vous reconnecter."` | No session | — |
 * | `"Ce slug est déjà utilisé. Choisissez-en un autre."` | Slug uniqueness conflict | `23505` |
 * | `"Erreur lors de la création. Veuillez réessayer."` | `merchants.insert` failed | — |
 * | `"Erreur lors de la configuration. Veuillez réessayer."` | `settings.insert` failed (+ rollback) | — |
 */
export async function createMerchantAction(formData: {
    name: string
    slug: string
    maxCapacity: number
    welcomeMessage: string
}): Promise<{ error: string } | never> {
    const parsed = OnboardingSchema.safeParse({
        name: formData.name,
        slug: formData.slug,
        max_capacity: formData.maxCapacity,
        welcome_message: formData.welcomeMessage || undefined,
    })

    if (!parsed.success) {
        return {
            error: parsed.error.issues[0]?.message ?? "Données invalides.",
        }
    }

    const supabase = await createClient()

    // getUser() forces a round-trip to validate the session token,
    // which is more secure than getSession() which just reads the cookie.
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return {
            error: "Session expirée. Veuillez vous reconnecter.",
        }
    }

    // Guard: don't create a duplicate merchant row
    const { data: existing } = await supabase
        .from("merchants")
        .select("id")
        .eq("id", user.id)
        .maybeSingle()

    if (existing) {
        redirect("/dashboard")
    }

    // Insert merchant row (id = auth.uid() enforced by RLS)
    const { error: merchantError } = await supabase.from("merchants").insert({
        id: user.id,
        name: parsed.data.name,
        slug: parsed.data.slug,
        is_open: false,
    })

    if (merchantError) {
        if (merchantError.code === "23505") {
            // unique_violation on slug
            return {
                error: "Ce slug est déjà utilisé. Choisissez-en un autre.",
            }
        }
        return { error: "Erreur lors de la création. Veuillez réessayer." }
    }

    // Insert settings row
    const { error: settingsError } = await supabase.from("settings").insert({
        merchant_id: user.id,
        max_capacity: parsed.data.max_capacity,
        welcome_message: parsed.data.welcome_message ?? null,
        qr_regenerated_at: null,
    })

    if (settingsError) {
        // Rollback merchant row to keep data consistent
        await supabase.from("merchants").delete().eq("id", user.id)
        return {
            error: "Erreur lors de la configuration. Veuillez réessayer.",
        }
    }

    // Redirect to subscription page — merchants must subscribe before accessing the dashboard.
    redirect("/subscribe")
}
