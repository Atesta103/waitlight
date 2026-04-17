import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Conditions Générales d'Utilisation — Wait-Light",
    description: "Conditions générales d'utilisation du service Wait-Light, logiciel de file d'attente digitale.",
}

export default function CguPage() {
    const lastUpdated = "17 avril 2026"

    return (
        <article className="prose-custom">
            <header className="mb-10 pb-8 border-b border-[#E5E7EB]">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#6366F1] mb-2">Légal</p>
                <h1 className="text-3xl md:text-4xl font-black text-[#111827] tracking-tight mb-3">
                    Conditions Générales d&apos;Utilisation
                </h1>
                <p className="text-sm text-[#6B7280]">Dernière mise à jour : {lastUpdated}</p>
            </header>

            <div className="space-y-10 text-[#374151] text-sm leading-7">

                <section>
                    <h2 className="text-lg font-bold text-[#111827] mb-3">1. Objet</h2>
                    <p>
                        Les présentes Conditions Générales d&apos;Utilisation (« CGU ») régissent l&apos;accès et
                        l&apos;utilisation du service Wait-Light (ci-après « le Service »), un logiciel de gestion de
                        file d&apos;attente digitale accessible via le site <strong>waitlight.fr</strong> et ses
                        sous-domaines.
                    </p>
                    <p className="mt-3">
                        Le Service est édité et exploité par Wait-Light (ci-après « l&apos;Éditeur »). Toute utilisation
                        du Service, qu&apos;il s&apos;agisse d&apos;un commerçant (« Marchand ») ou d&apos;un client
                        final (« Client »), implique l&apos;acceptation pleine et entière des présentes CGU.
                    </p>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-[#111827] mb-3">2. Description du Service</h2>
                    <p>Wait-Light permet à des commerçants, professionnels de santé ou organisateurs d&apos;événements (« Marchands ») de :</p>
                    <ul className="list-disc list-inside space-y-1 mt-3 ml-2">
                        <li>Créer et gérer une ou plusieurs files d&apos;attente digitales.</li>
                        <li>Générer et partager un QR Code permettant à leurs clients de rejoindre la file.</li>
                        <li>Notifier les clients en temps réel lorsque c&apos;est leur tour.</li>
                        <li>Personnaliser l&apos;interface aux couleurs de leur marque.</li>
                        <li>Consulter des statistiques d&apos;affluence.</li>
                    </ul>
                    <p className="mt-3">
                        Les Clients finaux accèdent au Service via un navigateur web, sans installation d&apos;application ni création de compte.
                    </p>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-[#111827] mb-3">3. Accès au Service et création de compte Marchand</h2>
                    <p>
                        L&apos;accès au tableau de bord Marchand requiert la création d&apos;un compte. Le Marchand
                        s&apos;engage à fournir des informations exactes et à maintenir la confidentialité de ses
                        identifiants.
                    </p>
                    <p className="mt-3">
                        Toute utilisation du compte effectuée avec les identifiants du Marchand engage la responsabilité
                        de ce dernier. En cas de perte ou de compromission de ses accès, le Marchand doit en informer
                        l&apos;Éditeur dans les plus brefs délais.
                    </p>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-[#111827] mb-3">4. Tarification et facturation</h2>
                    <p>
                        Wait-Light est proposé au tarif de <strong>29 € HT par mois et par établissement</strong>.
                        Un essai gratuit de <strong>14 jours</strong> est offert à tout nouveau Marchand, sans
                        engagement et sans saisie de coordonnées bancaires.
                    </p>
                    <p className="mt-3">
                        À l&apos;issue de la période d&apos;essai, l&apos;abonnement est tacitement reconduit mensuellement.
                        Le Marchand peut résilier à tout moment depuis son tableau de bord ou en contactant l&apos;Éditeur.
                        Aucune résiliation ne donne droit à un remboursement des jours non utilisés du mois en cours.
                    </p>
                    <p className="mt-3">
                        Les tarifs sont susceptibles d&apos;évoluer. Le Marchand en est informé avec un préavis d&apos;au
                        moins 30 jours par email avant toute modification tarifaire.
                    </p>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-[#111827] mb-3">5. Obligations du Marchand</h2>
                    <p>Le Marchand s&apos;engage à :</p>
                    <ul className="list-disc list-inside space-y-1 mt-3 ml-2">
                        <li>Utiliser le Service conformément à sa destination et aux présentes CGU.</li>
                        <li>Ne pas utiliser le Service à des fins illicites, frauduleuses ou abusives.</li>
                        <li>Ne pas tenter de contourner les mesures de sécurité du Service.</li>
                        <li>Informer ses clients des conditions d&apos;utilisation de la file d&apos;attente.</li>
                        <li>S&apos;assurer que les données personnelles de ses clients (prénom) sont collectées de manière licite.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-[#111827] mb-3">6. Propriété intellectuelle</h2>
                    <p>
                        L&apos;ensemble des éléments constituant le Service (code source, interfaces, algorithmes,
                        marque « Wait-Light », logo) est la propriété exclusive de l&apos;Éditeur et est protégé par
                        les lois françaises et internationales relatives à la propriété intellectuelle.
                    </p>
                    <p className="mt-3">
                        Toute reproduction, représentation, modification ou exploitation non autorisée de ces éléments
                        est strictement prohibée.
                    </p>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-[#111827] mb-3">7. Disponibilité et maintenance</h2>
                    <p>
                        L&apos;Éditeur s&apos;efforce d&apos;assurer la disponibilité du Service 24h/24 et 7j/7.
                        Des interruptions temporaires peuvent survenir pour des opérations de maintenance, des mises à
                        jour ou des incidents techniques. L&apos;Éditeur ne saurait être tenu responsable des
                        conséquences d&apos;une indisponibilité du Service.
                    </p>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-[#111827] mb-3">8. Limitation de responsabilité</h2>
                    <p>
                        Le Service est fourni « en l&apos;état ». L&apos;Éditeur ne garantit pas que le Service
                        répondra à l&apos;ensemble des besoins du Marchand. La responsabilité de l&apos;Éditeur ne
                        saurait être engagée en cas de perte de données, de manque à gagner ou de préjudice indirect
                        lié à l&apos;utilisation ou à l&apos;impossibilité d&apos;utiliser le Service.
                    </p>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-[#111827] mb-3">9. Résiliation</h2>
                    <p>
                        L&apos;Éditeur se réserve le droit de suspendre ou de résilier l&apos;accès au Service de tout
                        Marchand qui ne respecterait pas les présentes CGU, avec ou sans préavis selon la gravité du
                        manquement.
                    </p>
                    <p className="mt-3">
                        Le Marchand peut resilier son compte à tout moment depuis son espace personnel.
                        À la résiliation, les données du compte sont conservées 30 jours puis supprimées définitivement.
                    </p>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-[#111827] mb-3">10. Droit applicable et juridiction</h2>
                    <p>
                        Les présentes CGU sont régies par le droit français. Tout litige relatif à leur interprétation
                        ou exécution relève de la compétence exclusive des tribunaux compétents de Paris, sauf
                        disposition légale contraire applicable aux consommateurs.
                    </p>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-[#111827] mb-3">11. Modifications</h2>
                    <p>
                        L&apos;Éditeur se réserve le droit de modifier les présentes CGU à tout moment. Les Marchands
                        seront informés par email de toute modification substantielle. L&apos;utilisation du Service
                        après notification vaut acceptation des nouvelles CGU.
                    </p>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-[#111827] mb-3">12. Contact</h2>
                    <p>
                        Pour toute question relative aux présentes CGU, vous pouvez nous contacter à :{" "}
                        <a href="mailto:contact@waitlight.fr" className="text-[#4F46E5] underline hover:text-[#4338CA]">
                            contact@waitlight.fr
                        </a>
                    </p>
                </section>
            </div>
        </article>
    )
}
