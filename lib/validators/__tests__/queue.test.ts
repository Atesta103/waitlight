import { describe, it, expect } from "vitest"
import { BusinessTypeSchema } from "../business"
import { CreateManualTicketSchema } from "../queue"

// ---------------------------------------------------------------------------
// BusinessTypeSchema
// ---------------------------------------------------------------------------
describe("BusinessTypeSchema", () => {
    it("accepts a valid business type", () => {
        expect(BusinessTypeSchema.safeParse("retail").success).toBe(true)
    })

    it("rejects unknown business types", () => {
        expect(BusinessTypeSchema.safeParse("hospital").success).toBe(false)
    })

    it("rejects casing mismatches", () => {
        expect(BusinessTypeSchema.safeParse("Retail").success).toBe(false)
    })
})

// ---------------------------------------------------------------------------
// CreateManualTicketSchema
// ---------------------------------------------------------------------------
describe("CreateManualTicketSchema", () => {
    it("accepts a valid customer name", () => {
        expect(
            CreateManualTicketSchema.safeParse({ customerName: "Alice" })
                .success,
        ).toBe(true)
    })

    it("rejects names shorter than 2 characters", () => {
        expect(
            CreateManualTicketSchema.safeParse({ customerName: "A" }).success,
        ).toBe(false)
    })

    it("rejects names longer than 50 characters", () => {
        expect(
            CreateManualTicketSchema.safeParse({
                customerName: "a".repeat(51),
            }).success,
        ).toBe(false)
    })
})
