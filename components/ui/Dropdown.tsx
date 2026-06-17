"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils/cn"

type DropdownItem = {
    label: string
    icon?: React.ReactNode
    onClick: () => void
    variant?: "default" | "destructive"
    disabled?: boolean
}

type DropdownProps = {
    trigger: React.ReactNode
    items: DropdownItem[]
    align?: "left" | "right"
    side?: "top" | "bottom"
    className?: string
}

function Dropdown({
    trigger,
    items,
    align = "right",
    side = "bottom",
    className,
}: DropdownProps) {
    const [open, setOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!open) return

        const handleClickOutside = (e: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                setOpen(false)
            }
        }

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false)
        }

        document.addEventListener("mousedown", handleClickOutside)
        document.addEventListener("keydown", handleEscape)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
            document.removeEventListener("keydown", handleEscape)
        }
    }, [open])

    return (
        <div
            ref={containerRef}
            className={cn("relative inline-block", className)}
        >
            <div
                role="button"
                tabIndex={0}
                onClick={() => setOpen((prev) => !prev)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        setOpen((prev) => !prev)
                    }
                }}
                aria-expanded={open}
                aria-haspopup="menu"
                className="cursor-pointer"
            >
                {trigger}
            </div>

            {open ? (
                <div
                    role="menu"
                    className={cn(
                        "absolute z-50 min-w-[180px] overflow-hidden rounded-lg border border-border-default bg-surface-card py-1 shadow-lg",
                        side === "bottom" ? "top-full mt-1" : "bottom-full mb-1",
                        align === "right" ? "right-0" : "left-0",
                    )}
                >
                    {items.map((item, index) => (
                        <button
                            key={index}
                            role="menuitem"
                            type="button"
                            disabled={item.disabled}
                            onClick={() => {
                                item.onClick()
                                setOpen(false)
                            }}
                            className={cn(
                                "flex w-full min-h-11 cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors",
                                "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-border-focus focus-visible:outline-none",
                                "disabled:pointer-events-none disabled:opacity-50",
                                item.variant === "destructive"
                                    ? "text-feedback-error hover:bg-feedback-error-bg"
                                    : "text-text-primary hover:bg-surface-base",
                            )}
                        >
                            {item.icon ? (
                                <span aria-hidden="true">{item.icon}</span>
                            ) : null}
                            {item.label}
                        </button>
                    ))}
                </div>
            ) : null}
        </div>
    )
}

export { Dropdown, type DropdownProps, type DropdownItem }
