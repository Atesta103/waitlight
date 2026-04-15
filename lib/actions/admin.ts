/**
 * @module actions/admin
 * @category Actions
 *
 * Server Actions for super-admin operations.
 * These actions bypass RLS via the admin client and MUST verify
 * that the caller is in the ADMIN_EMAILS allowlist before any DB write.
 */
"use server"

import { createClient } from "@/lib/supabase/server"
import { adminSupabase } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

/**
 * Verify that the currently authenticated user is in the ADMIN_EMAILS list.
 * Returns the user object if authorized, throws otherwise.
 *
 * This is a defence-in-depth check on top of the layout-level guard.
 * Server Actions can be invoked directly, bypassing the layout — this
 * ensures no admin action can succeed without a valid admin session.
 */
async function requireAdmin() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Session expirée.")
    }

    const adminEmails = (process.env.ADMIN_EMAILS ?? "")
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean)

    if (!adminEmails.includes(user.email ?? "")) {
        // Log the unauthorized attempt server-side.
        console.warn(
            `[admin] Unauthorized access attempt by ${user.email ?? "unknown"} (uid: ${user.id})`,
        )
        throw new Error("Accès non autorisé.")
    }

    return user
}

/**
 * Toggles the paywall bypass flag for a specific merchant.
 * Uses the admin client to bypass RLS since merchants cannot edit this field.
 *
 * @param merchantId - The UUID of the merchant
 * @param bypass - Whether they should bypass the paywall
 */
export async function togglePaywallBypass(
    merchantId: string,
    bypass: boolean,
): Promise<{ success: true } | { error: string }> {
    try {
        // Guard — always verify admin identity regardless of UI route
        await requireAdmin()
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Accès non autorisé."
        return { error: msg }
    }

    const { error } = await adminSupabase
        .from("merchants")
        .update({ bypass_paywall: bypass })
        .eq("id", merchantId)

    if (error) {
        console.error("[togglePaywallBypass] DB error:", error)
        return { error: "Impossible de mettre à jour le statut. Veuillez réessayer." }
    }

    revalidatePath("/admin")
    return { success: true }
}
