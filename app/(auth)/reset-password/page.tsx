import type { Metadata } from "next"
import { ResetPasswordForm } from "@/components/sections/ResetPasswordForm"
import { resetPasswordAction } from "@/lib/actions/auth"

export const metadata: Metadata = {
    title: "Nouveau mot de passe — Wait-Light",
    description:
        "Choisissez un nouveau mot de passe pour votre compte Wait-Light.",
}

/**
 * Reset-password page (Server Component).
 * Reached via the e-mail link sent by the forgot-password flow.
 * Delegates UI to the ResetPasswordForm organism; injects the server action.
 *
 * TODO: validate the Supabase `code` query param via middleware before rendering
 * this page. Invalid or expired codes should redirect to /forgot-password
 * with an `?error=expired` param.
 */
export default function ResetPasswordPage() {
    return (
        <>
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-text-primary">
                    Nouveau mot de passe
                </h1>
                <p className="mt-1 text-sm text-text-secondary">
                    Choisissez un mot de passe sécurisé pour votre compte.
                </p>
            </div>

            <ResetPasswordForm action={resetPasswordAction} />
        </>
    )
}
