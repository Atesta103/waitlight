"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { OnboardingSchema } from "@/lib/validators/onboarding"

/**
 * Check whether a slug is already taken.
 * Returns true if available, false if taken.
 * Called client-side from SlugInput with a 500ms debounce.
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
 * Create the merchant profile and settings row for the authenticated user.
 * Called on final step of the OnboardingForm.
 * On success, redirects to /dashboard.
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

    // getSession() reads the JWT from cookies without a network round-trip.
    // The proxy already validated the session via getUser() at the edge,
    // so this is safe and avoids flaky network errors in Server Actions.
    const {
        data: { session },
    } = await supabase.auth.getSession()

    const user = session?.user ?? null

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

    redirect("/dashboard")
}
