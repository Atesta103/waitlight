import { describe, it, expect } from "vitest"
import { computeQrSize, QR_SIZE_MIN, QR_SIZE_MAX, QR_CARD_CHROME_PX } from "@/lib/utils/qr-size"

describe("computeQrSize", () => {
    it("returns available height minus chrome when within range", () => {
        // 366 chrome + 200 => size 200
        expect(computeQrSize(QR_CARD_CHROME_PX + 200)).toBe(200)
    })

    it("clamps to the max on a tall container", () => {
        expect(computeQrSize(2000)).toBe(QR_SIZE_MAX)
    })

    it("clamps to the min on a short container", () => {
        expect(computeQrSize(QR_CARD_CHROME_PX + 10)).toBe(QR_SIZE_MIN)
    })

    it("returns the min for a zero / unmeasured container", () => {
        expect(computeQrSize(0)).toBe(QR_SIZE_MIN)
    })

    it("returns the min for a non-finite height", () => {
        expect(computeQrSize(Number.NaN)).toBe(QR_SIZE_MIN)
    })

    it("rounds fractional results", () => {
        expect(computeQrSize(QR_CARD_CHROME_PX + 150.6)).toBe(151)
    })
})
