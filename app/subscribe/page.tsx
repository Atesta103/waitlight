import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { isActiveStatus } from "@/lib/subscription-status"
import { SubscribeClient } from "./SubscribeClient"

export const metadata: Metadata = {
    title: "Abonnement — Wait-Light",
    description: "Activez votre accès Wait-Light avec un essai gratuit de 14 jours.",
}

type SearchParams = Promise<{ error?: string }>

/**
 * Subscribe page — Server Component.
 * Redirects to /dashboard if the merchant already has an active subscription.
 * Passes error state and current subscription to the client component.
 */
export default async function SubscribePage(props: {
    searchParams: SearchParams
}) {
    const searchParams = await props.searchParams
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) redirect("/login")

    // Already active → send straight to dashboard
    const { data: subscriptionRaw } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("merchant_id", user.id)
        .maybeSingle()

    const subscription = subscriptionRaw as import("@/lib/actions/billing").SubscriptionRow | null

    if (subscription && isActiveStatus(subscription.status)) {
        redirect("/dashboard")
    }

    const errorParam = searchParams.error
    const error =
        errorParam === "payment_failed"
            ? "payment_failed"
            : errorParam === "cancelled"
              ? "cancelled"
              : null

    return (
        <SubscribeClient
            error={error}
            subscription={subscription as never}
        />
    )
}
