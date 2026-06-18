import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { ResetPasswordForm } from "@/components/sections/ResetPasswordForm"
import { resetPasswordAction } from "@/lib/actions/auth"

export const metadata: Metadata = {
    title: "Nouveau mot de passe — WaitLight",
    description:
        "Choisissez un nouveau mot de passe pour votre compte WaitLight.",
}

type ResetPasswordPageProps = {
    searchParams: Promise<Record<string, string | string[] | undefined>>
}

/**
 * Reset-password page (Server Component).
 * Reached via the e-mail link sent by the forgot-password flow.
 * Delegates UI to the ResetPasswordForm organism; injects the server action.
 *
 * Guards against invalid or missing Supabase `code` query params by
 * redirecting to /login when no code is present.
 */
export default async function ResetPasswordPage({
    searchParams,
}: ResetPasswordPageProps) {
    const params = await searchParams
    const code = params?.code

    if (!code) {
        redirect("/login")
    }

    return (
        <>
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-text-primary">
                    Nouveau mot de passe
                </h1>
                <p className="mt-1 text-sm text-text-secondary">
                    Choisissez un mot de passe sécurisé pour votre compte.
                </p>
            </div>

            <ResetPasswordForm action={resetPasswordAction} />
        </>
    )
}
