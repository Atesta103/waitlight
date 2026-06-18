import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

/**
 * Server-side auth guard.
 * Redirects unauthenticated users to /login.
 * Use in merchant-facing server actions and page components.
 *
 * Note: API routes should NOT use this helper — they need to return HTTP
 * responses (e.g. { error: "Unauthorized" }) rather than redirect.
 */
export async function requireAuth() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) redirect("/login")
    return { supabase, user }
}
