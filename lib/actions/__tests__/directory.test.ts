import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    /** Terminal resolver for any merchants query; each test sets its result. */
    query: vi.fn(),
    checkRateLimit: vi.fn(),
    headerGet: vi.fn(),
    /** Captures the pattern handed to .ilike(), which no mock return value exposes. */
    captured: { ilikePattern: "" },
}))

vi.mock("next/headers", () => ({
    headers: vi.fn(async () => ({ get: mocks.headerGet })),
}))

vi.mock("@/lib/utils/rate-limit", () => ({
    checkRateLimit: mocks.checkRateLimit,
}))

vi.mock("@/lib/supabase/server", () => ({
    createClient: vi.fn(async () => ({
        // A single chainable stub covering both query shapes:
        //   search:  .select().eq().ilike().order().limit()
        //   map:     .select().eq().not().not().limit()
        from: (table: string) => {
            if (table !== "merchants") {
                throw new Error(`Unexpected table ${table}`)
            }
            const chain = {
                select: () => chain,
                eq: () => chain,
                ilike: (_column: string, pattern: string) => {
                    mocks.captured.ilikePattern = pattern
                    return chain
                },
                order: () => chain,
                not: () => chain,
                limit: () => mocks.query(),
            }
            return chain
        },
    })),
}))

import {
    getAllPublicMerchantsAction,
    searchPublicMerchantsAction,
} from "@/lib/actions/directory"

const merchantRow = {
    slug: "testa-crousty",
    name: "TESTA CROUSTY",
    business_type: "food",
    logo_url: null,
    is_open: true,
    address: "1 Impasse Lucien Brocard 83136 Garéoult",
    latitude: 43.341036,
    longitude: 6.045869,
}

beforeEach(() => {
    vi.clearAllMocks()
    mocks.checkRateLimit.mockReturnValue(true)
    mocks.headerGet.mockReturnValue(null)
})

describe("getAllPublicMerchantsAction", () => {
    it("returns every public merchant unchanged", async () => {
        mocks.query.mockResolvedValue({ data: [merchantRow], error: null })

        const result = await getAllPublicMerchantsAction()

        expect(result).toEqual({ data: [merchantRow] })
    })

    it("does not compute distance server-side (left to the client)", async () => {
        mocks.query.mockResolvedValue({ data: [merchantRow], error: null })

        const result = await getAllPublicMerchantsAction()

        expect("error" in result).toBe(false)
        if (!("error" in result)) {
            expect(result.data[0]).not.toHaveProperty("distance_km")
        }
    })

    it("treats a null payload as an empty list", async () => {
        mocks.query.mockResolvedValue({ data: null, error: null })

        const result = await getAllPublicMerchantsAction()

        expect(result).toEqual({ data: [] })
    })

    it("returns an error when the query fails", async () => {
        mocks.query.mockResolvedValue({ data: null, error: { message: "boom" } })
        vi.spyOn(console, "error").mockImplementation(() => {})

        const result = await getAllPublicMerchantsAction()

        expect(result).toHaveProperty("error")
        expect(result).not.toHaveProperty("data")
    })

    it("rejects the request once the IP rate limit is exceeded", async () => {
        mocks.checkRateLimit.mockReturnValue(false)

        const result = await getAllPublicMerchantsAction()

        expect(result).toEqual({
            error: "Trop de recherches. Veuillez patienter une minute.",
        })
        expect(mocks.query).not.toHaveBeenCalled()
    })

    it("rate-limits the map under its own key, keyed on the client IP", async () => {
        mocks.query.mockResolvedValue({ data: [], error: null })
        mocks.headerGet.mockImplementation((name: string) =>
            name === "x-forwarded-for" ? "203.0.113.7" : null,
        )

        await getAllPublicMerchantsAction()

        expect(mocks.checkRateLimit).toHaveBeenCalledWith("map:203.0.113.7", 10, 60_000)
    })

    it("takes the first address from a forwarded-for chain", async () => {
        mocks.query.mockResolvedValue({ data: [], error: null })
        mocks.headerGet.mockImplementation((name: string) =>
            name === "x-forwarded-for" ? "203.0.113.7, 70.41.3.18" : null,
        )

        await getAllPublicMerchantsAction()

        expect(mocks.checkRateLimit).toHaveBeenCalledWith(
            "map:203.0.113.7",
            expect.any(Number),
            expect.any(Number),
        )
    })
})

describe("searchPublicMerchantsAction", () => {
    it("returns nothing for a query below two characters", async () => {
        const result = await searchPublicMerchantsAction("a")

        expect(result).toEqual({ data: [] })
        expect(mocks.checkRateLimit).not.toHaveBeenCalled()
    })

    it("escapes LIKE wildcards so they match literally", async () => {
        // Without escaping, a query of "%" matches the entire directory.
        mocks.query.mockResolvedValue({ data: [], error: null })

        await searchPublicMerchantsAction("100% pizza")

        expect(mocks.captured.ilikePattern).toBe("%100\\% pizza%")
    })

    it("rejects the request once the IP rate limit is exceeded", async () => {
        mocks.checkRateLimit.mockReturnValue(false)

        const result = await searchPublicMerchantsAction("pizza")

        expect(result).toEqual({
            error: "Trop de recherches. Veuillez patienter une minute.",
        })
    })
})
