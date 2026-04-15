import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { isActiveStatus } from "@/lib/subscription-status"
import { QueryProvider } from "@/components/providers/QueryProvider"
import { UserMenu } from "@/components/composed/UserMenu"
import { HeaderQueueControl } from "@/components/composed/HeaderQueueControl"
import { LayoutDashboard, BarChart2 } from "lucide-react"

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
    const { data: merchant, error } = await supabase
        .from("merchants")
        .select("id, name, slug, is_open, bypass_paywall")
        .eq("id", user!.id)
        .maybeSingle()

    if (error) {
        console.error("Layout merchant fetch error:", error)
        // Throwing here breaks an otherwise silent infinite redirect loop
        // with /onboarding if columns are missing (e.g. bypass_paywall)
        throw new Error("Failed to load merchant profile: " + error.message)
    }

    if (!merchant) {
        redirect("/onboarding")
    }

    // Subscription gate — must have an active or trialing subscription, OR bypass flag.
    if (!merchant.bypass_paywall) {
        const { data: subscriptionRaw } = await supabase
            .from("subscriptions")
            .select("status")
            .eq("merchant_id", user.id)
            .maybeSingle()

        const subscription = subscriptionRaw as { status: string } | null

        if (!subscription || !isActiveStatus(subscription.status)) {
            redirect("/subscribe")
        }
    }

    return (
        <QueryProvider>
            <div className="min-h-screen bg-surface-base">
                <header className="fixed inset-x-0 bottom-0 z-40 border-t border-border-default bg-surface-card/95 backdrop-blur-sm md:sticky md:top-0 md:bottom-auto md:border-t-0 md:border-b">
                    <div className="mx-auto max-w-6xl px-3 py-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] md:px-4 md:py-2.5 md:pb-2.5">
                        <div className="flex items-center gap-2 md:hidden">
                            <nav
                                aria-label="Navigation du tableau de bord"
                                className="flex items-center gap-1"
                            >
                                <Link
                                    href="/dashboard"
                                    className="inline-flex items-center justify-center rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-base hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                                    aria-label="File d'attente"
                                >
                                    <LayoutDashboard size={18} aria-hidden="true" />
                                </Link>
                                <Link
                                    href="/analytics"
                                    className="inline-flex items-center justify-center rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-base hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                                    aria-label="Analytiques"
                                >
                                    <BarChart2 size={18} aria-hidden="true" />
                                </Link>
                            </nav>

                            <div className="min-w-0 flex-1">
                                <HeaderQueueControl
                                    initialIsOpen={merchant.is_open}
                                    merchantSlug={merchant.slug}
                                    merchantId={merchant.id}
                                    mode="mobile"
                                />
                            </div>

                            <div className="shrink-0">
                                <UserMenu
                                    name={merchant.name}
                                    dropdownSide="top"
                                />
                            </div>
                        </div>

                        <div className="hidden items-center gap-4 md:grid md:grid-cols-[1fr_auto_1fr]">
                            {/* Left — nav */}
                            <nav aria-label="Navigation du tableau de bord">
                                <ul className="m-0 flex list-none items-center gap-0.5 p-0">
                                    <li>
                                        <Link
                                            href="/dashboard"
                                            className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-base hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
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
                                    <li>
                                        <Link
                                            href="/analytics"
                                            className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-base hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                                        >
                                            <BarChart2
                                                size={16}
                                                aria-hidden="true"
                                            />
                                            <span className="hidden sm:inline">
                                                Analytiques
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
                    </div>
                </header>
                <main className="mx-auto max-w-6xl px-4 py-8 pb-28 md:pb-8">
                    {children}
                </main>
            </div>
        </QueryProvider>
    )
}
