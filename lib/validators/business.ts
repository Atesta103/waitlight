/**
 * @module validators/business
 * @category Validators
 *
 * Business type schema shared across onboarding, settings, and copy helpers.
 */
import { z } from "zod"

export const BusinessTypeSchema = z.enum([
    "food",
    "healthcare",
    "retail",
    "public_service",
])

export type BusinessType = z.infer<typeof BusinessTypeSchema>
