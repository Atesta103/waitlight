"use client"

import { useTransition, useState, useRef, useCallback } from "react"
import Link from "next/link"
import { CheckCircle2, Wand2 } from "lucide-react"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Divider } from "@/components/ui/Divider"
import { PasswordInput } from "@/components/composed/PasswordInput"
import {
    PasswordStrengthMeter,
    generateSecurePassword,
} from "@/components/composed/PasswordStrengthMeter"
import { AuthErrorBanner } from "@/components/composed/AuthErrorBanner"
import { SocialAuthButtons } from "@/components/composed/SocialAuthButtons"

type RegisterAction = (
    formData: FormData,
) => Promise<{ data: null } | { error: string }>

type SocialAction = (
    provider: "google" | "apple",
) => Promise<{ data: { url: string } } | { error: string }>

type RegisterFormProps = {
    /** Server Action — validated with Zod, returns { data } | { error }. */
    action: RegisterAction
    /**
     * Optional OAuth server action. When provided the Google + Apple buttons
     * are rendered below the email/password form.
     */
    socialAction?: SocialAction
    /** Restrict which OAuth providers are shown. Defaults to all. */
    enabledProviders?: ("google" | "apple")[]
}

/**
 * Organism — Merchant registration form.
 * Client-side password confirmation check before submitting to the Server Action.
 *
 * TODO: replace hardcoded strings with next-intl keys once i18n is scaffolded.
 */
// ─── Validation helpers ─────────────────────────────────────────────────────

function validateEmail(val: string): string | null {
    if (!val.trim()) return "L'adresse e-mail est requise."
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val))
        return "Adresse e-mail invalide."
    return null
}

function validatePassword(val: string): string | null {
    if (!val) return "Le mot de passe est requis."
    return null
}

function validateConfirm(val: string, pw: string): string | null {
    if (!val) return "Veuillez confirmer votre mot de passe."
    if (val !== pw) return "Les mots de passe ne correspondent pas."
    return null
}

// ─── Component ───────────────────────────────────────────────────────────────

function RegisterForm({
    action,
    socialAction,
    enabledProviders,
}: RegisterFormProps) {
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [email, setEmail] = useState("")
    const [emailError, setEmailError] = useState<string | null>(null)
    const [password, setPassword] = useState("")
    const [passwordError, setPasswordError] = useState<string | null>(null)
    const [confirmPassword, setConfirmPassword] = useState("")
    const [confirmError, setConfirmError] = useState<string | null>(null)
    const passwordRef = useRef<HTMLInputElement>(null)
    const confirmRef = useRef<HTMLInputElement>(null)

    const handleGenerate = useCallback(() => {
        const pw = generateSecurePassword()
        setPassword(pw)
        setConfirmPassword(pw)
        setPasswordError(null)
        setConfirmError(null)
        if (passwordRef.current) passwordRef.current.value = pw
        if (confirmRef.current) confirmRef.current.value = pw
    }, [])

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        const eErr = validateEmail(email)
        const pErr = validatePassword(password)
        const cErr = validateConfirm(confirmPassword, password)

        setEmailError(eErr)
        setPasswordError(pErr)
        setConfirmError(cErr)

        if (eErr || pErr || cErr) return

        setError(null)

        const formData = new FormData(e.currentTarget)

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
                    Compte créé&nbsp;!
                </p>
                <p className="max-w-xs text-sm text-text-secondary">
                    Un e-mail de confirmation vous a été envoyé. Cliquez sur le
                    lien pour activer votre compte, puis connectez-vous.
                </p>
                <Link
                    href="/login"
                    className="mt-2 text-sm font-medium text-brand-primary hover:underline focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-border-focus"
                >
                    Aller à la connexion
                </Link>
            </div>
        )
    }

    return (
        <form
            onSubmit={handleSubmit}
            noValidate
            aria-label="Formulaire d'inscription"
            className="flex flex-col gap-4"
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
                value={email}
                error={emailError ?? undefined}
                onChange={(e) => {
                    setEmail(e.target.value)
                    if (emailError) setEmailError(validateEmail(e.target.value))
                }}
                onBlur={(e) => setEmailError(validateEmail(e.target.value))}
            />

            {/* Password block — strength meter appears inline when password is typed */}
            <div className="flex flex-col gap-3">
                <PasswordInput
                    ref={passwordRef}
                    label="Mot de passe"
                    labelAction={
                        <button
                            type="button"
                            onClick={handleGenerate}
                            disabled={isPending}
                            className="flex cursor-pointer items-center gap-1 text-xs text-text-secondary transition-colors hover:text-brand-primary focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-border-focus disabled:pointer-events-none disabled:opacity-50"
                        >
                            <Wand2 size={11} aria-hidden="true" />
                            Générer
                        </button>
                    }
                    name="password"
                    autoComplete="new-password"
                    required
                    placeholder="Créez un mot de passe sécurisé"
                    disabled={isPending}
                    value={password}
                    error={passwordError ?? undefined}
                    onChange={(e) => {
                        setPassword(e.target.value)
                        if (passwordError)
                            setPasswordError(validatePassword(e.target.value))
                        if (confirmError)
                            setConfirmError(
                                validateConfirm(
                                    confirmPassword,
                                    e.target.value,
                                ),
                            )
                    }}
                    onBlur={(e) =>
                        setPasswordError(validatePassword(e.target.value))
                    }
                />

                {password ? (
                    <PasswordStrengthMeter password={password} />
                ) : null}

                <PasswordInput
                    ref={confirmRef}
                    label="Confirmer le mot de passe"
                    name="confirm_password"
                    autoComplete="new-password"
                    required
                    placeholder="Retapez le mot de passe"
                    disabled={isPending}
                    value={confirmPassword}
                    error={confirmError ?? undefined}
                    onChange={(e) => {
                        setConfirmPassword(e.target.value)
                        if (confirmError)
                            setConfirmError(
                                validateConfirm(e.target.value, password),
                            )
                    }}
                    onBlur={(e) =>
                        setConfirmError(
                            validateConfirm(e.target.value, password),
                        )
                    }
                />
            </div>

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
                        enabledProviders={enabledProviders}
                        onProvider={async (provider) => {
                            const result = await socialAction(provider)
                            if ("error" in result) {
                                setError(result.error)
                            } else {
                                window.location.href = result.data.url
                            }
                        }}
                        disabled={isPending}
                    />
                </>
            ) : null}
        </form>
    )
}

export { RegisterForm, type RegisterFormProps }
