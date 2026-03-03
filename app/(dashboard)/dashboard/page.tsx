import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { signOutAction } from "@/lib/actions/auth"
import { Button } from "@/components/ui/Button"

export const metadata: Metadata = {
    title: "Dashboard — Wait-Light",
}

/**
 * Dashboard home page.
 * Shows the authenticated user's email as a placeholder until the full
 * queue management UI is wired up.
 */
export default async function DashboardPage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">
                        Tableau de bord
                    </h1>
                    <p className="mt-1 text-sm text-text-secondary">
                        Connecté en tant que{" "}
                        <span className="font-medium text-text-primary">
                            {user?.email}
                        </span>
                    </p>
                </div>

                <form action={signOutAction}>
                    <Button type="submit" variant="ghost" size="sm">
                        Se déconnecter
                    </Button>
                </form>
            </div>

            {/* TODO: wire QueueList, StatsPanel, DashboardHeader */}
            <div className="rounded-lg border border-border-default bg-surface-card p-8 text-center text-text-secondary">
                La gestion de file arrive bientôt.
            </div>
        </div>
    )
}
