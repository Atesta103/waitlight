"use client"

import { useState } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/Card"
import { Tabs } from "@/components/ui/Tabs"
import { StatCard } from "@/components/composed/StatCard"
import { cn } from "@/lib/utils/cn"
import {
    Users,
    Clock,
    BarChart3,
    TrendingUp,
    UserX,
    CalendarDays,
} from "lucide-react"

type HourlyData = {
    hour: string
    count: number
}

type StatsPanelProps = {
    servedToday: number
    servedTrend: string
    avgWaitMinutes: number
    avgWaitTrend: string
    abandonRate: number
    abandonTrend: string
    peakHour: string
    hourlyData: HourlyData[]
    className?: string
}

function StatsPanel({
    servedToday,
    servedTrend,
    avgWaitMinutes,
    avgWaitTrend,
    abandonRate,
    abandonTrend,
    peakHour,
    hourlyData,
    className,
}: StatsPanelProps) {
    const [period, setPeriod] = useState("today")

    const maxCount = Math.max(...hourlyData.map((d) => d.count), 1)

    return (
        <div className={cn("flex flex-col gap-6", className)}>
            {/* Period selector */}
            <Tabs
                tabs={[
                    { value: "today", label: "Aujourd'hui" },
                    { value: "week", label: "Cette semaine" },
                    { value: "month", label: "Ce mois" },
                ]}
                value={period}
                onChange={setPeriod}
            />

            {/* KPIs */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    label="Clients servis"
                    value={servedToday}
                    trend="up"
                    trendLabel={servedTrend}
                    icon={<Users size={20} />}
                />
                <StatCard
                    label="Temps moyen"
                    value={`${avgWaitMinutes} min`}
                    trend="down"
                    trendLabel={avgWaitTrend}
                    icon={<Clock size={20} />}
                />
                <StatCard
                    label="Taux d'abandon"
                    value={`${abandonRate}%`}
                    trend={abandonRate > 10 ? "up" : "neutral"}
                    trendLabel={abandonTrend}
                    icon={<UserX size={20} />}
                />
                <StatCard
                    label="Pic de fréquentation"
                    value={peakHour}
                    trend="neutral"
                    trendLabel="Heure la plus chargée"
                    icon={<TrendingUp size={20} />}
                />
            </div>

            {/* Hourly chart */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <BarChart3
                            size={18}
                            className="text-text-secondary"
                            aria-hidden="true"
                        />
                        <span className="font-medium text-text-primary">
                            Fréquentation par heure
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                        <CalendarDays size={14} aria-hidden="true" />
                        <span>
                            {period === "today"
                                ? "Aujourd'hui"
                                : period === "week"
                                  ? "7 derniers jours"
                                  : "30 derniers jours"}
                        </span>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Simple bar chart */}
                    <div
                        className="flex items-end gap-1"
                        role="img"
                        aria-label="Graphique de fréquentation par heure"
                    >
                        {hourlyData.map((d) => {
                            const height = (d.count / maxCount) * 120
                            return (
                                <div
                                    key={d.hour}
                                    className="flex flex-1 flex-col items-center gap-1"
                                >
                                    <span className="text-xs text-text-secondary">
                                        {d.count > 0 ? d.count : ""}
                                    </span>
                                    <div
                                        className={cn(
                                            "w-full rounded-t-sm bg-brand-primary/70 transition-all hover:bg-brand-primary",
                                            d.count === 0 &&
                                                "bg-border-default hover:bg-border-default",
                                        )}
                                        style={{
                                            height: `${Math.max(4, height)}px`,
                                        }}
                                    />
                                    <span className="text-[10px] text-text-secondary">
                                        {d.hour}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export { StatsPanel, type StatsPanelProps, type HourlyData }
