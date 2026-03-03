import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import type { Database } from "@/types/database"

/**
 * Supabase middleware helper — refreshes the session cookie on every request.
 * Must be called from `middleware.ts` before any auth checks.
 *
 * Returns a `{ supabase, response }` pair so middleware can read the session
 * and then send the mutated response with updated cookies downstream.
 */
export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value),
                    )
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options),
                    )
                },
            },
        },
    )

    // Refresh session — required for Server Components to read the latest session.
    // Do NOT add logic between createServerClient and supabase.auth.getUser().
    // Wrapped in try/catch so a network failure (e.g. bad env vars) never crashes the proxy.
    let user = null
    try {
        const { data } = await supabase.auth.getUser()
        user = data.user
    } catch {
        // Supabase unreachable — treat as unauthenticated; proxy handles redirects.
    }

    return { supabase, supabaseResponse, user }
}
