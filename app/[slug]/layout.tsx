import type { ReactNode } from "react"
import { QueryProvider } from "@/components/providers/QueryProvider"

type SlugLayoutProps = {
    children: ReactNode
}

/**
 * Public layout for customer-facing pages (join + wait).
 * No authentication, no nav bar — mobile-first minimal shell.
 */
export default function SlugLayout({ children }: SlugLayoutProps) {
    return (
        <QueryProvider>
            <main className="flex min-h-dvh flex-col items-center justify-center bg-surface-base px-4 py-8">
                <div className="w-full max-w-md">{children}</div>
            </main>
        </QueryProvider>
    )
}
