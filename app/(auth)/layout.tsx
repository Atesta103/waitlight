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
        <div className="flex min-h-screen items-center justify-center overflow-y-auto bg-surface-base px-4 py-8">
            {/* Content card */}
            <div className="my-auto w-full bg-surface-card px-4 py-5 sm:max-w-md sm:rounded-lg sm:border sm:border-border-default sm:px-8 sm:py-5 sm:shadow-sm">
                {children}
            </div>
        </div>
    )
}
