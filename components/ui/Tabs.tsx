"use client"

import { useState } from "react"
import { cn } from "@/lib/utils/cn"

type TabItem = {
    value: string
    label: string
    icon?: React.ReactNode
}

type TabsProps = {
    tabs: TabItem[]
    defaultValue?: string
    value?: string
    onChange?: (value: string) => void
    className?: string
}

function Tabs({ tabs, defaultValue, value, onChange, className }: TabsProps) {
    const [internalValue, setInternalValue] = useState(
        defaultValue ?? tabs[0]?.value ?? "",
    )
    const activeValue = value ?? internalValue

    const handleChange = (tab: string) => {
        if (!value) setInternalValue(tab)
        onChange?.(tab)
    }

    return (
        <div
            role="tablist"
            className={cn(
                "flex gap-1 rounded-lg border border-border-default bg-surface-base p-1",
                className,
            )}
        >
            {tabs.map((tab) => {
                const isActive = activeValue === tab.value
                return (
                    <button
                        key={tab.value}
                        role="tab"
                        type="button"
                        aria-selected={isActive}
                        onClick={() => handleChange(tab.value)}
                        className={cn(
                            "inline-flex min-h-9 min-w-9 flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                            "focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:outline-none",
                            isActive
                                ? "bg-surface-card text-text-primary shadow-sm"
                                : "text-text-secondary hover:text-text-primary",
                        )}
                    >
                        {tab.icon ? (
                            <span aria-hidden="true">{tab.icon}</span>
                        ) : null}
                        {tab.label}
                    </button>
                )
            })}
        </div>
    )
}

export { Tabs, type TabsProps, type TabItem }
