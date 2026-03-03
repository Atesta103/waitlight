import { type NextRequest, NextResponse } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

/**
 * Next.js Proxy (formerly Middleware) — runs on every matching request.
 *
 * Responsibilities:
 *  1. Refresh the Supabase session cookie so Server Components always see
 *     the latest auth state.
 *  2. Protect the (dashboard) routes — redirect unauthenticated users to /login.
 *  3. Redirect authenticated users away from (auth) pages to /dashboard.
 */
export async function proxy(request: NextRequest) {
    const { supabaseResponse, user } = await updateSession(request)
    const { pathname } = request.nextUrl

    const isAuthPage =
        pathname.startsWith("/login") ||
        pathname.startsWith("/register") ||
        pathname.startsWith("/forgot-password") ||
        pathname.startsWith("/reset-password")

    const isProtectedPage =
        pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding")

    // Unauthenticated user trying to access a protected route → send to login.
    if (isProtectedPage && !user) {
        const loginUrl = request.nextUrl.clone()
        loginUrl.pathname = "/login"
        loginUrl.searchParams.set("redirectTo", pathname)
        return NextResponse.redirect(loginUrl)
    }

    // Authenticated user visiting a login/register page → send to dashboard.
    if (isAuthPage && user) {
        const dashboardUrl = request.nextUrl.clone()
        dashboardUrl.pathname = "/dashboard"
        dashboardUrl.search = ""
        return NextResponse.redirect(dashboardUrl)
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * Run on all paths except:
         *   - _next/static (static files)
         *   - _next/image  (image optimisation)
         *   - favicon.ico  (favicon)
         *   - public assets (png, svg, etc.)
         *   - /auth/callback (Supabase PKCE redirect — must NOT be middleware-gated)
         */
        "/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
}
