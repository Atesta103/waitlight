import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Settings } from "lucide-react"
import { getMerchantSettingsAction } from "@/lib/actions/settings"
import { SettingsPanel } from "@/components/sections/SettingsPanel"

export const metadata: Metadata = {
    title: "Paramètres — Wait-Light",
}

export default async function SettingsPage() {
    const result = await getMerchantSettingsAction()

    if ("error" in result) {
        redirect("/dashboard")
    }

    const { merchant, settings } = result.data

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center gap-4 border-b border-border-default pb-6">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border-default bg-surface-card shadow-sm">
                    <Settings
                        size={20}
                        className="text-text-secondary"
                        aria-hidden="true"
                    />
                </span>
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">
                        Paramètres
                    </h1>
                    <p className="mt-0.5 text-sm text-text-secondary">
                        Identité, file d&apos;attente et automations de{" "}
                        <span className="font-medium text-text-primary">
                            {merchant.name}
                        </span>
                    </p>
                </div>
            </div>

            <SettingsPanel
                initialData={{
                    merchantName: merchant.name,
                    slug: merchant.slug,
                    logoUrl: merchant.logo_url,
                    brandColor: merchant.brand_color,
                    fontFamily: merchant.font_family,
                    borderRadius: merchant.border_radius,
                    themePattern: merchant.theme_pattern,
                    defaultPrepTimeMin: merchant.default_prep_time_min,
                    maxCapacity: settings.max_capacity,
                    welcomeMessage: settings.welcome_message ?? "",
                    notificationsEnabled: settings.notifications_enabled,
                    autoCloseEnabled: settings.auto_close_enabled,
                    calculatedAvgPrepTime: merchant.calculated_avg_prep_time,
                    avgPrepComputedAt: merchant.avg_prep_computed_at,
                }}
            />
        </div>
    )
}
