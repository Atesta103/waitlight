import type { ReactNode } from "react"
import { createClient } from "@/lib/supabase/server"
import { getContrastYIQ, isValidHexCode } from "@/lib/utils/color"
import { QueryProvider } from "@/components/providers/QueryProvider"

type SlugLayoutProps = {
    children: ReactNode
    params: Promise<{ slug: string }>
}

/**
 * Public layout for customer-facing pages (join + wait).
 * No authentication, no nav bar — mobile-first minimal shell.
 */
export default async function SlugLayout({ children, params }: SlugLayoutProps) {
    const { slug } = await params
    const supabase = await createClient()

    const { data: merchant } = await supabase
        .from("merchants")
        .select("brand_color, font_family, border_radius, theme_pattern")
        .eq("slug", slug)
        .single()

    const defaultColor = "#4F46E5"
    let brandColor = merchant?.brand_color || defaultColor
    if (!isValidHexCode(brandColor)) {
        brandColor = defaultColor
    }

    const contrast = getContrastYIQ(brandColor)
    const fontFamily = merchant?.font_family || "Inter"
    const borderRadius = merchant?.border_radius || "0.5rem"
    const pattern = merchant?.theme_pattern || "none"

    return (
        <QueryProvider>
            <main 
                className="flex min-h-dvh flex-col items-center justify-center bg-surface-base px-4 py-8 relative overflow-hidden"
                style={{ 
                    fontFamily: `var(--font-brand)`,
                    '--color-brand-primary': brandColor,
                    '--color-text-on-primary': contrast === 'white' ? '#FFFFFF' : '#000000',
                    // Adding a slightly darker version for hover (this is naive but works for standard UI)
                    '--color-brand-primary-hover': brandColor,
                    '--font-brand': `var(--font-${fontFamily.toLowerCase().replace(" ", "-")})`,
                    '--radius-brand': borderRadius,
                    '--radius-sm': borderRadius,
                    '--radius-md': borderRadius,
                    '--radius-lg': borderRadius,
                    '--radius-xl': borderRadius,
                    '--radius-2xl": borderRadius,
                } as React.CSSProperties}
            >
                {/* Base Color Tint */}
                <div 
                    className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
                    style={{ backgroundColor: 'var(--color-brand-primary)' }}
                />

                {/* Background patterns */}
                {pattern === "dots" && (
                    <div 
                        className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
                        style={{ backgroundImage: "radial-gradient(var(--color-text-primary) 1px, transparent 1px)", backgroundSize: "24px 24px" }}
                    />
                )}
                {pattern === "grid" && (
                    <div 
                        className="fixed inset-0 z-0 pointer-events-none opacity-[0.02] dark:opacity-[0.04]"
                        style={{ backgroundImage: "linear-gradient(var(--color-text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-text-primary) 1px, transparent 1px)", backgroundSize: "32px 32px" }}
                    />
                )}
                {pattern === "glow" && (
                    <div 
                        className="fixed inset-0 z-0 pointer-events-none opacity-[0.10] dark:opacity-[0.15]"
                        style={{ background: `radial-gradient(circle at 50% 0%, var(--color-brand-primary), transparent 60%)` }}
                    />
                )}
                
                {/* Thematic Icon Patterns */}
                {pattern.startsWith("food_") && (
                    <svg className="fixed inset-0 z-0 pointer-events-none w-full h-full opacity-[0.03] dark:opacity-[0.05] text-text-primary" aria-hidden="true">
                        <defs>
                            <pattern id={`theme-motif-${pattern}`} x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                                {pattern === "food_burger" && (
                                    <g transform="translate(26, 26) scale(1.4)">
                                        <path fill="currentColor" d="M18.06 6.81C16.91 4.54 14.61 3 12 3S7.09 4.54 5.94 6.81C5.66 7.55 6.22 8.33 7.02 8.33h9.96c.8 0 1.36-.78 1.08-1.52zM4 11h16v2H4zm1 3h14v1.5c0 1.93-1.57 3.5-3.5 3.5h-7C6.57 19 5 17.43 5 15.5V14z" />
                                    </g>
                                )}
                                {pattern === "food_pizza" && (
                                    <g transform="translate(26, 26) scale(1.4)">
                                        <path fill="currentColor" d="m12 14-1 1" />
                                        <path fill="currentColor" d="m13.75 18.25-1.25 1.42" />
                                        <path fill="currentColor" d="M17.775 5.654a15.68 15.68 0 0 0-12.121 12.12" />
                                        <path fill="currentColor" d="M18.8 9.3a1 1 0 0 0 2.1 7.7" />
                                        <path fill="currentColor" d="M21.964 20.732a1 1 0 0 1-1.232 1.232l-18-5a1 1 0 0 1-.695-1.232A19.68 19.68 0 0 1 15.732 2.037a1 1 0 0 1 1.232.695z" />
                                    </g>
                                )}
                                {pattern === "food_coffee" && (
                                    <g transform="translate(26, 26) scale(1.4)">
                                        <path fill="currentColor" d="M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.9 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3zM4 19h16v2H4z" />
                                    </g>
                                )}
                                {pattern === "food_cutlery" && (
                                    <g transform="translate(26, 26) scale(1.4)">
                                        <path fill="currentColor" d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.86 3.75 3.97V22h2.5v-9.03C11.34 12.86 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" />
                                    </g>
                                )}
                            </pattern>
                        </defs>
                        <rect x="0" y="0" width="100%" height="100%" fill={`url(#theme-motif-${pattern})`} />
                    </svg>
                )}

                <div className="w-full max-w-md relative z-10">{children}</div>
            </main>
        </QueryProvider>
    )
}
