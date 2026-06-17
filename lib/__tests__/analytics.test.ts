import { describe, it, expect } from "vitest"
import {
    computeTotalTickets,
    computeAvgWait,
    computeBusiestSlot,
    buildRushCurveData,
    buildCsvContent,
    DAY_LABELS_FULL,
    HOURS,
} from "@/lib/utils/analytics"
import type { AnalyticsRow } from "@/lib/actions/analytics"

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const row = (
    day_of_week: number,
    hour: number,
    ticket_count: number,
    avg_wait_minutes: number | null = null,
): AnalyticsRow => ({ day_of_week, hour, ticket_count, avg_wait_minutes })

// ---------------------------------------------------------------------------
// computeTotalTickets
// ---------------------------------------------------------------------------

describe("computeTotalTickets", () => {
    it("returns 0 for an empty dataset", () => {
        expect(computeTotalTickets([])).toBe(0)
    })

    it("sums a single row", () => {
        expect(computeTotalTickets([row(1, 10, 5)])).toBe(5)
    })

    it("sums multiple rows", () => {
        const rows = [row(1, 10, 3), row(2, 11, 7), row(3, 12, 2)]
        expect(computeTotalTickets(rows)).toBe(12)
    })

    it("handles rows with 0 tickets", () => {
        const rows = [row(0, 0, 0), row(1, 1, 0), row(2, 2, 5)]
        expect(computeTotalTickets(rows)).toBe(5)
    })
})

// ---------------------------------------------------------------------------
// computeAvgWait
// ---------------------------------------------------------------------------

describe("computeAvgWait", () => {
    it("returns null for an empty dataset", () => {
        expect(computeAvgWait([])).toBeNull()
    })

    it("returns null when no row has avg_wait_minutes", () => {
        const rows = [row(1, 10, 3, null), row(2, 11, 5, null)]
        expect(computeAvgWait(rows)).toBeNull()
    })

    it("averages a single row with wait data", () => {
        expect(computeAvgWait([row(1, 10, 5, 8)])).toBe(8)
    })

    it("averages multiple rows", () => {
        const rows = [row(1, 10, 3, 10), row(2, 11, 5, 20)]
        expect(computeAvgWait(rows)).toBe(15)
    })

    it("ignores rows with null avg_wait_minutes", () => {
        const rows = [row(1, 10, 3, 10), row(2, 11, 5, null), row(3, 12, 2, 20)]
        // (10 + 20) / 2 = 15
        expect(computeAvgWait(rows)).toBe(15)
    })

    it("rounds the result to nearest minute", () => {
        // (10 + 11) / 2 = 10.5 → rounds to 11
        const rows = [row(1, 10, 3, 10), row(2, 11, 5, 11)]
        expect(computeAvgWait(rows)).toBe(11)
    })
})

// ---------------------------------------------------------------------------
// computeBusiestSlot
// ---------------------------------------------------------------------------

describe("computeBusiestSlot", () => {
    it("returns null for an empty dataset", () => {
        expect(computeBusiestSlot([])).toBeNull()
    })

    it("returns the slot label for a single row", () => {
        const result = computeBusiestSlot([row(1, 12, 5)])
        expect(result).toBe("Lundi 12h")
    })

    it("picks the row with the highest ticket_count", () => {
        const rows = [row(1, 9, 10), row(5, 18, 42), row(3, 14, 7)]
        expect(computeBusiestSlot(rows)).toBe("Vendredi 18h")
    })

    it("prefers the first occurrence when two rows tie", () => {
        const rows = [row(2, 10, 20), row(4, 15, 20)]
        // Both have count=20; the reducer keeps the first (>=), so Mardi 10h
        expect(computeBusiestSlot(rows)).toBe("Mardi 10h")
    })

    it("handles day index 0 (Sunday)", () => {
        expect(computeBusiestSlot([row(0, 8, 3)])).toBe("Dimanche 8h")
    })

    it("handles day index 6 (Saturday)", () => {
        expect(computeBusiestSlot([row(6, 20, 99)])).toBe("Samedi 20h")
    })
})

