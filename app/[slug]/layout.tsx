import type { ReactNode } from "react"

type SlugLayoutProps = {
    children: ReactNode
}

/**
 * Public layout for customer-facing pages (join + wait).
 * No authentication, no nav bar — mobile-first minimal shell.
 */
export default function SlugLayout({ children }: SlugLayoutProps) {
    return (
        <main className="flex min-h-dvh flex-col items-center bg-surface-base px-4 py-8">
            <div className="w-full max-w-md">{children}</div>
        </main>
    )
}
