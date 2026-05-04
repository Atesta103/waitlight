import { describe, it, expect } from "vitest"
import { MerchantIdentitySchema, QueueSettingsSchema } from "../settings"

// ---------------------------------------------------------------------------
// MerchantIdentitySchema
// ---------------------------------------------------------------------------
describe("MerchantIdentitySchema", () => {
    const valid = {
        name: "Boulangerie du Coin",
        business_type: "retail",
        slug: "boulangerie-du-coin",
        logo_url: null,
        default_prep_time_min: 5,
    }

    it("accepts a valid payload", () => {
        expect(MerchantIdentitySchema.safeParse(valid).success).toBe(true)
    })

    it("accepts logo_url as a proper URL", () => {
        const result = MerchantIdentitySchema.safeParse({
            ...valid,
            logo_url: "https://cdn.example.com/logos/merchant-abc123.webp",
        })
        expect(result.success).toBe(true)
    })

    it("rejects an empty name", () => {
        const result = MerchantIdentitySchema.safeParse({
            ...valid,
            name: "",
        })
        expect(result.success).toBe(false)
    })

    it("rejects a name longer than 100 characters", () => {
        const result = MerchantIdentitySchema.safeParse({
            ...valid,
            name: "a".repeat(101),
        })
        expect(result.success).toBe(false)
    })

    it("rejects a slug shorter than 3 characters", () => {
        const result = MerchantIdentitySchema.safeParse({
            ...valid,
            slug: "ab",
        })
        expect(result.success).toBe(false)
    })

    it("rejects a slug with uppercase letters", () => {
        const result = MerchantIdentitySchema.safeParse({
            ...valid,
            slug: "Boulangerie",
        })
        expect(result.success).toBe(false)
    })

    it("rejects a slug starting with a hyphen", () => {
        const result = MerchantIdentitySchema.safeParse({
            ...valid,
            slug: "-invalid-slug",
        })
        expect(result.success).toBe(false)
    })

    it("rejects a slug ending with a hyphen", () => {
        const result = MerchantIdentitySchema.safeParse({
            ...valid,
            slug: "invalid-slug-",
        })
        expect(result.success).toBe(false)
    })

    it("rejects an invalid logo_url string", () => {
        const result = MerchantIdentitySchema.safeParse({
            ...valid,
            logo_url: "not-a-url",
        })
        expect(result.success).toBe(false)
    })

    it("rejects default_prep_time_min below 1", () => {
        const result = MerchantIdentitySchema.safeParse({
            ...valid,
            default_prep_time_min: 0,
        })
        expect(result.success).toBe(false)
    })

    it("rejects default_prep_time_min above 120", () => {
        const result = MerchantIdentitySchema.safeParse({
            ...valid,
            default_prep_time_min: 121,
        })
        expect(result.success).toBe(false)
    })
})

// ---------------------------------------------------------------------------
// QueueSettingsSchema
// ---------------------------------------------------------------------------
describe("QueueSettingsSchema", () => {
    const valid = {
        max_capacity: 50,
        welcome_message: "Bienvenue ! Scannez pour rejoindre la file.",
        notifications_enabled: true,
        auto_close_enabled: false,
    }

    it("accepts a valid payload", () => {
        expect(QueueSettingsSchema.safeParse(valid).success).toBe(true)
    })

    it("accepts a null welcome_message", () => {
        const result = QueueSettingsSchema.safeParse({
            ...valid,
            welcome_message: null,
        })
        expect(result.success).toBe(true)
    })

    it("accepts both booleans as false", () => {
        const result = QueueSettingsSchema.safeParse({
            ...valid,
            notifications_enabled: false,
            auto_close_enabled: false,
        })
        expect(result.success).toBe(true)
    })

    it("rejects max_capacity of 0", () => {
        const result = QueueSettingsSchema.safeParse({
            ...valid,
            max_capacity: 0,
        })
        expect(result.success).toBe(false)
    })

    it("rejects max_capacity above 500", () => {
        const result = QueueSettingsSchema.safeParse({
            ...valid,
            max_capacity: 501,
        })
        expect(result.success).toBe(false)
    })

    it("rejects a welcome_message longer than 500 characters", () => {
        const result = QueueSettingsSchema.safeParse({
            ...valid,
            welcome_message: "x".repeat(501),
        })
        expect(result.success).toBe(false)
    })

    it("rejects non-integer max_capacity", () => {
        const result = QueueSettingsSchema.safeParse({
            ...valid,
            max_capacity: 10.5,
        })
        expect(result.success).toBe(false)
    })

    it("rejects non-boolean notifications_enabled", () => {
        const result = QueueSettingsSchema.safeParse({
            ...valid,
            notifications_enabled: "true",
        })
        expect(result.success).toBe(false)
    })
})