// ---------------------------------------------------------------------------
// buildRushCurveData
// ---------------------------------------------------------------------------

describe("buildRushCurveData", () => {
    it("always returns exactly 24 entries", () => {
        const result = buildRushCurveData([], 1)
        expect(result).toHaveLength(24)
    })

    it("fills hours with no data as ticket_count=0", () => {
        const result = buildRushCurveData([], 1)
        expect(result.every((r) => r.ticket_count === 0)).toBe(true)
    })

    it("maps hour indices 0–23 in order", () => {
        const result = buildRushCurveData([], 0)
        expect(result.map((r) => r.hour)).toEqual(HOURS)
    })

    it("populates data for the selected day", () => {
        const rows = [row(3, 14, 8, 5)]  // Wednesday 14h
        const result = buildRushCurveData(rows, 3)
        const slot = result.find((r) => r.hour === 14)!
        expect(slot.ticket_count).toBe(8)
        expect(slot.avg_wait_minutes).toBe(5)
    })

    it("ignores rows from other days", () => {
        const rows = [row(2, 10, 99)]  // Tuesday, not Monday
        const result = buildRushCurveData(rows, 1)
        expect(result.every((r) => r.ticket_count === 0)).toBe(true)
    })

    it("sets day_of_week on every entry to selectedDay", () => {
        const result = buildRushCurveData([], 5)
        expect(result.every((r) => r.day_of_week === 5)).toBe(true)
    })

    it("builds the correct label for each slot", () => {
        const result = buildRushCurveData([], 1)  // Monday
        expect(result[0].label).toBe("Lundi 0h")
        expect(result[9].label).toBe("Lundi 9h")
        expect(result[23].label).toBe("Lundi 23h")
    })

    it("fills avg_wait_minutes as null when not present", () => {
        const result = buildRushCurveData([], 0)
        expect(result.every((r) => r.avg_wait_minutes === null)).toBe(true)
    })
})

// ---------------------------------------------------------------------------
// buildCsvContent
// ---------------------------------------------------------------------------

describe("buildCsvContent", () => {
    it("starts with a UTF-8 BOM", () => {
        const csv = buildCsvContent([])
        expect(csv.charCodeAt(0)).toBe(0xfeff)
    })

    it("includes the header row", () => {
        const csv = buildCsvContent([])
        expect(csv).toContain("jour_semaine;heure;tickets;attente_moy_min")
    })

    it("outputs one data line per row", () => {
        const rows = [row(1, 10, 3, 5), row(5, 18, 12, null)]
        const csv = buildCsvContent(rows)
        const lines = csv.split("\n")
        // BOM+header + 2 data lines = 3 lines
        expect(lines).toHaveLength(3)
    })

    it("formats a row with wait data correctly", () => {
        const csv = buildCsvContent([row(1, 10, 3, 5)])
        expect(csv).toContain("Lundi;10;3;5")
    })

    it("outputs an empty string for avg_wait_minutes when null", () => {
        const csv = buildCsvContent([row(5, 18, 12, null)])
        expect(csv).toContain("Vendredi;18;12;")
    })

    it("uses semicolons as separators", () => {
        const csv = buildCsvContent([row(0, 0, 1, 2)])
        const dataLine = csv.split("\n")[1]
        expect(dataLine.split(";")).toHaveLength(4)
    })

    it("uses French day names", () => {
        for (let day = 0; day < 7; day++) {
            const csv = buildCsvContent([row(day, 0, 1)])
            expect(csv).toContain(DAY_LABELS_FULL[day])
        }
    })

    it("returns only header when rows is empty", () => {
        const csv = buildCsvContent([])
        // BOM + "jour_semaine;..." + "\n" + "" (empty body)
        const lines = csv.split("\n")
        expect(lines).toHaveLength(2)
        expect(lines[1]).toBe("")
    })
})
