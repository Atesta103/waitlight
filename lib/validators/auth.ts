import { z } from "zod"

/** Reusable email field */
const emailField = z
    .string()
    .min(1, "L'adresse e-mail est requise.")
    .email("Adresse e-mail invalide.")

/** Reusable password field (min 8 chars) */
const passwordField = z
    .string()
    .min(8, "Le mot de passe doit contenir au minimum 8 caractères.")

// ─── Login ────────────────────────────────────────────────────────────────────

export const LoginSchema = z.object({
    email: emailField,
    password: z.string().min(1, "Le mot de passe est requis."),
})

export type LoginInput = z.infer<typeof LoginSchema>

// ─── Register ─────────────────────────────────────────────────────────────────

export const RegisterSchema = z
    .object({
        email: emailField,
        password: passwordField,
        confirm_password: z.string().min(1, "La confirmation est requise."),
    })
    .refine((data) => data.password === data.confirm_password, {
        message: "Les mots de passe ne correspondent pas.",
        path: ["confirm_password"],
    })

export type RegisterInput = z.infer<typeof RegisterSchema>

// ─── Forgot Password ──────────────────────────────────────────────────────────

export const ForgotPasswordSchema = z.object({
    email: emailField,
})

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>

// ─── Reset Password ───────────────────────────────────────────────────────────

export const ResetPasswordSchema = z
    .object({
        password: passwordField,
        confirm_password: z.string().min(1, "La confirmation est requise."),
    })
    .refine((data) => data.password === data.confirm_password, {
        message: "Les mots de passe ne correspondent pas.",
        path: ["confirm_password"],
    })

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>
