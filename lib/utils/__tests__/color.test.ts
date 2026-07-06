import { describe, it, expect } from "vitest"
import { getContrastYIQ, isValidHexCode } from "@/lib/utils/color"

// ---------------------------------------------------------------------------
// getContrastYIQ
// ---------------------------------------------------------------------------
describe("getContrastYIQ", () => {
    it("returns 'black' for a light color (#FFFFFF)", () => {
        expect(getContrastYIQ("#FFFFFF")).toBe("black")
    })

    it("returns 'white' for a dark color (#000000)", () => {
        expect(getContrastYIQ("#000000")).toBe("white")
    })

    it("returns 'black' for a yellow (#FFFF00)", () => {
        expect(getContrastYIQ("#FFFF00")).toBe("black")
    })

    it("returns 'white' for a dark blue (#003366)", () => {
        expect(getContrastYIQ("#003366")).toBe("white")
    })

    it("handles hex without # prefix", () => {
        expect(getContrastYIQ("FFFFFF")).toBe("black")
    })

    it("handles 3-character shorthand (#FFF)", () => {
        expect(getContrastYIQ("#FFF")).toBe("black")
    })

    it("handles 3-character shorthand (#000)", () => {
        expect(getContrastYIQ("#000")).toBe("white")
    })
})

// ---------------------------------------------------------------------------
// isValidHexCode
// ---------------------------------------------------------------------------
describe("isValidHexCode", () => {
    it("returns true for a 6-digit hex (#4F46E5)", () => {
        expect(isValidHexCode("#4F46E5")).toBe(true)
    })

    it("returns true for a 3-digit hex (#FFF)", () => {
        expect(isValidHexCode("#FFF")).toBe(true)
    })

    it("returns false for a hex without leading #", () => {
        expect(isValidHexCode("4F46E5")).toBe(false)
    })

    it("returns false for an empty string", () => {
        expect(isValidHexCode("")).toBe(false)
    })

    it("returns false for a named color", () => {
        expect(isValidHexCode("red")).toBe(false)
    })

    it("returns false for a 4-digit hex", () => {
        expect(isValidHexCode("#FFFF")).toBe(false)
    })

    it("returns false for invalid characters", () => {
        expect(isValidHexCode("#GGGGGG")).toBe(false)
    })

    it("returns true for lowercase hex digits (#a1b2c3)", () => {
        expect(isValidHexCode("#a1b2c3")).toBe(true)
    })
})
