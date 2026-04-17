import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Mentions Légales — Wait-Light",
    description: "Mentions légales du service Wait-Light, logiciel de file d'attente digitale.",
}

export default function MentionsPage() {
    const lastUpdated = "17 avril 2026"

    return (
        <article>
            <header className="mb-10 pb-8 border-b border-[#E5E7EB]">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#6366F1] mb-2">Légal</p>
                <h1 className="text-3xl md:text-4xl font-black text-[#111827] tracking-tight mb-3">
                    Mentions Légales
                </h1>
                <p className="text-sm text-[#6B7280]">Dernière mise à jour : {lastUpdated}</p>
            </header>

            <div className="space-y-10 text-[#374151] text-sm leading-7">

                <section>
                    <h2 className="text-lg font-bold text-[#111827] mb-4">1. Éditeur du site</h2>
                    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 space-y-2">
                        <div className="grid grid-cols-[140px_1fr] gap-x-4 gap-y-2">
                            <span className="text-[#6B7280] font-medium">Dénomination</span>
                            <span className="text-[#111827] font-semibold">Wait-Light</span>

                            <span className="text-[#6B7280] font-medium">Forme juridique</span>
                            <span>Projet étudiant — YNOV Campus</span>

                            <span className="text-[#6B7280] font-medium">Établissement</span>
                            <span>YNOV Campus, France</span>

                            <span className="text-[#6B7280] font-medium">Email</span>
                            <span>
                                <a
                                    href="mailto:contact@waitlight.fr"
                                    className="text-[#4F46E5] underline hover:text-[#4338CA]"
                                >
                                    contact@waitlight.fr
                                </a>
                            </span>

                            <span className="text-[#6B7280] font-medium">Site web</span>
                            <span>
                                <a
                                    href="https://waitlight.fr"
                                    className="text-[#4F46E5] underline hover:text-[#4338CA]"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    waitlight.fr
                                </a>
                            </span>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-[#111827] mb-4">2. Directeur de la publication</h2>
                    <p>
                        Le directeur de la publication est le responsable du projet Wait-Light au sein de
                        l&apos;établissement YNOV Campus.
                    </p>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-[#111827] mb-4">3. Hébergement</h2>
                    <div className="space-y-5">
                        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
                            <p className="font-semibold text-[#111827] mb-2">Application web — Vercel Inc.</p>
                            <div className="text-[#374151] space-y-1">
                                <p>340 Pine Street, Suite 701</p>
                                <p>San Francisco, CA 94104 — États-Unis</p>
                                <p>
                                    <a href="https://vercel.com" className="text-[#4F46E5] underline hover:text-[#4338CA]" target="_blank" rel="noreferrer">
                                        vercel.com
                                    </a>
                                </p>
                            </div>
                        </div>
                        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
                            <p className="font-semibold text-[#111827] mb-2">Base de données — Supabase Inc.</p>
                            <div className="text-[#374151] space-y-1">
                                <p>970 Toa Payoh North, #07-04</p>
                                <p>Singapour — Région de stockage : AWS eu-west-3 (Paris)</p>
                                <p>
                                    <a href="https://supabase.com" className="text-[#4F46E5] underline hover:text-[#4338CA]" target="_blank" rel="noreferrer">
                                        supabase.com
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-[#111827] mb-4">4. Propriété intellectuelle</h2>
                    <p>
                        L&apos;ensemble des contenus présents sur le site waitlight.fr (textes, graphismes, logos,
                        icônes, images, code source, interface utilisateur) est la propriété exclusive de
                        Wait-Light et est protégé par les lois françaises et internationales applicables en matière
                        de propriété intellectuelle.
                    </p>
                    <p className="mt-3">
                        Toute reproduction, représentation, modification, publication, adaptation ou exploitation,
                        même partielle, de ces éléments est interdite sans l&apos;accord écrit préalable de
                        l&apos;éditeur. Toute infraction à ces droits peut donner lieu à des poursuites civiles
                        et/ou pénales conformément aux dispositions légales en vigueur.
                    </p>
                    <p className="mt-3">
                        Les icônes utilisées dans l&apos;application sont issues de la bibliothèque{" "}
                        <a href="https://lucide.dev" className="text-[#4F46E5] underline hover:text-[#4338CA]" target="_blank" rel="noreferrer">
                            Lucide
                        </a>{" "}
                        (licence ISC open source).
                    </p>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-[#111827] mb-4">5. Données personnelles</h2>
                    <p>
                        Le traitement des données personnelles effectué dans le cadre du Service est détaillé dans
                        notre{" "}
                        <a href="/legal/privacy" className="text-[#4F46E5] underline hover:text-[#4338CA]">
                            Politique de Confidentialité
                        </a>
                        . Ce traitement est réalisé dans le respect du Règlement Général sur la Protection des
                        Données (RGPD) et de la loi Informatique et Libertés du 6 janvier 1978 modifiée.
                    </p>
                    <p className="mt-3">
                        Pour toute question relative à vos données, contactez-nous à{" "}
                        <a href="mailto:contact@waitlight.fr" className="text-[#4F46E5] underline hover:text-[#4338CA]">
                            contact@waitlight.fr
                        </a>
                        {" "}ou adressez une réclamation à la{" "}
                        <a
                            href="https://www.cnil.fr"
                            className="text-[#4F46E5] underline hover:text-[#4338CA]"
                            target="_blank"
                            rel="noreferrer"
                        >
                            CNIL
                        </a>
                        .
                    </p>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-[#111827] mb-4">6. Cookies</h2>
                    <p>
                        Wait-Light utilise uniquement des cookies strictement nécessaires au bon fonctionnement du
                        Service (maintien de la session d&apos;authentification). Ces cookies ne nécessitent pas
                        votre consentement conformément à l&apos;article 82 de la loi Informatique et Libertés.
                    </p>
                    <p className="mt-3">Aucun cookie publicitaire, de traçage ou analytique tiers n&apos;est utilisé.</p>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-[#111827] mb-4">7. Liens hypertextes</h2>
                    <p>
                        Le site peut contenir des liens vers des sites tiers. L&apos;Éditeur ne saurait être tenu
                        responsable du contenu de ces sites externes ni de leur politique de confidentialité.
                    </p>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-[#111827] mb-4">8. Droit applicable</h2>
                    <p>
                        Les présentes mentions légales sont soumises au droit français. Tout litige relatif à
                        l&apos;utilisation du site sera soumis à la juridiction compétente des tribunaux français.
                    </p>
                </section>
            </div>
        </article>
    )
}
