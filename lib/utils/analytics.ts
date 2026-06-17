/**
 * Pure analytics computation helpers extracted from AnalyticsDashboard.
 * These functions have no side-effects and are easily unit-tested.
 */

import type { AnalyticsRow } from "@/lib/actions/analytics"

export const DAY_LABELS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]

export const DAY_LABELS_FULL = [
    "Dimanche",
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
]

export const HOURS = Array.from({ length: 24 }, (_, i) => i)

/** Sum of all ticket_count values across rows. */
export function computeTotalTickets(rows: AnalyticsRow[]): number {
    return rows.reduce((acc, r) => acc + r.ticket_count, 0)
}

/**
 * Mean of avg_wait_minutes across rows that have a non-null value,
 * rounded to the nearest minute. Returns null when no row has wait data.
 */
export function computeAvgWait(rows: AnalyticsRow[]): number | null {
    const withWait = rows.filter((r) => r.avg_wait_minutes != null)
    if (withWait.length === 0) return null
    const total = withWait.reduce((acc, r) => acc + (r.avg_wait_minutes ?? 0), 0)
    return Math.round(total / withWait.length)
}

/**
 * Human-readable label for the slot with the highest ticket_count.
 * Returns null for an empty dataset.
 */
export function computeBusiestSlot(rows: AnalyticsRow[]): string | null {
    if (rows.length === 0) return null
    const peak = rows.reduce((a, b) => (a.ticket_count >= b.ticket_count ? a : b))
    return `${DAY_LABELS_FULL[peak.day_of_week]} ${peak.hour}h`
}

export type RushCurveRow = {
    hour: number
    label: string
    ticket_count: number
    avg_wait_minutes: number | null
    day_of_week: number
}

/**
 * Build a full 24-hour series for a given day-of-week.
 * Hours without data are filled with ticket_count=0 so the chart is unbroken.
 */
export function buildRushCurveData(
    rows: AnalyticsRow[],
    selectedDay: number,
): RushCurveRow[] {
    const byHour = new Map<number, AnalyticsRow>()
    for (const r of rows.filter((r) => r.day_of_week === selectedDay)) {
        byHour.set(r.hour, r)
    }
    return HOURS.map((h) => {
        const r = byHour.get(h)
        return {
            hour: h,
            label: `${DAY_LABELS_FULL[selectedDay]} ${h}h`,
            ticket_count: r?.ticket_count ?? 0,
            avg_wait_minutes: r?.avg_wait_minutes ?? null,
            day_of_week: selectedDay,
        }
    })
}

/**
 * Build the UTF-8 BOM + semicolon-delimited CSV string for Excel export.
 * Does NOT touch the DOM — callers handle the Blob/download side.
 */
export function buildCsvContent(rows: AnalyticsRow[]): string {
    const header = "jour_semaine;heure;tickets;attente_moy_min\n"
    const body = rows
        .map(
            (r) =>
                `${DAY_LABELS_FULL[r.day_of_week]};${r.hour};${r.ticket_count};${r.avg_wait_minutes ?? ""}`,
        )
        .join("\n")
    return "\uFEFF" + header + body
}
