"use server"

// TODO: install @supabase/ssr and zod, then wire up real logic.
// See doc/architecture.md — Server Actions pattern.
// All actions return { data } | { error: string }, never throw.

/**
 * Initiate an OAuth sign-in flow with a social provider.
 * Supabase returns a redirect URL — the caller must redirect the browser to it.
 */
export async function oauthSignInAction(
    provider: "google" | "apple",
): Promise<{ data: unknown } | { error: string }> {
    // TODO: createServerClient() → supabase.auth.signInWithOAuth({ provider, options: { redirectTo } })
    // NOTE: providers must be enabled in the Supabase Auth dashboard first.
    void provider
    return { error: `Connexion ${provider} non encore configurée.` }
}

/**
 * Sign in an existing merchant with email + password.
 */
export async function loginAction(
    formData: FormData,
): Promise<{ data: unknown } | { error: string }> {
    const email = formData.get("email")
    const password = formData.get("password")

    if (!email || !password) {
        return { error: "Veuillez remplir tous les champs." }
    }

    // TODO: Zod validation (lib/validators/auth.ts → LoginSchema)
    // TODO: createServerClient() → supabase.auth.signInWithPassword({ email, password })
    return { error: "Authentification non encore configurée." }
}

/**
 * Create a new merchant account with email + password.
 */
export async function registerAction(
    formData: FormData,
): Promise<{ data: unknown } | { error: string }> {
    const email = formData.get("email")
    const password = formData.get("password")

    if (!email || !password) {
        return { error: "Veuillez remplir tous les champs." }
    }

    // TODO: Zod validation (lib/validators/auth.ts → RegisterSchema)
    // TODO: createServerClient() → supabase.auth.signUp({ email, password })
    return { error: "Inscription non encore configurée." }
}

/**
 * Send a password-reset e-mail to the given address.
 * Always returns success-like data to avoid user-enumeration attacks.
 */
export async function forgotPasswordAction(
    formData: FormData,
): Promise<{ data: unknown } | { error: string }> {
    const email = formData.get("email")

    if (!email) {
        return { error: "Veuillez saisir votre adresse e-mail." }
    }

    // TODO: Zod validation (lib/validators/auth.ts → ForgotPasswordSchema)
    // TODO: createServerClient() → supabase.auth.resetPasswordForEmail(email, { redirectTo })
    // NOTE: always return { data } even if email not found — prevents enumeration.
    return { data: null }
}

/**
 * Update the authenticated user's password (called after the reset-link flow).
 */
export async function resetPasswordAction(
    formData: FormData,
): Promise<{ data: unknown } | { error: string }> {
    const password = formData.get("password")

    if (!password) {
        return { error: "Veuillez saisir un nouveau mot de passe." }
    }

    // TODO: Zod validation (lib/validators/auth.ts → ResetPasswordSchema)
    // TODO: createServerClient() → supabase.auth.updateUser({ password })
    return { error: "Réinitialisation non encore configurée." }
}
