"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils/cn"

interface GameShellProps {
    title: string
    children: React.ReactNode
    className?: string
}

export function GameShell({ title, children, className }: GameShellProps) {
    const router = useRouter()

    return (
        <div className={cn("min-h-screen bg-surface-base flex flex-col", className)}>
            {/* Header */}
            <header className="flex items-center gap-3 px-4 py-3 bg-surface-card border-b border-border-default">
                <button
                    onClick={() => router.back()}
                    className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-surface-base transition-colors"
                    aria-label="Retour"
                >
                    <ArrowLeft className="w-5 h-5 text-text-primary" />
                </button>
                <h1 className="text-lg font-semibold text-text-primary">{title}</h1>
            </header>

            {/* Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-4">
                {children}
            </main>
        </div>
    )
}
