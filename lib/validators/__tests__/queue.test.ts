import { describe, it, expect } from "vitest"
import { BusinessTypeSchema } from "../business"
import { CreateManualTicketSchema, TicketIdSchema, ToggleQueueSchema, JoinQueueSchema } from "../queue"

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

// ---------------------------------------------------------------------------
// TicketIdSchema
// ---------------------------------------------------------------------------
describe("TicketIdSchema", () => {
    it("accepts a valid UUID", () => {
        expect(
            TicketIdSchema.safeParse({ id: "550e8400-e29b-41d4-a716-446655440000" }).success,
        ).toBe(true)
    })

    it("rejects a non-UUID string", () => {
        expect(
            TicketIdSchema.safeParse({ id: "not-a-uuid" }).success,
        ).toBe(false)
    })

    it("rejects an empty id", () => {
        expect(
            TicketIdSchema.safeParse({ id: "" }).success,
        ).toBe(false)
    })

    it("rejects missing id field", () => {
        expect(
            TicketIdSchema.safeParse({}).success,
        ).toBe(false)
    })
})

// ---------------------------------------------------------------------------
// ToggleQueueSchema
// ---------------------------------------------------------------------------
describe("ToggleQueueSchema", () => {
    it("accepts is_open: true", () => {
        expect(
            ToggleQueueSchema.safeParse({ is_open: true }).success,
        ).toBe(true)
    })

    it("accepts is_open: false", () => {
        expect(
            ToggleQueueSchema.safeParse({ is_open: false }).success,
        ).toBe(true)
    })

    it("rejects a string instead of boolean", () => {
        expect(
            ToggleQueueSchema.safeParse({ is_open: "true" }).success,
        ).toBe(false)
    })

    it("rejects missing is_open field", () => {
        expect(
            ToggleQueueSchema.safeParse({}).success,
        ).toBe(false)
    })
})

// ---------------------------------------------------------------------------
// JoinQueueSchema
// ---------------------------------------------------------------------------
describe("JoinQueueSchema", () => {
    const valid = {
        customerName: "Alice",
        consent: true as const,
        token: "abc123",
        slug: "ma-boutique",
    }

    it("accepts a valid payload", () => {
        expect(JoinQueueSchema.safeParse(valid).success).toBe(true)
    })

    it("rejects customerName shorter than 2 characters", () => {
        expect(
            JoinQueueSchema.safeParse({ ...valid, customerName: "A" }).success,
        ).toBe(false)
    })

    it("rejects customerName longer than 50 characters", () => {
        expect(
            JoinQueueSchema.safeParse({ ...valid, customerName: "a".repeat(51) }).success,
        ).toBe(false)
    })

    it("rejects consent: false", () => {
        expect(
            JoinQueueSchema.safeParse({ ...valid, consent: false }).success,
        ).toBe(false)
    })

    it("rejects an empty token", () => {
        expect(
            JoinQueueSchema.safeParse({ ...valid, token: "" }).success,
        ).toBe(false)
    })

    it("rejects an empty slug", () => {
        expect(
            JoinQueueSchema.safeParse({ ...valid, slug: "" }).success,
        ).toBe(false)
    })
})
