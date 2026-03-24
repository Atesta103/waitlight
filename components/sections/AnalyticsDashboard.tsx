"use client"

import { useState, useCallback, useMemo, Fragment } from "react"
import { useQuery } from "@tanstack/react-query"
import { useReducedMotion, motion } from "framer-motion"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts"
import { Download, BarChart2 } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { EmptyState } from "@/components/composed/EmptyState"
import { Skeleton } from "@/components/ui/Skeleton"
import { getAnalyticsAction, type AnalyticsRow, type DateRangeInput } from "@/lib/actions/analytics"
import { fadeIn } from "@/lib/utils/motion"

// ─── Date range presets ───────────────────────────────────────────────────────

type RangePreset = {
    label: string
    range: DateRangeInput
}

function buildPresets(): RangePreset[] {
    const now = new Date()
    const startOf = (d: Date) => {
        d.setHours(0, 0, 0, 0)
        return d
    }

    const minus7 = startOf(new Date(now))
    minus7.setDate(minus7.getDate() - 7)

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const minus3m = new Date(now.getFullYear(), now.getMonth() - 3, 1)

    return [
        { label: "7 derniers jours", range: { start: minus7.toISOString(), end: now.toISOString() } },
        { label: "Ce mois", range: { start: startOfMonth.toISOString(), end: now.toISOString() } },
        { label: "3 derniers mois", range: { start: minus3m.toISOString(), end: now.toISOString() } },
        { label: "Tout l'historique", range: { start: null, end: null } },
    ]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DAY_LABELS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]
const DAY_LABELS_FULL = [
    "Dimanche",
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
]
const HOURS = Array.from({ length: 24 }, (_, i) => i)

// Brand primary colour reused for chart fills
const COLOR_PRIMARY = "var(--color-brand-primary)"
const COLOR_MUTED = "var(--color-border-default)"

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
    merchantId: string
    initialData?: AnalyticsRow[]
}

