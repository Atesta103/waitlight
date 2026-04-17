"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils/cn"

const NAV_LINKS = [
    { href: "#fonctionnalites", label: "Fonctionnalités" },
    { href: "#secteurs", label: "Secteurs" },
    { href: "#tarifs", label: "Tarifs" },
    { href: "#faq", label: "FAQ" },
]

/**
 * Sticky marketing navigation bar.
 * Transparent on top, white/blur when scrolled.
 */
export function MarketingNav() {
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 16)
        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                scrolled
                    ? "bg-white/80 backdrop-blur-xl border-b border-border-default shadow-sm"
                    : "bg-transparent"
            )}
        >
            <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight text-[#111827]">
                    <span
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#6366F1] text-white text-sm font-black"
                        aria-hidden="true"
                    >
                        W
                    </span>
                    Wait-Light
                </Link>

                {/* Centre links */}
                <ul className="hidden md:flex items-center gap-8">
                    {NAV_LINKS.map((link) => (
                        <li key={link.href}>
                            <a
                                href={link.href}
                                className="text-sm font-medium text-[#374151] hover:text-[#111827] transition-colors duration-150"
                            >
                                {link.label}
                            </a>
                        </li>
                    ))}
                </ul>

                {/* Right CTA — single button */}
                <Link
                    href="/login"
                    id="nav-cta"
                    className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#6366F1] text-white text-sm font-semibold hover:bg-[#4F46E5] transition-colors duration-150"
                >
                    Se connecter
                </Link>
            </nav>
        </header>
    )
}
