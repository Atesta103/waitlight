"use server"

import { adminSupabase } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

/**
 * Toggles the paywall bypass flag for a specific merchant.
 * Uses the admin client to bypass RLS since merchants cannot edit this field.
 * 
 * @param merchantId - The UUID of the merchant
 * @param bypass - Whether they should bypass the paywall
 */
export async function togglePaywallBypass(merchantId: string, bypass: boolean) {
    const { error } = await adminSupabase
        .from("merchants")
        .update({ bypass_paywall: bypass })
        .eq("id", merchantId)

    if (error) {
        console.error("Failed to update paywall bypass:", error)
        throw new Error("Failed to update paywall bypass")
    }

    revalidatePath("/admin")
    return { success: true }
}
