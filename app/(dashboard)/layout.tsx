import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { LayoutDashboard, Settings, Store } from "lucide-react"

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
        .select("id, name")
        .eq("id", user!.id)
        .maybeSingle()

    if (!merchant) {
        redirect("/onboarding")
    }

    return (
        <div className="min-h-screen bg-surface-base">
            <header className="border-b border-border-default bg-surface-card">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
                    <div className="flex items-center gap-2 text-text-primary">
                        <Store
                            size={20}
                            className="text-brand-primary"
                            aria-hidden="true"
                        />
                        <span className="font-semibold">{merchant.name}</span>
                    </div>
                    <nav aria-label="Navigation du tableau de bord">
                        <ul className="flex items-center gap-1 list-none m-0 p-0">
                            <li>
                                <Link
                                    href="/dashboard"
                                    className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-border-default hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                                >
                                    <LayoutDashboard
                                        size={16}
                                        aria-hidden="true"
                                    />
                                    Tableau de bord
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/dashboard/settings"
                                    className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-border-default hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                                >
                                    <Settings size={16} aria-hidden="true" />
                                    Paramètres
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </div>
            </header>
            <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        </div>
    )
}
