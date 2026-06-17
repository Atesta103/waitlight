"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Heart, ArrowRight } from "lucide-react"
import { BrandLogo } from "@/components/ui/BrandLogo"

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

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
        { label: "Contact & Support", href: "/contact" },
        { label: "Se connecter", href: "/login" },
    ],
}

export function MarketingFooter() {
    const currentYear = new Date().getFullYear()

    return (
        <footer>
            {/* CTA Banner — dark */}
            <div className="bg-[#111827] overflow-hidden">
                <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
                    <motion.div
                        className="flex flex-col md:flex-row items-center justify-between gap-10"
                        initial={{ opacity: 0, y: 36 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.7, ease: EASE }}
                    >
                        <div className="text-center md:text-left">
                            <p className="text-[#6366F1] text-xs font-semibold uppercase tracking-widest mb-3">
                                Prêt à commencer ?
                            </p>
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.05]">
                                Transformez l&apos;attente
                                <br />
                                <span className="text-[#6366F1]">en avantage.</span>
                            </h2>
                            <p className="mt-4 text-white/50 text-sm md:text-base max-w-sm">
                                14 jours gratuits. Sans engagement. Configuration en 2 minutes.
                            </p>
                        </div>

                        <motion.div whileTap={{ scale: 0.97 }} className="flex-shrink-0">
                            <Link
                                href="/login"
                                id="footer-cta"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#6366F1] text-white font-bold text-sm hover:bg-[#4F46E5] hover:shadow-[0_0_32px_rgba(99,102,241,0.5)] transition-all duration-200"
                            >
                                Démarrer gratuitement
                                <ArrowRight size={16} aria-hidden="true" />
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* Footer content */}
            <div className="bg-[#F8F9FA] border-t border-[#E5E7EB]">
                <div className="max-w-6xl mx-auto px-6 py-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                        {/* Brand column */}
                        <div className="col-span-2 md:col-span-1">
                            <BrandLogo className="mb-3" />
                            <p className="text-sm text-[#374151] leading-relaxed">
                                La file d&apos;attente digitale pensée pour les commerces modernes.
                            </p>
                            <p className="mt-3 text-xs text-[#9CA3AF]">
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
                                        <a href={link.href} className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors duration-150">
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
                                        <a href={link.href} className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors duration-150">
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
                                        <a href={link.href} className="text-sm text-[#6B7280] hover:text-[#111827] transition-colors duration-150">
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="border-t border-[#E5E7EB] pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#9CA3AF]">
                        <span>© {currentYear} WaitLight. Tous droits réservés.</span>
                        <span className="flex items-center gap-1">
                            Fait avec
                            <Heart size={11} className="text-[#EF4444] fill-[#EF4444]" aria-label="amour" />
                            en France
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
