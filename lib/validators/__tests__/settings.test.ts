import { describe, it, expect } from "vitest"
import { MerchantIdentitySchema, QueueSettingsSchema, ThankYouTitleSchema } from "../settings"

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

// ---------------------------------------------------------------------------
// MerchantIdentitySchema — optional branding fields
// ---------------------------------------------------------------------------
describe("MerchantIdentitySchema — optional branding fields", () => {
    const valid = {
        name: "Boulangerie du Coin",
        business_type: "retail",
        slug: "boulangerie-du-coin",
        logo_url: null,
        default_prep_time_min: 5,
    }

    it("accepts a valid hex brand_color", () => {
        expect(
            MerchantIdentitySchema.safeParse({ ...valid, brand_color: "#4F46E5" }).success,
        ).toBe(true)
    })

    it("rejects an invalid brand_color", () => {
        expect(
            MerchantIdentitySchema.safeParse({ ...valid, brand_color: "red" }).success,
        ).toBe(false)
    })

    it("accepts a valid font_family", () => {
        expect(
            MerchantIdentitySchema.safeParse({ ...valid, font_family: "Roboto" }).success,
        ).toBe(true)
    })

    it("rejects an unknown font_family", () => {
        expect(
            MerchantIdentitySchema.safeParse({ ...valid, font_family: "Comic Sans" }).success,
        ).toBe(false)
    })

    it("accepts a valid border_radius", () => {
        expect(
            MerchantIdentitySchema.safeParse({ ...valid, border_radius: "1rem" }).success,
        ).toBe(true)
    })

    it("rejects an unknown border_radius value", () => {
        expect(
            MerchantIdentitySchema.safeParse({ ...valid, border_radius: "5px" }).success,
        ).toBe(false)
    })

    it("accepts a valid theme_pattern", () => {
        expect(
            MerchantIdentitySchema.safeParse({ ...valid, theme_pattern: "dots" }).success,
        ).toBe(true)
    })

    it("rejects an unknown theme_pattern", () => {
        expect(
            MerchantIdentitySchema.safeParse({ ...valid, theme_pattern: "stripes" }).success,
        ).toBe(false)
    })
})

// ---------------------------------------------------------------------------
// ThankYouTitleSchema
// ---------------------------------------------------------------------------
describe("ThankYouTitleSchema", () => {
    it("accepts a valid title string", () => {
        expect(ThankYouTitleSchema.safeParse("Merci !").success).toBe(true)
    })

    it("accepts null", () => {
        expect(ThankYouTitleSchema.safeParse(null).success).toBe(true)
    })

    it("accepts undefined (optional)", () => {
        expect(ThankYouTitleSchema.safeParse(undefined).success).toBe(true)
    })

    it("rejects a string longer than 80 characters", () => {
        expect(ThankYouTitleSchema.safeParse("x".repeat(81)).success).toBe(false)
    })

    it("accepts exactly 80 characters", () => {
        expect(ThankYouTitleSchema.safeParse("x".repeat(80)).success).toBe(true)
    })
})
