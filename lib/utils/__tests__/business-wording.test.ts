import { describe, it, expect } from "vitest"
import { getBusinessWording } from "@/lib/utils/business-wording"

// ---------------------------------------------------------------------------
// getBusinessWording
// ---------------------------------------------------------------------------
describe("getBusinessWording", () => {
    it("returns 'retail' wording for 'retail'", () => {
        const w = getBusinessWording("retail")
        expect(w.singular).toBe("client")
        expect(w.joinCta).toBe("Prendre ma place")
    })

    it("returns 'food' wording for 'food'", () => {
        const w = getBusinessWording("food")
        expect(w.serviceDesk).toBe("comptoir")
        expect(w.joinCta).toBe("Rejoindre la file")
    })

    it("returns 'healthcare' wording for 'healthcare'", () => {
        const w = getBusinessWording("healthcare")
        expect(w.singular).toBe("patient")
        expect(w.plural).toBe("patients")
    })

    it("returns 'public_service' wording for 'public_service'", () => {
        const w = getBusinessWording("public_service")
        expect(w.singular).toBe("usager")
        expect(w.serviceDesk).toBe("guichet")
    })

    it("falls back to 'retail' wording for an unknown type", () => {
        const w = getBusinessWording("hospital")
        expect(w.singular).toBe("client")
    })

    it("falls back to 'retail' wording for null", () => {
        const w = getBusinessWording(null)
        expect(w.singular).toBe("client")
    })

    it("falls back to 'retail' wording for undefined", () => {
        const w = getBusinessWording(undefined)
        expect(w.singular).toBe("client")
    })

    it("falls back to 'retail' wording for an empty string", () => {
        const w = getBusinessWording("")
        expect(w.singular).toBe("client")
    })

    it("returns all four wording keys for every business type", () => {
        const types = ["food", "healthcare", "retail", "public_service"] as const
        for (const t of types) {
            const w = getBusinessWording(t)
            expect(w).toHaveProperty("singular")
            expect(w).toHaveProperty("plural")
            expect(w).toHaveProperty("serviceDesk")
            expect(w).toHaveProperty("joinCta")
        }
    })
})
