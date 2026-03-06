import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { DashboardProviders } from "./providers"
import { UserMenu } from "@/components/composed/UserMenu"
import { HeaderQueueControl } from "@/components/composed/HeaderQueueControl"
import { LayoutDashboard, QrCode } from "lucide-react"

type DashboardLayoutProps = {
    children: ReactNode
}

/**
 * Dashboard layout — server-side auth guard (defence in depth on top of proxy).
 * Also ensures the merchant has completed onboarding before entering the dashboard.
 * Wraps children with TanStack Query QueryClientProvider.
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
        .select("id, name, slug, is_open")
        .eq("id", user!.id)
        .maybeSingle()

    if (!merchant) {
        redirect("/onboarding")
    }

    return (
        <DashboardProviders>
            <div className="min-h-screen bg-surface-base">
                <header className="sticky top-0 z-40 border-b border-border-default bg-surface-card/95 backdrop-blur-sm">
                    <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-2.5">
                        {/* Left — nav */}
                        <nav aria-label="Navigation du tableau de bord">
                            <ul className="flex items-center gap-0.5 list-none m-0 p-0">
                                <li>
                                    <Link
                                        href="/dashboard"
                                        className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-base hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus transition-colors"
                                    >
                                        <LayoutDashboard
                                            size={16}
                                            aria-hidden="true"
                                        />
                                        <span className="hidden sm:inline">
                                            File d&apos;attente
                                        </span>
                                    </Link>
                                </li>
                            </ul>
                        </nav>

                        <HeaderQueueControl
                            initialIsOpen={merchant.is_open}
                            merchantSlug={merchant.slug}
                            merchantId={merchant.id}
                        />

                        {/* Right — user menu */}
                        <div className="flex justify-end">
                            <UserMenu name={merchant.name} />
                        </div>
                    </div>
                </header>
                <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
            </div>
        </DashboardProviders>
    )
}
