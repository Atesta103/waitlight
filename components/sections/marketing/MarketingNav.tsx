"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, Menu, X } from "lucide-react"
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
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const closeMenu = () => {
        setIsMenuOpen(false)
    }

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 16)
        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <>
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
                <Link
                    href="/"
                    onClick={(e) => {
                        if (window.location.pathname === "/") {
                            e.preventDefault()
                            window.scrollTo({ top: 0, behavior: "smooth" })
                        }
                    }}
                    className="flex items-center gap-2 font-bold text-lg tracking-tight text-[#111827]"
                >
                    <span
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#6366F1] text-white text-sm font-black"
                        aria-hidden="true"
                    >
                        W
                    </span>
                    Wait-Light
                </Link>

                <button
                    type="button"
                    aria-label="Ouvrir le menu"
                    aria-expanded={isMenuOpen}
                    onClick={() => setIsMenuOpen((prev) => !prev)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#D1D5DB] bg-white/75 text-[#111827] transition-colors hover:bg-white"
                >
                    {isMenuOpen ? <X size={17} aria-hidden="true" /> : <Menu size={17} aria-hidden="true" />}
                </button>
            </nav>
            </header>

            <AnimatePresence>
                {isMenuOpen && (
                    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            type="button"
                            aria-label="Fermer le menu"
                            className="absolute inset-0 bg-black/45 cursor-default block w-full h-full"
                            onClick={closeMenu}
                        />

                        <motion.aside
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                            className="absolute right-0 top-0 h-full w-full max-w-sm border-l border-border-default bg-white p-6 shadow-xl"
                        >
                        <div className="flex items-center justify-between">
                            <p className="text-lg font-bold tracking-tight text-[#111827]">Wait-Light</p>
                            <button
                                type="button"
                                aria-label="Fermer"
                                onClick={closeMenu}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#D1D5DB] text-[#111827] hover:bg-[#F3F4F6]"
                            >
                                <X size={16} aria-hidden="true" />
                            </button>
                        </div>

                        <nav className="mt-8 space-y-1">
                            {NAV_LINKS.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    onClick={closeMenu}
                                    className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium text-[#111827] transition-colors hover:bg-[#F3F4F6]"
                                >
                                    {link.label}
                                    <ChevronRight size={15} aria-hidden="true" className="text-[#6B7280]" />
                                </a>
                            ))}
                        </nav>

                        <div className="mt-8 grid gap-3">
                            <Link
                                href="/login"
                                onClick={closeMenu}
                                className="inline-flex h-11 items-center justify-center rounded-xl bg-[#6366F1] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#4F46E5]"
                            >
                                Se connecter
                            </Link>
                            <Link
                                href="/register"
                                onClick={closeMenu}
                                className="inline-flex h-11 items-center justify-center rounded-xl border border-[#D1D5DB] bg-white px-4 text-sm font-semibold text-[#111827] transition-colors hover:bg-[#F3F4F6]"
                            >
                                Demarrer
                            </Link>
                        </div>

                        <div className="mt-6 border-t border-border-default pt-5">
                            <Link
                                href="/contact"
                                onClick={closeMenu}
                                className="text-sm font-medium text-[#374151] hover:text-[#111827]"
                            >
                                Contact & support
                            </Link>
                        </div>
                    </motion.aside>
                </div>
                )}
            </AnimatePresence>
        </>
    )
}
