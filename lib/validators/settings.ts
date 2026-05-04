/**
 * @module validators/settings
 * @category Validators
 *
 * Zod schemas for merchant settings form inputs.
 */
import { z } from "zod"
import { BusinessTypeSchema } from "@/lib/validators/business"

/**
 * Schema for updating the merchant identity section:
 * name, slug, logo, and default preparation time.
 * Validated by updateMerchantSettingsAction.
 */
export const MerchantIdentitySchema = z.object({
    name: z
        .string()
        .min(1, "Le nom de l'établissement est requis.")
        .max(100, "100 caractères maximum."),
    business_type: BusinessTypeSchema,
    slug: z
        .string()
        .min(3, "Le slug doit contenir au minimum 3 caractères.")
        .max(50, "50 caractères maximum.")
        .regex(
            /^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/,
            "Slug invalide — utilisez uniquement des lettres minuscules, chiffres et tirets.",
        ),
    logo_url: z.string().url("URL de logo invalide.").nullable().optional(),
    brand_color: z
        .string()
        .regex(
            /^#[0-9a-fA-F]{6}$/i,
            "Couleur invalide — veuillez utiliser un format hexadécimal (ex: #4F46E5).",
        )
        .nullable()
        .optional()
        .default("#4F46E5"),
    font_family: z
        .enum(["Inter", "Roboto", "Open Sans", "Lato", "Poppins"])
        .default("Inter")
        .optional()
        .nullable(),
    border_radius: z
        .enum(["0px", "0.25rem", "0.5rem", "1rem", "9999px"])
        .default("0.5rem")
        .optional()
        .nullable(),
    theme_pattern: z
        .enum([
            "none",
            "dots",
            "grid",
            "glow",
            "food_burger",
            "food_pizza",
            "food_coffee",
            "food_cutlery",
        ])
        .default("none")
        .optional()
        .nullable(),
    default_prep_time_min: z
        .number()
        .int()
        .min(1, "Minimum 1 minute.")
        .max(120, "Maximum 120 minutes."),
})

/**
 * Schema for updating the queue configuration section:
 * capacity, welcome message, and notification preferences.
 * Validated by updateQueueSettingsAction.
 */
export const QueueSettingsSchema = z.object({
    max_capacity: z
        .number()
        .int()
        .min(1, "Minimum 1 personne.")
        .max(500, "Maximum 500 personnes."),
    welcome_message: z
        .string()
        .max(500, "500 caractères maximum.")
        .nullable()
        .optional(),
    notifications_enabled: z.boolean(),
    auto_close_enabled: z.boolean(),
})

/**
 * Schema for updating the title shown on the completed-ticket banner.
 * Validated by updateThankYouTitleAction.
 */
export const ThankYouTitleSchema = z
    .string()
    .max(80, "80 caractères maximum.")
    .nullable()
    .optional()

export type MerchantIdentityInput = z.infer<typeof MerchantIdentitySchema>
export type QueueSettingsInput = z.infer<typeof QueueSettingsSchema>
export type ThankYouTitleInput = z.infer<typeof ThankYouTitleSchema>
