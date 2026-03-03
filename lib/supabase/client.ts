import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/database"

/**
 * Browser Supabase client.
 * Use in Client Components and TanStack Query hooks.
 * Never use the service_role key here.
 */
export function createClient() {
    return createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
}
