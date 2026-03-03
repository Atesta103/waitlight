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
 * Returns the Supabase authorization URL — the caller must redirect the browser to it.
 * NOTE: providers must be enabled in the Supabase Auth dashboard first.
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
 * Sign in an existing merchant with email + password.
 * On success, redirects server-side to /dashboard.
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
 * Create a new merchant account with email + password.
 * On success returns { data: null } — the form shows a "check your inbox" message.
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
 * Send a password-reset e-mail to the given address.
 * Always returns { data: null } to avoid user-enumeration attacks.
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
 * Update the authenticated user's password (called after the reset-link flow).
 * On success, redirects server-side to /login.
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
 * Sign out the current user and redirect to /login.
 */
export async function signOutAction(): Promise<void> {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/login")
}
