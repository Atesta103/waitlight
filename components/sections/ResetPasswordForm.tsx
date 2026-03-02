"use client"

import { useTransition, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { PasswordInput } from "@/components/composed/PasswordInput"
import { AuthErrorBanner } from "@/components/composed/AuthErrorBanner"

type ResetPasswordAction = (
    formData: FormData,
) => Promise<{ data: unknown } | { error: string }>

type ResetPasswordFormProps = {
    /** Server Action — validated with Zod, returns { data } | { error }. */
    action: ResetPasswordAction
}

/**
 * Organism — Reset-password form section.
 * Client-side confirmation check before submitting.
 * The Server Action handles the Supabase `updateUser` call with the new password.
 *
 * TODO: replace hardcoded strings with next-intl keys once i18n is scaffolded.
 */
function ResetPasswordForm({ action }: ResetPasswordFormProps) {
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
            aria-label="Formulaire de nouveau mot de passe"
            className="flex flex-col gap-5"
        >
            {error ? <AuthErrorBanner message={error} /> : null}

            <PasswordInput
                label="Nouveau mot de passe"
                name="password"
                autoComplete="new-password"
                required
                hint="Minimum 8 caractères."
                disabled={isPending}
            />

            <PasswordInput
                label="Confirmer le nouveau mot de passe"
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
                Enregistrer le nouveau mot de passe
            </Button>

            <p className="text-center text-sm text-text-secondary">
                <Link
                    href="/login"
                    className="font-medium text-brand-primary hover:underline focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-border-focus"
                >
                    Retour à la connexion
                </Link>
            </p>
        </form>
    )
}

export { ResetPasswordForm, type ResetPasswordFormProps }
