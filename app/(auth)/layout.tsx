import type { ReactNode } from "react"

type AuthLayoutProps = {
    children: ReactNode
}

/**
 * Shared layout for all pages in the (auth) route group.
 * Centres the card vertically and horizontally on the page,
 * using the `surface-base` page background from the design system.
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="flex h-screen items-center justify-center overflow-hidden bg-surface-base px-4">
            {/* Content card */}
            <div className="w-full max-w-sm rounded-lg border border-border-default bg-surface-card p-8 shadow-sm">
                {children}
            </div>
        </div>
    )
}
