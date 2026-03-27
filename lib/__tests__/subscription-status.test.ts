import { describe, it, expect } from "vitest"
import { isActiveStatus, ACTIVE_STATUSES } from "@/lib/subscription-status"

// ---------------------------------------------------------------------------
// isActiveStatus
// ---------------------------------------------------------------------------
describe("isActiveStatus", () => {
    it("returns true for 'active'", () => {
        expect(isActiveStatus("active")).toBe(true)
    })

    it("returns true for 'trialing'", () => {
        expect(isActiveStatus("trialing")).toBe(true)
    })

    it("covers all ACTIVE_STATUSES entries", () => {
        for (const status of ACTIVE_STATUSES) {
            expect(isActiveStatus(status)).toBe(true)
        }
    })

    it("returns false for 'past_due'", () => {
        expect(isActiveStatus("past_due")).toBe(false)
    })

    it("returns false for 'canceled'", () => {
        expect(isActiveStatus("canceled")).toBe(false)
    })

    it("returns false for 'incomplete'", () => {
        expect(isActiveStatus("incomplete")).toBe(false)
    })

    it("returns false for 'incomplete_expired'", () => {
        expect(isActiveStatus("incomplete_expired")).toBe(false)
    })

    it("returns false for 'unpaid'", () => {
        expect(isActiveStatus("unpaid")).toBe(false)
    })

    it("returns false for an empty string", () => {
        expect(isActiveStatus("")).toBe(false)
    })

    it("returns false for an unknown arbitrary status", () => {
        expect(isActiveStatus("free_forever")).toBe(false)
    })
})
