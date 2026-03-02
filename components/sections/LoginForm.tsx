"use client"

import { useTransition, useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Divider } from "@/components/ui/Divider"
import { PasswordInput } from "@/components/composed/PasswordInput"
import { AuthErrorBanner } from "@/components/composed/AuthErrorBanner"
import { SocialAuthButtons } from "@/components/composed/SocialAuthButtons"

type LoginAction = (
    formData: FormData,
) => Promise<{ data: unknown } | { error: string }>

type SocialAction = (
    provider: "google" | "apple",
) => Promise<{ data: unknown } | { error: string }>

type LoginFormProps = {
    /** Server Action — validated with Zod, returns { data } | { error }. */
    action: LoginAction
    /**
     * Optional OAuth server action. When provided the Google + Apple buttons
     * are rendered below the email/password form.
     */
    socialAction?: SocialAction
}

/**
 * Organism — Login form section.
 * Manages pending/error state; delegates auth logic to the injected Server Action.
 *
 * TODO: replace hardcoded strings with next-intl keys once i18n is scaffolded.
 */
function LoginForm({ action, socialAction }: LoginFormProps) {
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        setError(null)

        startTransition(async () => {
            const result = await action(formData)
            if ("error" in result) setError(result.error)
        })
    }

    return (
        <form
            onSubmit={handleSubmit}
            noValidate
            aria-label="Formulaire de connexion"
            className="flex flex-col gap-5"
        >
            {error ? <AuthErrorBanner message={error} /> : null}

            <Input
                label="Adresse e-mail"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="vous@exemple.com"
                disabled={isPending}
            />

            <PasswordInput
                label="Mot de passe"
                name="password"
                autoComplete="current-password"
                required
                disabled={isPending}
            />

            <div className="flex items-center justify-end">
                <Link
                    href="/forgot-password"
                    className="text-sm text-brand-primary hover:underline focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-border-focus"
                >
                    Mot de passe oublié&nbsp;?
                </Link>
            </div>

            <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isPending}
                className="w-full"
            >
                Se connecter
            </Button>

            <p className="text-center text-sm text-text-secondary">
                Pas encore de compte&nbsp;?{" "}
                <Link
                    href="/register"
                    className="font-medium text-brand-primary hover:underline focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-border-focus"
                >
                    Créer un compte
                </Link>
            </p>

            {socialAction ? (
                <>
                    <Divider label="ou" />
                    <SocialAuthButtons
                        label="Se connecter"
                        onProvider={async (provider) => {
                            await socialAction(provider)
                        }}
                        disabled={isPending}
                    />
                </>
            ) : null}
        </form>
    )
}

export { LoginForm, type LoginFormProps }
