"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, Gamepad2 } from "lucide-react"
import { cn } from "@/lib/utils/cn"

interface GameShellProps {
    title: string
    children: React.ReactNode
    className?: string
}

export function GameShell({ title, children, className }: GameShellProps) {
    const router = useRouter()

    return (
        <div className={cn("h-dvh overflow-hidden bg-surface-base flex flex-col touch-none select-none", className)}>
            {/* Header */}
            <div className="px-4 pt-4 shrink-0">
                <header className="flex items-center gap-3 rounded-xl border border-border-default bg-surface-card px-4 py-3">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface-base transition-colors shrink-0 touch-auto"
                        aria-label="Retour"
                    >
                        <ArrowLeft className="w-5 h-5 text-text-primary" />
                    </button>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-primary">
                        <Gamepad2 size={15} className="text-white" aria-hidden="true" />
                    </span>
                    <h1 className="font-semibold text-text-primary truncate">{title}</h1>
                </header>
            </div>

            {/* Content — flex-1 min-h-0 pour que le jeu occupe tout l'espace restant sans déborder */}
            <main className="flex-1 min-h-0 flex flex-col items-center justify-center p-4">
                {children}
            </main>
        </div>
    )
}
