"use client"

import { useTransition, useState } from "react"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { AuthErrorBanner } from "@/components/composed/AuthErrorBanner"

type ForgotPasswordAction = (
    formData: FormData,
) => Promise<{ data: unknown } | { error: string }>

type ForgotPasswordFormProps = {
    /** Server Action — validated with Zod, returns { data } | { error }. */
    action: ForgotPasswordAction
}

/**
 * Organism — Forgot-password form section.
 * On success, replaces the form with a confirmation message so the user
 * knows to check their inbox — no toast needed here.
 *
 * TODO: replace hardcoded strings with next-intl keys once i18n is scaffolded.
 */
function ForgotPasswordForm({ action }: ForgotPasswordFormProps) {
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [isPending, startTransition] = useTransition()

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        setError(null)

        startTransition(async () => {
            const result = await action(formData)
            if ("error" in result) {
                setError(result.error)
            } else {
                setSuccess(true)
            }
        })
    }

    if (success) {
        return (
            <div
                role="status"
                aria-live="polite"
                className="flex flex-col items-center gap-4 py-6 text-center"
            >
                <CheckCircle2
                    size={48}
                    className="text-feedback-success"
                    aria-hidden="true"
                />
                <p className="text-base font-medium text-text-primary">
                    E-mail envoyé&nbsp;!
                </p>
                <p className="max-w-xs text-sm text-text-secondary">
                    Si un compte existe pour cette adresse, vous recevrez un
                    lien de réinitialisation dans les prochaines minutes.
                </p>
                <Link
                    href="/login"
                    className="mt-2 text-sm font-medium text-brand-primary hover:underline focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-border-focus"
                >
                    Retour à la connexion
                </Link>
            </div>
        )
    }

    return (
        <form
            onSubmit={handleSubmit}
            noValidate
            aria-label="Formulaire de réinitialisation de mot de passe"
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
                hint="Nous vous enverrons un lien pour réinitialiser votre mot de passe."
                disabled={isPending}
            />

            <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isPending}
                className="w-full"
            >
                Envoyer le lien
            </Button>

            <p className="text-center text-sm text-text-secondary">
                Vous vous souvenez&nbsp;?{" "}
                <Link
                    href="/login"
                    className="font-medium text-brand-primary hover:underline focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-border-focus"
                >
                    Se connecter
                </Link>
            </p>
        </form>
    )
}

export { ForgotPasswordForm, type ForgotPasswordFormProps }
