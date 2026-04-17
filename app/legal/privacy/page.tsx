import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Politique de Confidentialité — Wait-Light",
    description: "Politique de confidentialité et traitement des données personnelles du service Wait-Light.",
}

export default function PrivacyPage() {
    const lastUpdated = "17 avril 2026"

    return (
        <article>
            <header className="mb-10 pb-8 border-b border-[#E5E7EB]">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#6366F1] mb-2">Légal</p>
                <h1 className="text-3xl md:text-4xl font-black text-[#111827] tracking-tight mb-3">
                    Politique de Confidentialité
                </h1>
                <p className="text-sm text-[#6B7280]">Dernière mise à jour : {lastUpdated}</p>
            </header>

            <div className="space-y-10 text-[#374151] text-sm leading-7">

                <section>
                    <h2 className="text-lg font-bold text-[#111827] mb-3">1. Qui sommes-nous ?</h2>
                    <p>
                        Wait-Light est un service de file d&apos;attente digitale édité et exploité en France. En tant
                        que responsable de traitement, nous nous engageons à protéger vos données personnelles
                        conformément au Règlement Général sur la Protection des Données (RGPD — Règlement UE 2016/679)
                        et à la loi Informatique et Libertés.
                    </p>
                    <p className="mt-3">
                        Contact DPO :{" "}
                        <a href="mailto:contact@waitlight.fr" className="text-[#4F46E5] underline hover:text-[#4338CA]">
                            contact@waitlight.fr
                        </a>
                    </p>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-[#111827] mb-3">2. Données collectées</h2>

                    <h3 className="font-semibold text-[#111827] mt-5 mb-2">2.1 Clients finaux (file d&apos;attente)</h3>
                    <p>
                        Lorsqu&apos;un client rejoint une file d&apos;attente via notre service, nous collectons
                        uniquement :
                    </p>
                    <ul className="list-disc list-inside space-y-1 mt-3 ml-2">
                        <li><strong>Le prénom</strong> saisi volontairement pour être identifié dans la file.</li>
                        <li><strong>L&apos;horodatage</strong> d&apos;arrivée dans la file, d&apos;appel et de passage.</li>
                        <li>
                            <strong>Aucune donnée de navigation</strong> (IP, cookies de traçage) n&apos;est collectée
                            côté client final.
                        </li>
                    </ul>

                    <h3 className="font-semibold text-[#111827] mt-5 mb-2">2.2 Marchands (compte professionnel)</h3>
                    <p>Pour créer et gérer un compte Marchand, nous collectons :</p>
                    <ul className="list-disc list-inside space-y-1 mt-3 ml-2">
                        <li><strong>Adresse email</strong> (identifiant du compte).</li>
                        <li><strong>Nom de l&apos;établissement</strong> et slug personnalisé.</li>
                        <li>
                            <strong>Préférences de personnalisation</strong> : logo, couleur principale, police,
                            motif.
                        </li>
                        <li>
                            <strong>Données de facturation</strong> : gérées par notre prestataire de paiement
                            (Stripe) — Wait-Light ne stocke jamais les données de carte bancaire.
                        </li>
                        <li>
                            <strong>Données analytiques agrégées</strong> : nombre de tickets, temps moyen de passage,
                            sans identification individuelle.
                        </li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-[#111827] mb-3">3. Finalités et bases légales du traitement</h2>
                    <div className="overflow-x-auto mt-3">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-[#F3F4F6]">
                                    <th className="text-left px-4 py-2 font-semibold text-[#111827] rounded-tl-lg">Finalité</th>
                                    <th className="text-left px-4 py-2 font-semibold text-[#111827]">Base légale</th>
                                    <th className="text-left px-4 py-2 font-semibold text-[#111827] rounded-tr-lg">Durée de conservation</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E5E7EB]">
                                <tr>
                                    <td className="px-4 py-3 text-[#374151]">Gestion de la file d&apos;attente client</td>
                                    <td className="px-4 py-3 text-[#374151]">Intérêt légitime</td>
                                    <td className="px-4 py-3 text-[#374151]">48 h après clôture du ticket</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 text-[#374151]">Gestion du compte Marchand</td>
                                    <td className="px-4 py-3 text-[#374151]">Exécution du contrat</td>
                                    <td className="px-4 py-3 text-[#374151]">Durée de l&apos;abonnement + 30 jours</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 text-[#374151]">Facturation et comptabilité</td>
                                    <td className="px-4 py-3 text-[#374151]">Obligation légale</td>
                                    <td className="px-4 py-3 text-[#374151]">10 ans (Code de commerce)</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 text-[#374151]">Statistiques agrégées (anonymes)</td>
                                    <td className="px-4 py-3 text-[#374151]">Intérêt légitime</td>
                                    <td className="px-4 py-3 text-[#374151]">Indéfinie (données anonymisées)</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-[#111827] mb-3">4. Hébergement et sous-traitants</h2>
                    <p>
                        Wait-Light utilise <strong>Supabase</strong> (hébergé sur AWS eu-west-3 — région Paris) comme
                        infrastructure de base de données et d&apos;authentification. Les données sont chiffrées en
                        transit (TLS 1.3) et au repos.
                    </p>
                    <p className="mt-3">Nos sous-traitants principaux :</p>
                    <ul className="list-disc list-inside space-y-1 mt-2 ml-2">
                        <li><strong>Supabase</strong> — Base de données, authentification (EU-West)</li>
                        <li><strong>Vercel</strong> — Hébergement de l&apos;application (Edge Network)</li>
                        <li><strong>Stripe</strong> — Traitement des paiements (certifié PCI-DSS)</li>
                    </ul>
                    <p className="mt-3">
                        Chacun de ces prestataires est soumis à des garanties contractuelles conformes au RGPD
                        (clauses contractuelles types ou décision d&apos;adéquation).
                    </p>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-[#111827] mb-3">5. Sécurité des données</h2>
                    <p>Nous mettons en œuvre les mesures techniques suivantes :</p>
                    <ul className="list-disc list-inside space-y-1 mt-3 ml-2">
                        <li>Chiffrement TLS sur toutes les communications.</li>
                        <li>Row-Level Security (RLS) sur toutes les tables Supabase — chaque Marchand n&apos;accède qu&apos;à ses propres données.</li>
                        <li>Authentification sécurisée via JWT.</li>
                        <li>Aucun mot de passe stocké en clair (hachage bcrypt via Supabase Auth).</li>
                        <li>Accès production restreint aux seuls administrateurs autorisés.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-[#111827] mb-3">6. Vos droits</h2>
                    <p>
                        Conformément au RGPD, vous disposez des droits suivants sur vos données personnelles :
                    </p>
                    <ul className="list-disc list-inside space-y-1 mt-3 ml-2">
                        <li><strong>Droit d&apos;accès</strong> : obtenir une copie des données vous concernant.</li>
                        <li><strong>Droit de rectification</strong> : corriger des données inexactes.</li>
                        <li><strong>Droit à l&apos;effacement</strong> : demander la suppression de vos données.</li>
                        <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré.</li>
                        <li><strong>Droit d&apos;opposition</strong> : vous opposer à certains traitements.</li>
                    </ul>
                    <p className="mt-3">
                        Pour exercer ces droits, contactez-nous à{" "}
                        <a href="mailto:contact@waitlight.fr" className="text-[#4F46E5] underline hover:text-[#4338CA]">
                            contact@waitlight.fr
                        </a>
                        . Nous répondrons dans un délai maximum de 30 jours. Vous disposez également du droit
                        d&apos;introduire une réclamation auprès de la{" "}
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
                    <h2 className="text-lg font-bold text-[#111827] mb-3">7. Cookies</h2>
                    <p>
                        Wait-Light utilise uniquement des cookies strictement nécessaires au fonctionnement du Service
                        (session d&apos;authentification). Aucun cookie publicitaire ou de traçage tiers n&apos;est
                        déposé sur votre navigateur. Aucun consentement n&apos;est requis pour ces cookies
                        fonctionnels.
                    </p>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-[#111827] mb-3">8. Modifications</h2>
                    <p>
                        Cette politique peut être mise à jour. En cas de modification substantielle, les Marchands
                        seront informés par email. La date de mise à jour en tête de page fait foi.
                    </p>
                </section>
            </div>
        </article>
    )
}
