import type { Metadata } from "next"
import { RegisterForm } from "@/components/sections/RegisterForm"
import { registerAction, oauthSignInAction } from "@/lib/actions/auth"

export const metadata: Metadata = {
    title: "Créer un compte — Wait-Light",
    description:
        "Créez votre compte marchand Wait-Light et commencez à gérer votre file d'attente.",
}

/**
 * Registration page (Server Component).
 * Delegates UI to the RegisterForm organism; injects the server action.
 */
export default function RegisterPage() {
    return (
        <>
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-text-primary">
                    Créer un compte
                </h1>
                <p className="mt-1 text-sm text-text-secondary">
                    Inscrivez-vous gratuitement et gérez votre file en quelques
                    secondes.
                </p>
            </div>

            <RegisterForm
                action={registerAction}
                socialAction={oauthSignInAction}
                enabledProviders={["google"]}
            />
        </>
    )
}
