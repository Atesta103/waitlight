import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

/**
 * Admin layout — server-side ADMIN_EMAILS guard.
 * Any user not in the allowlist is silently redirected to /dashboard.
 */
export default async function AdminLayout({
    children,
}: {
    children: ReactNode
}) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) redirect("/login")

    const adminEmails = (process.env.ADMIN_EMAILS ?? "")
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean)

    if (!adminEmails.includes(user.email ?? "")) {
        redirect("/dashboard")
    }

    return <>{children}</>
}
