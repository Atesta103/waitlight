import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { isActiveStatus } from "@/lib/subscription-status"
import { QueryProvider } from "@/components/providers/QueryProvider"
import { getContrastYIQ, isValidHexCode } from "@/lib/utils/color"
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
        .select("id, name, slug, logo_url, is_open, bypass_paywall, brand_color, font_family, border_radius")
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

    // Check subscription status — used to gate queue launch, not dashboard access.
    let hasSubscription = merchant!.bypass_paywall
    if (!hasSubscription) {
        const { data: subscriptionRaw } = await supabase
            .from("subscriptions")
            .select("status")
            .eq("merchant_id", user!.id)
            .maybeSingle()

        const subscription = subscriptionRaw as { status: string } | null
        hasSubscription = !!subscription && isActiveStatus(subscription.status)
    }

    const defaultColor = "#4F46E5"
    let brandColor = defaultColor
    let contrastColor = "#FFFFFF"

    if (merchant!.brand_color && isValidHexCode(merchant!.brand_color)) {
        brandColor = merchant!.brand_color
        contrastColor = getContrastYIQ(merchant!.brand_color) === "white" ? "#FFFFFF" : "#000000"
    }

    const fontFamily = merchant!.font_family || "Inter"
    const borderRadius = merchant!.border_radius || "0.5rem"

    return (
        <QueryProvider>
            <div
                id="dashboard-root"
                // Fixed-height app shell at every screen size (dvh, not vh:
                // correctly accounts for Safari's address bar showing/hiding on
                // iPad/iPhone) instead of natural document flow, so header + QR
                // panel stay fixed and only the ticket list scrolls internally.
                className="flex h-dvh flex-col overflow-hidden bg-surface-base"
                style={{
                    fontFamily: `var(--font-brand)`,
                    "--color-brand-primary": brandColor,
                    "--color-brand-primary-hover": brandColor,
                    "--color-border-focus": brandColor,
                    "--color-text-on-primary": contrastColor,
                    "--font-brand": `var(--font-${fontFamily.toLowerCase().replace(" ", "-")})`,
                    "--radius-brand": borderRadius,
                    "--radius-sm": borderRadius,
                    "--radius-md": borderRadius,
                    "--radius-lg": borderRadius,
                    "--radius-xl": borderRadius,
                    "--radius-2xl": borderRadius,
                } as React.CSSProperties}
            >
                <header className="fixed inset-x-0 bottom-0 z-40 shrink-0 border-t border-border-default bg-surface-card/95 backdrop-blur-sm md:sticky md:top-0 md:bottom-auto md:border-t-0 md:border-b">
                    {/* Full-bleed, not mx-auto max-w-6xl: the queue page's
                        content now stretches to fill the screen at lg:+ (see
                        QueueSection.tsx), so a narrower centered header above
                        it would visibly misalign. The header's own 3-column
                        grid (nav / toggle / user menu) already spreads
                        cleanly edge-to-edge at any width — this doesn't
                        affect Settings/Analytics' own content, only this bar. */}
                    <div className="px-3 py-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] md:px-4 md:py-2.5 md:pb-2.5">
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
                                    initialIsOpen={merchant!.is_open}
                                    merchantSlug={merchant!.slug}
                                    merchantId={merchant!.id}
                                    hasSubscription={hasSubscription}
                                    mode="mobile"
                                />
                            </div>

                            <div className="shrink-0">
                                <UserMenu
                                    name={merchant!.name}
                                    logoUrl={merchant!.logo_url}
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
                                initialIsOpen={merchant!.is_open}
                                merchantSlug={merchant!.slug}
                                merchantId={merchant!.id}
                                hasSubscription={hasSubscription}
                            />

                            {/* Right — user menu */}
                            <div className="flex justify-end">
                                <UserMenu name={merchant!.name} logoUrl={merchant!.logo_url} />
                            </div>
                        </div>
                    </div>
                </header>
                {/* flex-1 + min-h-0 let this shrink below its content's natural
                    height inside the fixed-height shell above — without min-h-0
                    a flex item never shrinks past its content, and the overflow
                    would never reach this box's own scrollbar. overflow-y-auto
                    here is a generic fallback so Settings/Analytics (out of this
                    feature's scope) keep scrolling exactly as before, just
                    scoped to this box instead of the whole page; on the queue
                    page specifically, at every screen size, nothing actually
                    overflows this box — QueueList clips its own overflow first
                    (or, on phone, only the active tab's panel is rendered), so
                    this scrollbar never appears there. pb-28 on mobile clears
                    the fixed bottom header bar, which sits outside the flex
                    flow (position: fixed takes it out of flow entirely, even
                    inside a flex container). */}
                {/* max-w-6xl is the right default for most dashboard pages
                    (Settings' form, Analytics' charts read better capped),
                    but the queue page opts out of it — see the full-bleed
                    wrapper in QueueSection.tsx. */}
                {/* overflow-x-visible is explicit, not incidental: per the CSS
                    overflow spec, setting only overflow-y (auto) makes
                    overflow-x implicitly compute to 'auto' too rather than
                    staying 'visible' — which could clip or make unreachable
                    the queue page's full-bleed breakout (see QueueSection.tsx,
                    which intentionally renders outside this box's edges). */}
                <main className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col overflow-x-visible overflow-y-auto px-4 py-4 pb-28 md:pb-4">
                    {children}
                </main>
            </div>
        </QueryProvider>
    )
}
