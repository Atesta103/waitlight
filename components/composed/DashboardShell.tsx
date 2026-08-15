"use client"

import { usePathname } from "next/navigation"
import type { CSSProperties, ReactNode } from "react"
import { cn } from "@/lib/utils/cn"

type DashboardShellProps = {
    header: ReactNode
    children: ReactNode
    style: CSSProperties
}

/**
 * Client wrapper so the shell can vary by route: every dashboard page except
 * Analytics uses a fixed-height, non-scrolling shell (each page owns its own
 * internal scroll region — queue list, QR panel, etc. — so only that content
 * scrolls, never the whole page). Analytics is the one exception: its charts
 * read better with real page scroll and the header staying pinned by its own
 * fixed/sticky positioning, rather than a nested scroll container.
 */
export function DashboardShell({ header, children, style }: DashboardShellProps) {
    const pathname = usePathname()
    const isAnalytics = pathname?.startsWith("/analytics") ?? false

    return (
        <div
            id="dashboard-root"
            className={cn(
                "flex flex-col bg-surface-base",
                isAnalytics ? "min-h-dvh" : "h-dvh overflow-hidden",
            )}
            style={style}
        >
            {header}
            <main
                className={cn(
                    "mx-auto flex min-w-0 w-full max-w-6xl flex-1 flex-col px-4 py-4 pb-28 md:pb-4",
                    isAnalytics ? "" : "min-h-0 overflow-x-visible",
                )}
            >
                {children}
            </main>
        </div>
    )
}
