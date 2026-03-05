/**
 * @module actions/auth
 * @category Actions
 *
 * Server Actions for merchant authentication.
 * All actions validate input via Zod before any Supabase call.
 * Errors are returned as user-facing French strings — never thrown.
 */
"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import {
    LoginSchema,
    RegisterSchema,
    ForgotPasswordSchema,
    ResetPasswordSchema,
} from "@/lib/validators/auth"

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Build the absolute URL for Supabase redirectTo (works on Vercel & localhost). */
async function getOrigin(): Promise<string> {
    const headersList = await headers()
    const host = headersList.get("host") ?? "localhost:3000"
    const protocol = host.startsWith("localhost") ? "http" : "https"
    return `${protocol}://${host}`
}

// ─── OAuth ────────────────────────────────────────────────────────────────────

/**
 * Initiate an OAuth sign-in flow with a social provider.
 *
 * Returns the Supabase authorization URL. The **caller is responsible** for
 * redirecting the browser to it. Providers must be enabled in the Supabase
 * Auth dashboard first.
 *
 * @param provider - OAuth provider to use (`"google"` or `"apple"`)
 * @returns Authorization URL to redirect the browser to.
 *
 * **Errors:**
 * | `error` string | Cause |
 * |---|---|
 * | `"Connexion {provider} échouée : {msg}"` | Supabase OAuth initiation failed |
 */
export async function oauthSignInAction(
    provider: "google" | "apple",
): Promise<{ data: { url: string } } | { error: string }> {
    const supabase = await createClient()
    const origin = await getOrigin()

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo: `${origin}/auth/callback`,
        },
    })

    if (error) {
        return { error: `Connexion ${provider} échouée : ${error.message}` }
    }

    return { data: { url: data.url } }
}

// ─── Login ────────────────────────────────────────────────────────────────────

/**
 * Sign in an existing merchant with email and password.
 *
 * On success, performs a server-side redirect to `/dashboard` — no value is returned.
 *
 * @param formData - Validated by {@link LoginSchema}.
 * @returns Redirects to `/dashboard` on success.
 *
 * **Errors:**
 * | `error` string | Cause | Supabase code |
 * |---|---|---|
 * | Zod issue message or `"Données invalides."` | Validation failure | — |
 * | `"E-mail ou mot de passe incorrect."` | Wrong credentials | `invalid_credentials` |
 * | `"Veuillez confirmer votre adresse e-mail avant de vous connecter."` | Unconfirmed email | `email_not_confirmed` |
 * | `"Une erreur est survenue. Veuillez réessayer."` | Unknown Supabase error | any |
 * | `"Impossible de contacter le serveur. Vérifiez votre connexion."` | Network failure | — |
 */
export async function loginAction(
    formData: FormData,
): Promise<{ error: string }> {
    const parsed = LoginSchema.safeParse({
        email: formData.get("email"),
        password: formData.get("password"),
    })

    if (!parsed.success) {
        return {
            error: parsed.error.issues[0]?.message ?? "Données invalides.",
        }
    }

    const supabase = await createClient()

    let error
    try {
        ;({ error } = await supabase.auth.signInWithPassword(parsed.data))
    } catch {
        return {
            error: "Impossible de contacter le serveur. Vérifiez votre connexion.",
        }
    }

    if (error) {
        if (error.code === "invalid_credentials") {
            return { error: "E-mail ou mot de passe incorrect." }
        }
        if (error.code === "email_not_confirmed") {
            return {
                error: "Veuillez confirmer votre adresse e-mail avant de vous connecter.",
            }
        }
        return { error: "Une erreur est survenue. Veuillez réessayer." }
    }

    redirect("/dashboard")
}

// ─── Register ─────────────────────────────────────────────────────────────────

/**
 * Create a new merchant account with email and password.
 *
 * On success returns `{ data: null }` — the UI should display a
 * "check your inbox" confirmation. No redirect is performed.
 *
 * @param formData - Validated by {@link RegisterSchema}.
 *
 * **Errors:**
 * | `error` string | Cause | Supabase code |
 * |---|---|---|
 * | Zod issue message or `"Données invalides."` | Validation failure | — |
 * | `"Un compte existe déjà pour cette adresse e-mail."` | Duplicate email | `user_already_exists` |
 * | `"Inscription échouée. Veuillez réessayer."` | Unknown Supabase error | any |
 * | `"Impossible de contacter le serveur. Vérifiez votre connexion."` | Network failure | — |
 */
