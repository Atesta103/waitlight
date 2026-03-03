import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

type DashboardLayoutProps = {
    children: ReactNode
}

/**
 * Dashboard layout — server-side auth guard (defence in depth on top of proxy).
 * Also ensures the merchant has completed onboarding before entering the dashboard.
 */
export default async function DashboardLayout({
    children,
}: DashboardLayoutProps) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    // Check merchant profile exists — redirect to onboarding if not.
    const { data: merchant } = await supabase
        .from("merchants")
        .select("id")
        .eq("id", user!.id)
        .maybeSingle()

    if (!merchant) {
        redirect("/onboarding")
    }

    return (
        <div className="min-h-screen bg-surface-base">
            {/* TODO: add DashboardHeader once merchant data is wired */}
            <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        </div>
    )
}
