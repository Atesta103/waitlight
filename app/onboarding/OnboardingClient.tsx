"use client"

import { useState } from "react"
import {
    OnboardingForm,
    type OnboardingData,
} from "@/components/sections/OnboardingForm"
import { AuthErrorBanner } from "@/components/composed/AuthErrorBanner"
import {
    createMerchantAction,
    checkSlugAvailabilityAction,
} from "@/lib/actions/onboarding"
import { signOutAction } from "@/lib/actions/auth"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/Button"

/**
 * Client wrapper for OnboardingForm.
 * Bridges the Server Actions (createMerchantAction, checkSlugAvailabilityAction)
 * with the OnboardingForm organism's callback-based API.
 */
export function OnboardingClient() {
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    async function handleComplete(data: OnboardingData) {
        setIsSubmitting(true)
        setError(null)

        const result = await createMerchantAction(data)

        // If we reach here, createMerchantAction returned an error
        // (successful calls redirect server-side and never return)
        if (result && "error" in result) {
            setError(result.error)
        }

        setIsSubmitting(false)
    }

    return (
        <div className="flex flex-col gap-4">
            {error ? <AuthErrorBanner message={error} /> : null}
            <OnboardingForm
                onComplete={handleComplete}
                checkSlugAvailability={checkSlugAvailabilityAction}
                isSubmitting={isSubmitting}
            />
            <div className="flex justify-center pt-2">
                <form action={signOutAction}>
                    <Button
                        type="submit"
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-xs text-text-tertiary hover:text-text-secondary"
                    >
                        <LogOut size={13} />
                        Se déconnecter
                    </Button>
                </form>
            </div>
        </div>
    )
}
