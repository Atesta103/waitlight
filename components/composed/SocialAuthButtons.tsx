"use client"

import { useState } from "react"
import { Spinner } from "@/components/ui/Spinner"
import { cn } from "@/lib/utils/cn"

type Provider = "google" | "apple"

type SocialAuthButtonsProps = {
    /**
     * Called when the user clicks a provider button.
     * Return a promise — the button stays in loading state until it resolves.
     */
    onProvider: (provider: Provider) => Promise<void>
    disabled?: boolean
    /** Override label for screen readers / button text. Defaults to "Continuer". */
    label?: "Continuer" | "S'inscrire" | "Se connecter"
    className?: string
}

/* ─── Provider meta ─── */
const PROVIDERS: {
    id: Provider
    name: string
    icon: React.ReactNode
}[] = [
    {
        id: "google",
        name: "Google",
        icon: (
            /* Google "G" — official brand colours */
            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-5 w-5 shrink-0"
                fill="none"
            >
                <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                />
                <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                />
                <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                />
                <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                />
            </svg>
        ),
    },
    {
        id: "apple",
        name: "Apple",
        icon: (
            /* Apple logo — monochrome */
            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-5 w-5 shrink-0"
                fill="currentColor"
            >
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.44c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.56-1.31 3.1-2.54 3.95zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
        ),
    },
]

/**
 * Molecule — Social OAuth provider buttons (Google + Apple).
 *
 * Renders two full-width ghost buttons, one per provider.
 * Tracks per-provider loading state internally.
 * The `onProvider` callback drives the actual OAuth redirect —
 * wire it to the Supabase `signInWithOAuth` server action.
 *
 * TODO: replace hardcoded strings with next-intl keys once i18n is scaffolded.
 */
function SocialAuthButtons({
    onProvider,
    disabled = false,
    label = "Continuer",
    className,
}: SocialAuthButtonsProps) {
    const [loading, setLoading] = useState<Provider | null>(null)

    async function handleClick(provider: Provider) {
        if (loading || disabled) return
        setLoading(provider)
        try {
            await onProvider(provider)
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className={cn("flex flex-col gap-3", className)}>
            {PROVIDERS.map(({ id, name, icon }) => (
                <button
                    key={id}
                    type="button"
                    onClick={() => handleClick(id)}
                    disabled={!!loading || disabled}
                    aria-label={`${label} avec ${name}`}
                    className={cn(
                        "flex h-11 min-w-11 cursor-pointer items-center justify-center gap-3 rounded-md border px-4",
                        "text-sm font-medium text-text-primary transition-colors",
                        "bg-surface-card border-border-default hover:bg-surface-base",
                        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-border-focus",
                        "disabled:pointer-events-none disabled:opacity-50",
                    )}
                >
                    {loading === id ? <Spinner size="sm" /> : icon}
                    <span>
                        {label} avec {name}
                    </span>
                </button>
            ))}
        </div>
    )
}

export { SocialAuthButtons, type SocialAuthButtonsProps, type Provider }
