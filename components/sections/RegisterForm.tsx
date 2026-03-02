"use client"

import { useTransition, useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Divider } from "@/components/ui/Divider"
import { PasswordInput } from "@/components/composed/PasswordInput"
import { AuthErrorBanner } from "@/components/composed/AuthErrorBanner"
import { SocialAuthButtons } from "@/components/composed/SocialAuthButtons"

type RegisterAction = (
    formData: FormData,
) => Promise<{ data: unknown } | { error: string }>

type SocialAction = (
    provider: "google" | "apple",
) => Promise<{ data: unknown } | { error: string }>

type RegisterFormProps = {
    /** Server Action — validated with Zod, returns { data } | { error }. */
    action: RegisterAction
    /**
     * Optional OAuth server action. When provided the Google + Apple buttons
     * are rendered below the email/password form.
     */
    socialAction?: SocialAction
}

/**
 * Organism — Merchant registration form.
 * Client-side password confirmation check before submitting to the Server Action.
 *
 * TODO: replace hardcoded strings with next-intl keys once i18n is scaffolded.
 */
function RegisterForm({ action, socialAction }: RegisterFormProps) {
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        const password = formData.get("password") as string
        const confirmPassword = formData.get("confirm_password") as string

        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.")
            return
        }

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
            aria-label="Formulaire d'inscription"
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
                autoComplete="new-password"
                required
                hint="Minimum 8 caractères."
                disabled={isPending}
            />

            <PasswordInput
                label="Confirmer le mot de passe"
                name="confirm_password"
                autoComplete="new-password"
                required
                disabled={isPending}
            />

            <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isPending}
                className="w-full"
            >
                Créer mon compte
            </Button>

            <p className="text-center text-sm text-text-secondary">
                Déjà un compte&nbsp;?{" "}
                <Link
                    href="/login"
                    className="font-medium text-brand-primary hover:underline focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-border-focus"
                >
                    Se connecter
                </Link>
            </p>

            {socialAction ? (
                <>
                    <Divider label="ou" />
                    <SocialAuthButtons
                        label="S'inscrire"
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

export { RegisterForm, type RegisterFormProps }