export async function registerAction(
    formData: FormData,
): Promise<{ data: null } | { error: string }> {
    const parsed = RegisterSchema.safeParse({
        email: formData.get("email"),
        password: formData.get("password"),
        confirm_password: formData.get("confirm_password"),
    })

    if (!parsed.success) {
        return {
            error: parsed.error.issues[0]?.message ?? "Données invalides.",
        }
    }

    const supabase = await createClient()
    const origin = await getOrigin()

    let error
    try {
        ;({ error } = await supabase.auth.signUp({
            email: parsed.data.email,
            password: parsed.data.password,
            options: {
                emailRedirectTo: `${origin}/auth/callback`,
            },
        }))
    } catch {
        return {
            error: "Impossible de contacter le serveur. Vérifiez votre connexion.",
        }
    }

    if (error) {
        if (error.code === "user_already_exists") {
            return { error: "Un compte existe déjà pour cette adresse e-mail." }
        }
        return { error: "Inscription échouée. Veuillez réessayer." }
    }

    return { data: null }
}

// ─── Forgot Password ──────────────────────────────────────────────────────────

/**
 * Send a password-reset email to the given address.
 *
 * **Always** returns `{ data: null }` — even if the email does not exist —
 * to prevent user-enumeration attacks.
 *
 * The reset link redirects to `/auth/callback?next=/reset-password`.
 *
 * @param formData - Validated by {@link ForgotPasswordSchema}.
 * @returns Always succeeds — even for unknown emails — to prevent enumeration.
 *
 * **Errors:**
 * | `error` string | Cause |
 * |---|---|
 * | Zod issue message or `"Données invalides."` | Validation failure |
 */
export async function forgotPasswordAction(
    formData: FormData,
): Promise<{ data: null } | { error: string }> {
    const parsed = ForgotPasswordSchema.safeParse({
        email: formData.get("email"),
    })

    if (!parsed.success) {
        return {
            error: parsed.error.issues[0]?.message ?? "Données invalides.",
        }
    }

    const supabase = await createClient()
    const origin = await getOrigin()

    await supabase.auth.resetPasswordForEmail(parsed.data.email, {
        redirectTo: `${origin}/auth/callback?next=/reset-password`,
    })

    // Always return success — never reveal whether the email exists.
    return { data: null }
}

// ─── Reset Password ───────────────────────────────────────────────────────────

/**
 * Update the authenticated user's password after the magic-link reset flow.
 *
 * On success, performs a server-side redirect to `/login?reset=success`.
 *
 * @param formData - Validated by {@link ResetPasswordSchema}.
 * @returns Redirects to `/login?reset=success` on success.
 *
 * **Errors:**
 * | `error` string | Cause |
 * |---|---|
 * | Zod issue message or `"Données invalides."` | Validation failure |
 * | `"Réinitialisation échouée. Le lien a peut-être expiré."` | Supabase `updateUser` failed or expired link |
 */
export async function resetPasswordAction(
    formData: FormData,
): Promise<{ error: string }> {
    const parsed = ResetPasswordSchema.safeParse({
        password: formData.get("password"),
        confirm_password: formData.get("confirm_password"),
    })

    if (!parsed.success) {
        return {
            error: parsed.error.issues[0]?.message ?? "Données invalides.",
        }
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.updateUser({
        password: parsed.data.password,
    })

    if (error) {
        return {
            error: "Réinitialisation échouée. Le lien a peut-être expiré.",
        }
    }

    redirect("/login?reset=success")
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────

/**
 * Sign out the current user.
 *
 * Calls `supabase.auth.signOut()` to clear the session cookie, then
 * performs a server-side redirect to `/login`. Never returns an error.
 */
export async function signOutAction(): Promise<void> {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/login")
}
