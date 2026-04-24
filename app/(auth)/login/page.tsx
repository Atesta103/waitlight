import type { Metadata } from "next"
import { LoginForm } from "@/components/sections/LoginForm"
import { loginAction, oauthSignInAction } from "@/lib/actions/auth"

export const metadata: Metadata = {
    title: "Connexion — Wait-Light",
    description: "Connectez-vous à votre espace marchand Wait-Light.",
}

/** Maps `?error=` query param values to human-readable messages. */
const ERROR_MESSAGES: Record<string, string> = {
    auth_callback_error:
        "Le lien a expiré ou est invalide. Veuillez réessayer.",
    oauth_cancelled: "Connexion annulée. Vous pouvez réessayer à tout moment.",
    oauth_error:
        "La connexion via ce service a échoué. Veuillez réessayer ou utiliser votre e-mail.",
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
    const initialError = params.error
        ? (ERROR_MESSAGES[params.error] ??
          "Une erreur est survenue. Veuillez réessayer.")
        : undefined

    return (
        <LoginForm
            action={loginAction}
            socialAction={oauthSignInAction}
            enabledProviders={["google"]}
            successMessage={successMessage}
            initialError={initialError}
        />
    )
}

