import type { Metadata } from "next"
import { LoginForm } from "@/components/sections/LoginForm"
import { loginAction } from "@/lib/actions/auth"

export const metadata: Metadata = {
    title: "Connexion — Wait-Light",
    description: "Connectez-vous à votre espace marchand Wait-Light.",
}

/**
 * Login page (Server Component).
 * Delegates UI to the LoginForm organism; injects the server action.
 */
export default function LoginPage() {
    return (
        <>
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-text-primary">
                    Connexion
                </h1>
                <p className="mt-1 text-sm text-text-secondary">
                    Bienvenue&nbsp;! Connectez-vous à votre espace marchand.
                </p>
            </div>

            <LoginForm action={loginAction} />
        </>
    )
}
