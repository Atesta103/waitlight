import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { OnboardingClient } from "./OnboardingClient"

export const metadata: Metadata = {
    title: "Configurer mon établissement — Wait-Light",
    description:
        "Créez votre profil marchand et configurez votre file d'attente.",
}

/**
 * Onboarding page (Server Component).
 * - Requires authentication (proxy guards this route).
 * - Redirects to /dashboard if the merchant profile already exists.
 */
export default async function OnboardingPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) redirect("/login")

    // Already onboarded → skip straight to dashboard
    const { data: merchant } = await supabase
        .from("merchants")
        .select("id")
        .eq("id", user.id)
        .maybeSingle()

    if (merchant) redirect("/dashboard")

    return (
        <div className="flex h-screen items-center justify-center overflow-hidden bg-surface-base px-4">
            <div className="w-full max-w-lg">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-text-primary">
                        Bienvenue&nbsp;! Configurez votre établissement
                    </h1>
                    <p className="mt-1 text-sm text-text-secondary">
                        Ces informations peuvent être modifiées plus tard dans
                        les paramètres.
                    </p>
                </div>

                <OnboardingClient />
            </div>
        </div>
    )
}
