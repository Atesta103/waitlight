import type { Metadata } from "next"
import { LoginForm } from "@/components/sections/LoginForm"
import { loginAction, oauthSignInAction } from "@/lib/actions/auth"

export const metadata: Metadata = {
    title: "Connexion — Wait-Light",
    description: "Connectez-vous à votre espace marchand Wait-Light.",
}

type LoginPageProps = {
    searchParams: Promise<{ reset?: string; error?: string }>
}

/**
 * Login page (Server Component).
 * Reads searchParams to display post-redirect success/error banners.
 */
export default async function LoginPage({ searchParams }: LoginPageProps) {
    const params = await searchParams
    const successMessage =
        params.reset === "success"
            ? "Mot de passe mis à jour. Vous pouvez vous connecter."
            : undefined
    const initialError =
        params.error === "auth_callback_error"
            ? "Le lien a expiré ou est invalide. Veuillez réessayer."
            : undefined

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

            <LoginForm
                action={loginAction}
                socialAction={oauthSignInAction}
                successMessage={successMessage}
                initialError={initialError}
            />
        </>
    )
}
