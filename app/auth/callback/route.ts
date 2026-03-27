/**
 * @module auth-callback
 * @category Routes
 *
 * ### `GET /auth/callback`
 *
 * OAuth/PKCE callback Route Handler. Supabase redirects here after:
 * - Email confirmation (sign-up)
 * - Password reset (magic link)
 * - OAuth provider authentication (Google, Apple)
 *
 * The `code` query param is exchanged for a session cookie via PKCE.
 *
 * | Scenario | Query params | Redirect |
 * |---|---|---|
 * | OAuth cancelled | `?error=access_denied` | `/login?error=oauth_cancelled` |
 * | OAuth error | `?error=*` | `/login?error=oauth_error` |
 * | PKCE success | `?code=*` | `{origin}{next}` (default `/dashboard`) |
 * | Invalid/expired code | `?code=*` (exchange fails) | `/login?error=auth_callback_error` |
 * | No code | — | `/login?error=auth_callback_error` |
 *
 * > This route is **excluded from middleware protection** by design.
 */
import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { checkRateLimit } from "@/lib/utils/rate-limit"

/**
 * Auth callback Route Handler.
 *
 * Supabase redirects here after:
 *   - Email confirmation (sign-up)
 *   - Password reset (magic link)
 *   - OAuth provider sign-in (Google, Apple)
 *
 * The `code` query param is exchanged for a session cookie via PKCE.
 * The browser is then redirected to `next` (defaults to /dashboard).
 *
 * Error cases handled:
 *   - `?error=access_denied` — user cancelled the OAuth consent screen
 *   - `?error=*` — any other provider-level OAuth error
 *   - Missing/invalid code — expired link or tampered URL
 */
export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get("code")
    const next = searchParams.get("next") ?? "/dashboard"

    // ── Rate Limiting ────────────────────────────────────────────────────────
    const ip = request.headers.get("x-forwarded-for") ?? "unknown"
    const isAllowed = checkRateLimit(`auth_callback_${ip}`, 10, 60_000) // 10 hits per minute per IP

    if (!isAllowed) {
        return NextResponse.redirect(`${origin}/login?error=oauth_error&message=Too+many+requests`)
    }

    // ── OAuth provider returned an error (e.g. user cancelled) ────────────
    const oauthError = searchParams.get("error")
    if (oauthError) {
        const errorCode =
            oauthError === "access_denied" ? "oauth_cancelled" : "oauth_error"
        return NextResponse.redirect(`${origin}/login?error=${errorCode}`)
    }

    // ── PKCE code exchange ──────────────────────────────────────────────────
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
