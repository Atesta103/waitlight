import Link from "next/link"
import { Heart } from "lucide-react"

const FOOTER_LINKS = {
    product: [
        { label: "Fonctionnalités", href: "#fonctionnalites" },
        { label: "Secteurs", href: "#secteurs" },
        { label: "Tarifs", href: "#tarifs" },
        { label: "Comment ça marche", href: "#comment-ca-marche" },
        { label: "FAQ", href: "#faq" },
    ],
    legal: [
        { label: "Conditions générales", href: "/legal/cgu" },
        { label: "Politique de confidentialité", href: "/legal/privacy" },
        { label: "Mentions légales", href: "/legal/mentions" },
    ],
    company: [
        { label: "À propos", href: "/about" },
        { label: "Contact", href: "mailto:contact@waitlight.fr" },
        { label: "Se connecter", href: "/login" },
    ],
}

/**
 * Marketing footer with legal links, product links, and CTA banner.
 * Pure Server Component.
 */
export function MarketingFooter() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-[#F8F9FA] border-t border-[#E5E7EB]">
            {/* CTA Banner */}
            <div className="bg-[#6366F1]">
                <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                            Prêt à transformer l&apos;attente ?
                        </h2>
                        <p className="mt-2 text-white/80 text-sm">
                            14 jours gratuits. Aucune carte bancaire. Configuration en 2 minutes.
                        </p>
                    </div>
                    <Link
                        href="/login"
                        id="footer-cta"
                        className="
                            flex-shrink-0 inline-flex items-center justify-center
                            px-8 py-4 rounded-xl
                            bg-white text-[#4F46E5] font-bold text-sm
                            hover:bg-white/90
                            transition-colors duration-150
                        "
                    >
                        Démarrer gratuitement →
                    </Link>
                </div>
            </div>

            {/* Footer content */}
            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    {/* Brand column */}
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2 font-bold text-lg tracking-tight text-[#111827] mb-3">
                            <span
                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#6366F1] text-white text-sm font-black"
                                aria-hidden="true"
                            >
                                W
                            </span>
                            Wait-Light
                        </div>
                        <p className="text-sm text-[#374151] leading-relaxed">
                            La file d&apos;attente digitale pensée pour les commerces modernes.
                        </p>
                        <p className="mt-3 text-xs text-[#6B7280]">
                            29 €/mois · 14 jours gratuits
                        </p>
                    </div>

                    {/* Product links */}
                    <div>
                        <h3 className="text-xs font-semibold text-[#111827] uppercase tracking-wider mb-4">
                            Produit
                        </h3>
                        <ul className="space-y-2.5">
                            {FOOTER_LINKS.product.map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        className="text-sm text-[#374151] hover:text-[#111827] transition-colors duration-150"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company links */}
                    <div>
                        <h3 className="text-xs font-semibold text-[#111827] uppercase tracking-wider mb-4">
                            Société
                        </h3>
                        <ul className="space-y-2.5">
                            {FOOTER_LINKS.company.map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        className="text-sm text-[#374151] hover:text-[#111827] transition-colors duration-150"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal links */}
                    <div>
                        <h3 className="text-xs font-semibold text-[#111827] uppercase tracking-wider mb-4">
                            Légal
                        </h3>
                        <ul className="space-y-2.5">
                            {FOOTER_LINKS.legal.map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        className="text-sm text-[#374151] hover:text-[#111827] transition-colors duration-150"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-[#E5E7EB] pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#6B7280]">
                    <span>© {currentYear} Wait-Light. Tous droits réservés.</span>
                    <span className="flex items-center gap-1">
                        Fait avec
                        <Heart
                            size={12}
                            className="text-[#EF4444] fill-[#EF4444]"
                            aria-label="amour"
                        />
                        en France
                    </span>
                </div>
            </div>
        </footer>
    )
}
