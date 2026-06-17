import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { OnboardingClient } from "./OnboardingClient"

export const metadata: Metadata = {
    title: "Configurer mon établissement — WaitLight",
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
    const { data: merchant, error } = await supabase
        .from("merchants")
        .select("id")
        .eq("id", user.id)
        .maybeSingle()

    if (error) {
        console.error("Onboarding merchant fetch error:", error)
        throw new Error("Failed to check merchant status: " + error.message)
    }

    if (merchant) redirect("/dashboard")

    return (
        <div className="flex min-h-screen items-start justify-center bg-surface-base px-4 pt-12 pb-8">
            <div className="w-full max-w-4xl">
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
