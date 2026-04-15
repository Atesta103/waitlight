"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Sun, Moon, Monitor } from "lucide-react"
import { cn } from "@/lib/utils/cn"

export function ThemeSwitcher() {
    const [mounted, setMounted] = useState(false)
    const { theme, setTheme } = useTheme()

    // Pour éviter l'erreur d'hydratation Next.js
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true)
    }, [])

    if (!mounted) {
        return <div className="h-10 w-full animate-pulse rounded-md bg-surface-base border border-border-default" />
    }

    const options = [
        { value: "light", label: "Clair", icon: Sun },
        { value: "dark", label: "Sombre", icon: Moon },
        { value: "system", label: "Système", icon: Monitor },
    ]

    return (
        <div className="flex w-full items-center rounded-md border border-border-default bg-surface-base p-1">
            {options.map(({ value, label, icon: Icon }) => {
                const isActive = theme === value
                return (
                    <button
                        key={value}
                        type="button" // Previens la soumission de formulaire par défaut
                        onClick={() => setTheme(value)}
                        className={cn(
                            "flex flex-1 items-center justify-center gap-2 rounded-sm px-2 py-1.5 text-xs font-medium transition-colors",
                            isActive 
                                ? "bg-surface-card text-text-primary shadow-sm border border-border-default" 
                                : "text-text-secondary hover:text-text-primary transparent border border-transparent"
                        )}
                        aria-pressed={isActive}
                    >
                        <Icon size={14} aria-hidden="true" />
                        <span className="hidden sm:inline-block">{label}</span>
                    </button>
                )
            })}
        </div>
    )
}