type TooltipPayloadEntry = {
    value: number
    payload: AnalyticsRow & { label: string }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Recharts custom tooltip rendered on bar hover. */
function ChartTooltip({
    active,
    payload,
}: {
    active?: boolean
    payload?: TooltipPayloadEntry[]
}) {
    if (!active || !payload?.length) return null
    const { label, ticket_count, avg_wait_minutes } = payload[0].payload
    return (
        <div
            role="tooltip"
            className="rounded-lg border border-border-default bg-surface-card px-3 py-2 shadow-md text-sm"
        >
            <p className="font-semibold text-text-primary mb-1">{label}</p>
            <p className="text-text-secondary">
                <span className="font-medium text-brand-primary">
                    {ticket_count}
                </span>{" "}
                ticket{ticket_count !== 1 ? "s" : ""}
            </p>
            {avg_wait_minutes != null && (
                <p className="text-text-secondary">
                    Attente moy.{" "}
                    <span className="font-medium text-text-primary">
                        {avg_wait_minutes} min
                    </span>
                </p>
            )}
        </div>
    )
}

// ─── Heatmap ─────────────────────────────────────────────────────────────────

type HeatmapProps = {
    rows: AnalyticsRow[]
    maxCount: number
}

function Heatmap({ rows, maxCount }: HeatmapProps) {
    const lookup = useMemo(() => {
        const map = new Map<string, AnalyticsRow>()
        for (const r of rows) {
            map.set(`${r.day_of_week}-${r.hour}`, r)
        }
        return map
    }, [rows])

    return (
        <div className="overflow-x-auto">
            {/* Accessible table behind the visual grid */}
            <table className="sr-only" aria-label="Heatmap du volume par jour et heure">
                <caption>Nombre de tickets par créneau horaire</caption>
                <thead>
                    <tr>
                        <th scope="col">Heure</th>
                        {DAY_LABELS_FULL.map((d) => (
                            <th key={d} scope="col">
                                {d}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {HOURS.map((h) => (
                        <tr key={h}>
                            <th scope="row">{h}h</th>
                            {DAY_LABELS.map((_, d) => {
                                const cell = lookup.get(`${d}-${h}`)
                                return (
                                    <td key={d}>
                                        {cell
                                            ? `${cell.ticket_count} tickets`
                                            : "0 tickets"}
                                    </td>
                                )
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Visual heatmap */}
            <div
                aria-hidden="true"
                className="min-w-[500px]"
                style={{ display: "grid", gridTemplateColumns: "2.5rem repeat(7, 1fr)", gap: "3px" }}
            >
                {/* Header row */}
                <div />
                {DAY_LABELS.map((d) => (
                    <div
                        key={d}
                        className="text-center text-xs font-medium text-text-secondary pb-1"
                    >
                        {d}
                    </div>
                ))}

                {/* Hour rows */}
                {HOURS.map((h) => (
                    <Fragment key={h}>
                        <div
                            className="flex items-center justify-end pr-1 text-xs text-text-secondary"
                        >
                            {h}h
                        </div>
                        {DAY_LABELS.map((_, d) => {
                            const cell = lookup.get(`${d}-${h}`)
                            const count = cell?.ticket_count ?? 0
                            const intensity =
                                maxCount > 0 ? count / maxCount : 0
                            return (
                                <div
                                    key={`${d}-${h}`}
                                    title={
                                        cell
                                            ? `${DAY_LABELS_FULL[d]} ${h}h — ${count} ticket${count !== 1 ? "s" : ""}${cell.avg_wait_minutes != null ? `, attente moy. ${cell.avg_wait_minutes} min` : ""}`
                                            : `${DAY_LABELS_FULL[d]} ${h}h — 0 ticket`
                                    }
                                    className="rounded-sm h-5 transition-transform hover:scale-110 hover:shadow-sm"
                                    style={{
                                        backgroundColor:
                                            count === 0
                                                ? "var(--color-border-default)"
                                                : `color-mix(in srgb, var(--color-brand-primary) ${Math.round(intensity * 90 + 10)}%, transparent)`,
                                    }}
                                />
                            )
                        })}
                    </Fragment>
                ))}
            </div>
        </div>
    )
}

// ─── Rush Curve ───────────────────────────────────────────────────────────────

type RushCurveProps = {
    rows: AnalyticsRow[]
    selectedDay: number
    maxCount: number
}

function RushCurve({ rows, selectedDay, maxCount }: RushCurveProps) {
    const dayRows = useMemo(() => {
        const byHour = new Map<number, AnalyticsRow>()
        for (const r of rows.filter((r) => r.day_of_week === selectedDay)) {
            byHour.set(r.hour, r)
        }
        // Fill missing hours with 0 so the curve is unbroken
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
    }, [rows, selectedDay])

    return (
        <div>
            {/* Accessible data table */}
            <table className="sr-only" aria-label={`Courbe de rush pour ${DAY_LABELS_FULL[selectedDay]}`}>
                <caption>Volume de tickets par heure</caption>
                <thead>
                    <tr>
                        <th scope="col">Heure</th>
                        <th scope="col">Tickets</th>
                        <th scope="col">Attente moyenne (min)</th>
                    </tr>
                </thead>
                <tbody>
                    {dayRows.map((r) => (
                        <tr key={r.hour}>
                            <th scope="row">{r.hour}h</th>
                            <td>{r.ticket_count}</td>
                            <td>{r.avg_wait_minutes ?? "—"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <ResponsiveContainer width="100%" height={220}>
                <BarChart
                    data={dayRows}
                    margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
                    aria-hidden="true"
                >
                    <XAxis
                        dataKey="hour"
                        tickFormatter={(v) => `${v}h`}
                        tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }}
                        axisLine={false}
                        tickLine={false}
                        domain={[0, maxCount > 0 ? maxCount : 1]}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--color-border-default)", radius: 4 }} />
                    <Bar dataKey="ticket_count" radius={[4, 4, 0, 0]} maxBarSize={32}>
                        {dayRows.map((entry) => (
                            <Cell
                                key={entry.hour}
                                fill={
                                    entry.ticket_count > 0
                                        ? COLOR_PRIMARY
                                        : COLOR_MUTED
                                }
                                fillOpacity={
                                    entry.ticket_count > 0
                                        ? 0.15 + 0.85 * (entry.ticket_count / (maxCount || 1))
                                        : 1
                                }
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

// ─── CSV export ───────────────────────────────────────────────────────────────

function exportCsv(rows: AnalyticsRow[]) {
    // \uFEFF is the UTF-8 BOM, required for Excel to recognize UTF-8 accents automatically.
    // Using semicolon separator is standard for French locales in Excel.
    const header = "jour_semaine;heure;tickets;attente_moy_min\n"
    const body = rows
        .map(
            (r) =>
                `${DAY_LABELS_FULL[r.day_of_week]};${r.hour};${r.ticket_count};${r.avg_wait_minutes ?? ""}`,
        )
        .join("\n")
    const blob = new Blob(["\uFEFF" + header + body], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "analytics-waitlight.csv"
    a.click()
    URL.revokeObjectURL(url)
}

// ─── Main organism ────────────────────────────────────────────────────────────

export function AnalyticsDashboard({ merchantId, initialData }: Props) {
    const prefersReduced = useReducedMotion()
    const [selectedDay, setSelectedDay] = useState(1) // default: Monday
    const [presetIdx, setPresetIdx] = useState(3)     // default: all time

    const PRESETS = useMemo(() => buildPresets(), [])
    const activeRange = PRESETS[presetIdx].range

    const { data: rows = [], isLoading, isError } = useQuery({
        queryKey: ["analytics", merchantId, presetIdx],
        queryFn: async () => {
            const result = await getAnalyticsAction(activeRange)
            if ("error" in result) throw new Error(result.error)
            return result.data
        },
        // Only use SSR initialData for the default "all time" preset
        initialData: presetIdx === 3 && initialData && initialData.length > 0 ? initialData : undefined,
        staleTime: 5 * 60_000,
    })

    const maxCount = useMemo(
        () => Math.max(...rows.map((r) => r.ticket_count), 0),
        [rows],
    )

    const handleExport = useCallback(() => {
        exportCsv(rows)
    }, [rows])

    const wrapperVariants = prefersReduced ? undefined : fadeIn


    return (
        <motion.div
            variants={wrapperVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-6"
        >
            {/* Top bar — always visible */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h2 className="text-lg font-semibold text-text-primary">
                        Analyse du flux
                    </h2>
                    {/* Date range preset selector */}
                    <div
                        role="group"
                        aria-label="Plage de dates"
                        className="mt-2 flex flex-wrap gap-1"
                    >
                        {PRESETS.map((preset, idx) => (
                            <button
                                key={preset.label}
                                type="button"
                                onClick={() => setPresetIdx(idx)}
                                aria-pressed={presetIdx === idx}
                                className={cn(
                                    "rounded-full px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus",
                                    presetIdx === idx
                                        ? "bg-brand-primary text-text-inverse"
                                        : "border border-border-default bg-surface-card text-text-secondary hover:bg-surface-base hover:text-text-primary",
                                )}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="flex items-center gap-1.5 rounded-lg border border-border-default bg-surface-card px-3 py-1.5 text-sm font-medium text-text-secondary hover:bg-surface-base hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus transition-colors"
                        aria-label="Imprimer le tableau de bord"
                    >
                        Imprimer (PDF)
                    </button>
                    <button
                        type="button"
                        onClick={handleExport}
                        disabled={isLoading || rows.length === 0}
                        className="flex items-center gap-1.5 rounded-lg border border-border-default bg-surface-card px-3 py-1.5 text-sm font-medium text-text-secondary hover:bg-surface-base hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus transition-colors disabled:opacity-40 disabled:pointer-events-none"
                        aria-label="Exporter les données pour Excel"
                    >
                        <Download size={14} aria-hidden="true" />
                        Export Excel
                    </button>
                </div>
            </div>

            {/* Summary stat cards — always 4 shells, content swaps */}
            {isLoading ? (
                <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="rounded-xl border border-border-default bg-surface-card p-4">
                            <Skeleton className="h-3 w-24 rounded mb-2" />
                            <Skeleton className="h-7 w-16 rounded" />
                        </div>
                    ))}
                </dl>
            ) : isError ? (
                <div
                    role="alert"
                    className="rounded-xl border border-feedback-error bg-feedback-error-bg px-6 py-4 text-sm text-feedback-error"
                >
                    Impossible de charger les statistiques. Veuillez recharger la page.
                </div>
            ) : rows.length === 0 ? (
                <EmptyState
                    icon={<BarChart2 size={32} />}
                    title="Pas encore de données"
                    description="Les statistiques apparaîtront ici après votre premier service. Revenez demain !"
                />
            ) : (
                <AnalyticsSummary rows={rows} maxCount={maxCount} />
            )}

            {/* Rush curve card — shell always visible */}
            <section
                aria-labelledby="rush-title"
                className="rounded-xl border border-border-default bg-surface-card p-5"
            >
                <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
                    <h3
                        id="rush-title"
                        className="text-sm font-semibold text-text-primary"
                    >
                        Courbe de rush — {DAY_LABELS_FULL[selectedDay]}
                    </h3>

                    <div
                        role="group"
                        aria-label="Sélectionner un jour de la semaine"
                        className="flex gap-1 flex-wrap"
                    >
                        {DAY_LABELS.map((label, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => setSelectedDay(idx)}
                                aria-pressed={selectedDay === idx}
                                className={cn(
                                    "rounded-md px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus",
                                    selectedDay === idx
                                        ? "bg-brand-primary text-text-inverse"
                                        : "border border-border-default bg-surface-base text-text-secondary hover:bg-surface-card hover:text-text-primary",
                                )}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading ? (
                    <Skeleton className="h-[220px] rounded-lg" />
                ) : rows.length > 0 ? (
                    <RushCurve rows={rows} selectedDay={selectedDay} maxCount={maxCount} />
                ) : (
                    <div className="h-[220px] flex items-center justify-center text-sm text-text-secondary">
                        Aucune donnée
                    </div>
                )}
            </section>

            {/* Heatmap card — shell always visible */}
            <section
                aria-labelledby="heatmap-title"
                className="rounded-xl border border-border-default bg-surface-card p-5"
            >
                <h3
                    id="heatmap-title"
                    className="mb-4 text-sm font-semibold text-text-primary"
                >
                    Volume par créneau horaire
                </h3>

                {isLoading ? (
                    <Skeleton className="h-[480px] rounded-lg" />
                ) : rows.length > 0 ? (
                    <>
                        <Heatmap rows={rows} maxCount={maxCount} />
                        <p className="mt-3 text-xs text-text-secondary">
                            Plus la cellule est foncée, plus le créneau est chargé.
                        </p>
                    </>
                ) : (
                    <div className="h-48 flex items-center justify-center text-sm text-text-secondary">
                        Aucune donnée
                    </div>
                )}
            </section>
        </motion.div>
    )
}

// ─── Summary cards ────────────────────────────────────────────────────────────

function AnalyticsSummary({
    rows,
    maxCount,
}: {
    rows: AnalyticsRow[]
    maxCount: number
}) {
    const totalTickets = useMemo(
        () => rows.reduce((acc, r) => acc + r.ticket_count, 0),
        [rows],
    )

    const avgWait = useMemo(() => {
        const withWait = rows.filter((r) => r.avg_wait_minutes != null)
        if (withWait.length === 0) return null
        const total = withWait.reduce(
            (acc, r) => acc + (r.avg_wait_minutes ?? 0),
            0,
        )
        return Math.round(total / withWait.length)
    }, [rows])

    const busiestSlot = useMemo(() => {
        if (rows.length === 0) return null
        const peak = rows.reduce((a, b) =>
            a.ticket_count >= b.ticket_count ? a : b,
        )
        return `${DAY_LABELS_FULL[peak.day_of_week]} ${peak.hour}h`
    }, [rows])

    const stats = [
        {
            label: "Total tickets (historique)",
            value: totalTickets.toLocaleString("fr-FR"),
        },
        {
            label: "Attente moyenne",
            value: avgWait != null ? `${avgWait} min` : "—",
        },
        {
            label: "Créneau le plus chargé",
            value: busiestSlot ?? "—",
        },
        {
            label: "Pic de tickets",
            value: maxCount.toLocaleString("fr-FR"),
        },
    ]

    return (
        <dl
            aria-label="Résumé des statistiques"
            className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
            {stats.map(({ label, value }) => (
                <div
                    key={label}
                    className="rounded-xl border border-border-default bg-surface-card p-4"
                >
                    <dt className="text-xs text-text-secondary">{label}</dt>
                    <dd className="mt-1 text-xl font-semibold text-text-primary">
                        {value}
                    </dd>
                </div>
            ))}
        </dl>
    )
}
