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
        <div className="flex min-h-screen flex-col items-center justify-center bg-surface-base px-4 py-12">
            {/* Brand mark */}
            <div className="mb-8 flex flex-col items-center gap-2">
                <span
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-primary text-lg font-bold text-text-inverse select-none"
                    aria-hidden="true"
                >
                    W
                </span>
                <span className="text-xl font-bold tracking-tight text-text-primary">
                    Wait-Light
                </span>
            </div>

            {/* Content card */}
            <div className="w-full max-w-sm rounded-lg border border-border-default bg-surface-card p-8 shadow-sm">
                {children}
            </div>
        </div>
    )
}
