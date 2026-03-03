import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * Auth callback Route Handler.
 *
 * Supabase redirects here after:
 *   - Email confirmation (sign-up)
 *   - Password reset (magic link)
 *   - OAuth provider sign-in
 *
 * The `code` query param is exchanged for a session cookie via PKCE.
 * The browser is then redirected to `next` (defaults to /dashboard).
 */
export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get("code")
    const next = searchParams.get("next") ?? "/dashboard"

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // Successful exchange — redirect to the intended destination.
            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // Invalid or expired code — redirect back to login with an error flag.
    return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
