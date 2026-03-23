/**
 * @module supabase/admin
 * @category Database
 *
 * Service-role Supabase client — bypasses RLS.
 *
 * ONLY import this in:
 *  - app/api/webhooks/stripe/route.ts
 *  - app/billing-success/page.tsx
 *  - app/admin/page.tsx
 *
 * Never import in Client Components or any file accessible from the browser.
 */
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set")
}

export const adminSupabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    },
)
