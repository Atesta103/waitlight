"use client"

import Link from "next/link"
import { ChevronRight, Menu, X } from "lucide-react"
import { useState } from "react"

type MarketingTopbarProps = {
    links: Array<{
        href: string
        label: string
    }>
}

export function MarketingTopbar({ links }: MarketingTopbarProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const closeMenu = () => {
        setIsMenuOpen(false)
    }

    return (
        <header className="sticky top-0 z-50 border-b border-border-default bg-surface-card/90 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-20 lg:px-8">
                <Link
                    href="#hero"
                    className="text-lg font-semibold tracking-tight text-text-primary font-[var(--font-poppins)]"
                >
                    Wait-Light
                </Link>

                <button
                    type="button"
                    aria-label="Ouvrir le menu"
                    aria-expanded={isMenuOpen}
                    onClick={() => setIsMenuOpen((prev) => !prev)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-default text-text-primary transition-colors hover:bg-border-default/60"
                >
                    {isMenuOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
                </button>
            </div>

            {isMenuOpen ? (
                <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
                    <button
                        type="button"
                        aria-label="Fermer le menu"
                        className="absolute inset-0 bg-surface-overlay"
                        onClick={closeMenu}
                    />

                    <aside className="absolute right-0 top-0 h-full w-full max-w-md border-l border-border-default bg-surface-card p-6 shadow-xl">
                        <div className="flex items-center justify-between">
                            <p className="text-lg font-semibold tracking-tight text-text-primary font-[var(--font-poppins)]">
                                Wait-Light
                            </p>
                            <button
                                type="button"
                                aria-label="Fermer"
                                onClick={closeMenu}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border-default text-text-primary transition-colors hover:bg-border-default/60"
                            >
                                <X size={16} aria-hidden="true" />
                            </button>
                        </div>

                        <nav className="mt-8 space-y-1">
                            {links.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={closeMenu}
                                    className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-border-default/60"
                                >
                                    {link.label}
                                    <ChevronRight size={16} aria-hidden="true" className="text-text-secondary" />
                                </Link>
                            ))}
                        </nav>

                        <div className="mt-8 grid gap-3">
                            <Link
                                href="/register"
                                onClick={closeMenu}
                                className="inline-flex h-11 w-full items-center justify-center rounded-md bg-brand-primary px-4 text-sm font-medium text-text-on-primary transition-colors hover:bg-brand-primary-hover"
                            >
                                Créer mon compte
                            </Link>
                            <Link
                                href="/login"
                                onClick={closeMenu}
                                className="inline-flex h-11 w-full items-center justify-center rounded-md border border-border-default bg-surface-base px-4 text-sm font-medium text-text-primary transition-colors hover:bg-border-default/70"
                            >
                                Connexion
                            </Link>
                        </div>

                        <div className="mt-6 border-t border-border-default pt-5">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <a
                                    href="mailto:contact@waitlight.fr"
                                    className="rounded-lg border border-border-default px-3 py-2 text-center text-text-secondary transition-colors hover:bg-border-default/60 hover:text-text-primary"
                                >
                                    Contact
                                </a>
                                <Link
                                    href="#cta-final"
                                    onClick={closeMenu}
                                    className="rounded-lg border border-border-default px-3 py-2 text-center text-text-secondary transition-colors hover:bg-border-default/60 hover:text-text-primary"
                                >
                                    À propos
                                </Link>
                            </div>
                        </div>
                    </aside>
                </div>
            ) : null}
        </header>
    )
}
