/**
 * @module validators/contact
 * @category Validators
 *
 * Zod schema for the public contact / support form.
 */
import { z } from "zod"

export const CONTACT_SUBJECTS = [
    { value: "general", label: "Question générale" },
    { value: "technical", label: "Problème technique" },
    { value: "billing", label: "Facturation & abonnement" },
    { value: "feature", label: "Suggestion de fonctionnalité" },
    { value: "partnership", label: "Partenariat" },
    { value: "other", label: "Autre" },
] as const

export type ContactSubject = (typeof CONTACT_SUBJECTS)[number]["value"]

export const ContactSchema = z.object({
    name: z
        .string()
        .min(2, "Le prénom/nom doit contenir au moins 2 caractères.")
        .max(80, "Le prénom/nom ne doit pas dépasser 80 caractères."),
    email: z
        .string()
        .min(1, "L'adresse e-mail est requise.")
        .email("Adresse e-mail invalide."),
    subject: z.enum(
        CONTACT_SUBJECTS.map((s) => s.value) as [
            ContactSubject,
            ...ContactSubject[],
        ],
        { errorMap: () => ({ message: "Veuillez choisir un sujet." }) },
    ),
    message: z
        .string()
        .min(20, "Le message doit contenir au moins 20 caractères.")
        .max(2000, "Le message ne doit pas dépasser 2 000 caractères."),
    consent: z.literal(true, {
        errorMap: () => ({
            message: "Vous devez accepter la politique de confidentialité.",
        }),
    }),
})

export type ContactInput = z.infer<typeof ContactSchema>
