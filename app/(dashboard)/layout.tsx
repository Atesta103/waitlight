import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { isActiveStatus } from "@/lib/subscription-status"
import { QueryProvider } from "@/components/providers/QueryProvider"
import { getContrastYIQ, isValidHexCode } from "@/lib/utils/color"
import { UserMenu } from "@/components/composed/UserMenu"
import { HeaderQueueControl } from "@/components/composed/HeaderQueueControl"
import { DashboardShell } from "@/components/composed/DashboardShell"
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

    const shellStyle = {
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
    } as React.CSSProperties

    const header = (
        <>
            {/* No overflow-x-hidden here (deliberately removed): the CSS
                    overflow spec forces overflow-y to compute as 'auto'
                    whenever overflow-x isn't 'visible' — there is no way to
                    pair overflow-x:hidden with a real overflow-y:visible, the
                    browser always turns it into 'hidden auto'. That silently
                    made this bar a clipping container, hiding the account
                    dropdown (UserMenu) which intentionally renders outside
                    the header's own box (top-full/bottom-full). The
                    horizontal safety net this used to provide is redundant
                    now anyway — HeaderQueueControl's icons/labels already
                    have shrink-0/truncate, so nothing here should overflow
                    horizontally in the first place. */}
                {/* w-screen on top of inset-x-0: verified in the browser
                    (not just DevTools device emulation — a real narrowed
                    window) that this fixed, inset-x-0 element was computing
                    to a width matching its CONTENT's preferred size (~559px)
                    rather than the actual viewport, with no transform/filter/
                    contain anywhere in its ancestor chain to explain it —
                    despite inset-x-0 being textbook correct for binding a
                    fixed element's width to the viewport. Forcing width
                    explicitly via 100vw sidesteps whatever in that
                    auto-width resolution was misbehaving, rather than
                    depending on it. */}
                <header className="fixed inset-x-0 bottom-0 z-40 w-screen shrink-0 border-t border-border-default bg-surface-card/95 backdrop-blur-sm md:sticky md:top-0 md:bottom-auto md:border-t-0 md:border-b">
                    {/* mx-auto max-w-6xl, matching every dashboard page's own
                        content width (Settings, Analytics, and the queue
                        header row above its own full-bleed grid) — a
                        full-bleed header previously looked visibly wider than
                        Settings'/Analytics' own (still-capped) content below
                        it, since only the queue page's content actually
                        stretches past this width (see QueueSection.tsx). */}
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
        </>
    )

    // flex-1 + min-h-0 on <main> (DashboardShell) let it shrink below its
    // content's natural height inside the fixed-height shell — without
    // min-h-0 a flex item never shrinks past its content. <main> itself
    // doesn't scroll on most pages: each owns its own scroll container
    // instead — QueueList/QueueSection on the queue page, an h-full min-h-0
    // overflow-y-auto wrapper on Settings — so scroll lives where the
    // content is, not on the whole page. Analytics is the one exception
    // (DashboardShell drops the fixed-height/overflow-hidden constraints
    // there so the real page scrolls instead, per its own requirements).
    // pb-28 on mobile clears the fixed bottom header bar, which sits outside
    // the flex flow (position: fixed takes it out of flow entirely, even
    // inside a flex container).
    // max-w-6xl is the right default for most dashboard pages (Settings'
    // form, Analytics' charts read better capped), but the queue page opts
    // out of it — see the full-bleed wrapper in QueueSection.tsx.
    // overflow-x-visible (non-Analytics only) keeps the queue page's
    // full-bleed breakout (QueueSection.tsx, which intentionally renders
    // outside this box's edges) from being clipped.
    return (
        <QueryProvider>
            <DashboardShell header={header} style={shellStyle}>
                {children}
            </DashboardShell>
        </QueryProvider>
    )
}
