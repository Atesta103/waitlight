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
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-x-hidden bg-surface-base px-4 py-8">
            {/* Center Glow Background */}
            <div
                className="pointer-events-none absolute inset-0 z-0 opacity-20"
                style={{
                    backgroundImage: `radial-gradient(circle at center, var(--color-brand-primary), transparent 60%)`,
                }}
            />

            {/* Header / Brand */}
            <div className="relative z-10 mb-8 flex flex-col items-center text-center">
                <h1 className="mb-2 text-4xl font-bold tracking-tight text-brand-primary md:text-5xl">
                    WaitLight
                </h1>
                <p className="max-w-xs text-lg font-medium text-brand-primary opacity-80 md:max-w-sm md:text-xl">
                    Gérez votre file d&apos;attente sans effort
                </p>
            </div>

            {/* Content card */}
            <div className="relative z-10 w-full bg-surface-card px-4 py-5 shadow-sm sm:max-w-md sm:rounded-lg sm:border sm:border-border-default sm:px-8 sm:shadow-lg">
                {children}
            </div>
        </div>
    )
}
