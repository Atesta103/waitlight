import Link from "next/link"
import type { ReactNode } from "react"

export default function LegalLayout({ children }: { children: ReactNode }) {
    return (
        <div className="light min-h-screen bg-[#F8F9FA] text-[#111827]">
            {/* Minimal top bar */}
            <header className="border-b border-[#E5E7EB] bg-white">
                <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
                    <Link
                        href="/"
                        className="flex items-center gap-2 font-bold text-sm tracking-tight text-[#111827]"
                    >
                        <span
                            className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#6366F1] text-white text-xs font-black"
                            aria-hidden="true"
                        >
                            W
                        </span>
                        Wait-Light
                    </Link>
                    <Link
                        href="/"
                        className="text-sm text-[#374151] hover:text-[#111827] transition-colors"
                    >
                        ← Retour au site
                    </Link>
                </div>
            </header>

            {/* Page content */}
            <main className="max-w-3xl mx-auto px-6 py-16">
                {children}
            </main>

            {/* Minimal footer */}
            <footer className="border-t border-[#E5E7EB] py-6 mt-8">
                <div className="max-w-3xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#6B7280]">
                    <span>© {new Date().getFullYear()} Wait-Light. Tous droits réservés.</span>
                    <nav className="flex items-center gap-4" aria-label="Liens légaux">
                        <Link href="/legal/cgu" className="hover:text-[#111827] transition-colors">CGU</Link>
                        <Link href="/legal/privacy" className="hover:text-[#111827] transition-colors">Confidentialité</Link>
                        <Link href="/legal/mentions" className="hover:text-[#111827] transition-colors">Mentions légales</Link>
                    </nav>
                </div>
            </footer>
        </div>
    )
}
