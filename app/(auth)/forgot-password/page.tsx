import type { Metadata } from "next"
import { ForgotPasswordForm } from "@/components/sections/ForgotPasswordForm"
import { forgotPasswordAction } from "@/lib/actions/auth"

export const metadata: Metadata = {
    title: "Mot de passe oublié — Wait-Light",
    description:
        "Réinitialisez votre mot de passe Wait-Light en recevant un lien par e-mail.",
}

/**
 * Forgot-password page (Server Component).
 * Delegates UI to the ForgotPasswordForm organism; injects the server action.
 */
export default function ForgotPasswordPage() {
    return (
        <>
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-text-primary">
                    Mot de passe oublié
                </h1>
                <p className="mt-1 text-sm text-text-secondary">
                    Saisissez votre adresse e-mail pour recevoir un lien de
                    réinitialisation.
                </p>
            </div>

            <ForgotPasswordForm action={forgotPasswordAction} />
        </>
    )
}
