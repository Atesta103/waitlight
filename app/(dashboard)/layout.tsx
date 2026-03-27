import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { isActiveStatus } from "@/lib/subscription-status"
import { DashboardProviders } from "./providers"
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
        .select("id, name, slug, is_open, bypass_paywall, brand_color, font_family, border_radius")
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

    const defaultColor = "#4F46E5"
    let brandColor = defaultColor
    let contrastColor = "#FFFFFF"

    if (merchant.brand_color && isValidHexCode(merchant.brand_color)) {
        brandColor = merchant.brand_color
        contrastColor = getContrastYIQ(merchant.brand_color) === "white" ? "#FFFFFF" : "#000000"
    }
    
    const fontFamily = merchant.font_family || "Inter"
    const borderRadius = merchant.border_radius || "0.5rem"

    return (
        <DashboardProviders>
            <div 
                id="dashboard-root"
                className="min-h-screen bg-surface-base"
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
                                <li>
                                    <Link
                                        href="/analytics"
                                        className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-base hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus transition-colors"
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
                </header>
                <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
            </div>
        </DashboardProviders>
    )
}
