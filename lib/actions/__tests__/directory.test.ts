import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    rpc: vi.fn(),
    ilikeLimit: vi.fn(),
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
        rpc: mocks.rpc,
        from: (table: string) => {
            if (table !== "merchants") {
                throw new Error(`Unexpected table ${table}`)
            }
            // .select().eq().ilike().order().limit()
            return {
                select: () => ({
                    eq: () => ({
                        ilike: (_column: string, pattern: string) => {
                            mocks.captured.ilikePattern = pattern
                            return {
                                order: () => ({ limit: mocks.ilikeLimit }),
                            }
                        },
                    }),
                }),
            }
        },
    })),
}))

import {
    getNearbyMerchantsAction,
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
    distance_km: 0.0113251881835722,
}

beforeEach(() => {
    vi.clearAllMocks()
    mocks.checkRateLimit.mockReturnValue(true)
    mocks.headerGet.mockReturnValue(null)
})

describe("getNearbyMerchantsAction", () => {
    it("returns merchants from the RPC unchanged", async () => {
        mocks.rpc.mockResolvedValue({ data: [merchantRow], error: null })

        const result = await getNearbyMerchantsAction({ lat: 43.34, lng: 6.04 })

        expect(result).toEqual({ data: [merchantRow] })
    })

    it("passes exact coordinates through without blurring them", async () => {
        // The full postal address ships in the same payload, so rounding the
        // coordinates would imply a privacy guarantee the response never makes.
        mocks.rpc.mockResolvedValue({ data: [merchantRow], error: null })

        const result = await getNearbyMerchantsAction({ lat: 43.34, lng: 6.04 })

        expect(result).toMatchObject({
            data: [{ latitude: 43.341036, longitude: 6.045869 }],
        })
    })

    it("clamps an oversized radius to the server maximum", async () => {
        mocks.rpc.mockResolvedValue({ data: [], error: null })

        await getNearbyMerchantsAction({ lat: 43.34, lng: 6.04, radiusKm: 5000 })

        expect(mocks.rpc).toHaveBeenCalledWith(
            "nearby_public_merchants",
            expect.objectContaining({ p_radius_km: 25, p_limit: 30 }),
        )
    })

    it("honours a smaller requested radius", async () => {
        mocks.rpc.mockResolvedValue({ data: [], error: null })

        await getNearbyMerchantsAction({ lat: 43.34, lng: 6.04, radiusKm: 5 })

        expect(mocks.rpc).toHaveBeenCalledWith(
            "nearby_public_merchants",
            expect.objectContaining({ p_radius_km: 5 }),
        )
    })

    it("defaults to the maximum radius when none is given", async () => {
        mocks.rpc.mockResolvedValue({ data: [], error: null })

        await getNearbyMerchantsAction({ lat: 43.34, lng: 6.04 })

        expect(mocks.rpc).toHaveBeenCalledWith(
            "nearby_public_merchants",
            expect.objectContaining({ p_radius_km: 25 }),
        )
    })

    it("distinguishes an empty result from a failure", async () => {
        // Regression guard: an empty list is a legitimate answer ("no shops
        // nearby") and must never surface as an error, or the UI shows a fault
        // where there is none.
        mocks.rpc.mockResolvedValue({ data: [], error: null })

        const result = await getNearbyMerchantsAction({ lat: 48.85, lng: 2.35 })

        expect(result).toEqual({ data: [] })
        expect(result).not.toHaveProperty("error")
    })

    it("treats a null payload as an empty result", async () => {
        mocks.rpc.mockResolvedValue({ data: null, error: null })

        const result = await getNearbyMerchantsAction({ lat: 48.85, lng: 2.35 })

        expect(result).toEqual({ data: [] })
    })

    it("returns an error when the RPC fails", async () => {
        mocks.rpc.mockResolvedValue({
            data: null,
            error: { code: "PGRST202", message: "Could not find the function" },
        })
        vi.spyOn(console, "error").mockImplementation(() => {})

        const result = await getNearbyMerchantsAction({ lat: 43.34, lng: 6.04 })

        expect(result).toHaveProperty("error")
        expect(result).not.toHaveProperty("data")
    })

    it("rejects the request once the IP rate limit is exceeded", async () => {
        mocks.checkRateLimit.mockReturnValue(false)

        const result = await getNearbyMerchantsAction({ lat: 43.34, lng: 6.04 })

        expect(result).toEqual({
            error: "Trop de recherches. Veuillez patienter une minute.",
        })
        expect(mocks.rpc).not.toHaveBeenCalled()
    })

    it("rate-limits nearby search separately from name search", async () => {
        // Aggregate location data is more sensitive to scrape than a name
        // lookup, so the two must not share a bucket.
        mocks.rpc.mockResolvedValue({ data: [], error: null })
        mocks.headerGet.mockImplementation((name: string) =>
            name === "x-forwarded-for" ? "203.0.113.7" : null,
        )

        await getNearbyMerchantsAction({ lat: 43.34, lng: 6.04 })

        expect(mocks.checkRateLimit).toHaveBeenCalledWith("nearby:203.0.113.7", 10, 60_000)
    })

    it("takes the first address from a forwarded-for chain", async () => {
        mocks.rpc.mockResolvedValue({ data: [], error: null })
        mocks.headerGet.mockImplementation((name: string) =>
            name === "x-forwarded-for" ? "203.0.113.7, 70.41.3.18" : null,
        )

        await getNearbyMerchantsAction({ lat: 43.34, lng: 6.04 })

        expect(mocks.checkRateLimit).toHaveBeenCalledWith(
            "nearby:203.0.113.7",
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
        mocks.ilikeLimit.mockResolvedValue({ data: [], error: null })

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
