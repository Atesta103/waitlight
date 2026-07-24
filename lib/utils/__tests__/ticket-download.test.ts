import { describe, expect, it } from "vitest"
import {
    buildRecoverUrl,
    formatArrivalTime,
    parseRecoverParams,
} from "@/lib/utils/ticket-download"

describe("formatArrivalTime", () => {
    it("formats an ISO timestamp as HH:MM", () => {
        const iso = new Date(Date.UTC(2026, 6, 24, 14, 32, 0)).toISOString()
        expect(formatArrivalTime(iso)).toMatch(/^\d{2}:\d{2}$/)
    })
})

describe("buildRecoverUrl", () => {
    it("builds a /{slug}/retrouver URL with the name and code as query params", () => {
        const url = buildRecoverUrl({
            baseUrl: "https://waitlight.app",
            slug: "testa-crousty",
            customerName: "Jean-Paul",
            code: "4F2K",
        })
        expect(url).toBe(
            "https://waitlight.app/testa-crousty/retrouver?name=Jean-Paul&code=4F2K",
        )
    })

    it("encodes special characters in the customer name", () => {
        const url = buildRecoverUrl({
            baseUrl: "https://waitlight.app",
            slug: "test",
            customerName: "Anaïs & Léo",
            code: "AB12",
        })
        expect(url).toContain("name=Ana%C3%AFs+%26+L%C3%A9o")
    })
})

describe("parseRecoverParams", () => {
    it("reads name and code from the URL search params", () => {
        const params = new URLSearchParams("name=Jean&code=4F2K")
        expect(parseRecoverParams(params)).toEqual({ name: "Jean", code: "4F2K" })
    })

    it("defaults to empty strings when params are absent", () => {
        expect(parseRecoverParams(new URLSearchParams(""))).toEqual({
            name: "",
            code: "",
        })
    })
})
