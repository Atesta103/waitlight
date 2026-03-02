import type { ReactNode } from "react"
import { Inter, Outfit, Sora, Merriweather } from "next/font/google"

/* Pre-load all font options so the ThemePicker previews render correctly */
const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
})
const outfit = Outfit({
    subsets: ["latin"],
    variable: "--font-outfit",
    display: "swap",
})
const sora = Sora({
    subsets: ["latin"],
    variable: "--font-sora",
    display: "swap",
})
const merriweather = Merriweather({
    subsets: ["latin"],
    weight: ["400", "700"],
    variable: "--font-merriweather",
    display: "swap",
})

export default function DesignSystemLayout({
    children,
}: {
    children: ReactNode
}) {
    return (
        <div
            className={`${inter.variable} ${outfit.variable} ${sora.variable} ${merriweather.variable}`}
        >
            {children}
        </div>
    )
}
