import { z } from "zod"

export const OnboardingSchema = z.object({
    name: z
        .string()
        .min(1, "Le nom de l'établissement est requis.")
        .max(100, "100 caractères maximum."),
    slug: z
        .string()
        .min(3, "Le slug doit contenir au minimum 3 caractères.")
        .max(50, "50 caractères maximum.")
        .regex(
            /^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/,
            "Slug invalide — utilisez uniquement des lettres minuscules, chiffres et tirets.",
        ),
    max_capacity: z
        .number()
        .int()
        .min(1, "Minimum 1 personne.")
        .max(500, "Maximum 500 personnes."),
    welcome_message: z.string().max(500, "500 caractères maximum.").optional(),
})

export type OnboardingInput = z.infer<typeof OnboardingSchema>
