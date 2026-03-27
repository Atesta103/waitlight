import type { ReactNode } from "react"
import { createClient } from "@/lib/supabase/server"
import { getContrastYIQ, isValidHexCode } from "@/lib/utils/color"

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
        .select("brand_color")
        .eq("slug", slug)
        .single()

    const defaultColor = "#4F46E5"
    let brandColor = merchant?.brand_color || defaultColor
    if (!isValidHexCode(brandColor)) {
        brandColor = defaultColor
    }

    const contrast = getContrastYIQ(brandColor)

    return (
        <main 
            className="flex min-h-dvh flex-col items-center justify-center bg-surface-base px-4 py-8"
            style={{ 
                '--color-brand-primary': brandColor,
                '--color-text-on-primary': contrast === 'white' ? '#FFFFFF' : '#000000',
                // Adding a slightly darker version for hover (this is naive but works for standard UI)
                '--color-brand-primary-hover': brandColor, 
            } as React.CSSProperties}
        >
            <div className="w-full max-w-md">{children}</div>
        </main>
    )
}
