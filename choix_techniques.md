# Soutenance Technique : Wait-Light

Ce document centralise l'argumentaire technique du projet Wait-Light afin de vous préparer à justifier vos choix technologiques lors de la soutenance.

---

## 1. Choix du Framework Front-end : Next.js 15 (App Router)

**Pourquoi Next.js plutôt qu'un React classique (SPA) ou un autre framework backend ?**

- **Architecture Hybride (SSR/CSR)** : Le besoin du projet est double. D'un côté, un tableau de bord commerçant (besoin de sécurité, de rendu côté serveur pour masquer les clés d'API, de protection des routes). De l'autre, une interface client qui doit être extrêmement rapide et fluide sur mobile (4G/5G). Next.js avec son App Router (Server Components et Client Components) répond parfaitement à cette dualité.
- **Server Actions** : Plutôt que de coder et maintenir une lourde API séparée (Express, NestJS), Next.js permet de créer directement des endpoints sécurisés et fortement typés. Cela centralise le code d'une même fonctionnalité et accélère le développement.
- **Optimisation native** : Performance vitale pour le client final. L'image, la police et le code-splitting sont gérés nativement.

## 2. Base de données & Backend Serverless : PostgreSQL & Supabase

**Pourquoi une BDD Relationnelle (PostgreSQL) et pourquoi utiliser Supabase (BaaS) plutôt qu'un backend maison ?**

- **Intégrité et Relationnel** : Un système de file d'attente (Commerçants -> Files d'attente -> Tickets) nécessite des relations claires et une intégrité transactionnelle stricte (ACID) que seul le SQL robuste comme Postgres garantit.
- **Supabase Realtime** : Mettre en place et scaler un serveur WebSocket (pour que le client voie sa position descendre en direct quand le commerçant clique sur "Suivant") est complexe. Supabase se base directement sur les événements de changement de Postgres pour repousser la donnée aux clients via la base de données. _Justification sécurité : nous avons filtré les channels Realtime par `merchant_id` pour qu'on n'envoie pas à tout le monde._
- **Row Level Security (RLS)** : La sécurité d'accès n'est pas codée route par route dans un code Node.js potentiellement faillible. Elle est codée _directement au niveau de la donnée (SQL)_. Un commerçant ne peut lire/modifier que CEUX ayant son `merchant_id`.

## 3. L'utilisation du `SUPABASE_SERVICE_ROLE_KEY`

**Pourquoi utiliser une clé Super Admin plutôt que faire passer des requêtes via un compte utilisateur classique dédié ?**

- **Le problème de la RLS** : La RLS est très stricte. Parfois, le système a besoin d'agir de manière globale (ex: purger l'historique de tous les tickets à minuit, déclencher un "appel" qui modifie les états de tickets qui n'appartiennent pas directement à la requête cliente pure, ou générer un ticket côté serveur de manière sécurisée).
- **Le rôle du Service Role Key** : Cette clé outrepasse la Row Level Security (RLS). Elle est **strictement interdite côté client**.
- **La justification** : Nous utilisons cette clé exclusivement dans nos **Server Actions**, **Edge Functions** ou **Webhooks/Tâches Cron**. Elle nous permet d'exécuter de la logique complexe nécessitant une vue d'ensemble sur des tables, sans pour autant exposer un "faux" utilisateur admin qui serait un cauchemar de sécurité s'il était compromis.

## 4. Design System & Storybook

**Pourquoi s'encombrer d'un Design System et de Storybook pour un projet de cette taille au lieu de tout coder directement ?**

- **Consistance Visuelle** : L'expérience utilisateur (UX) est critique. Un commerçant doit avoir un dashboard clair, le client un écran rassurant. Un Design System isole les jetons de design (couleurs, espacements, typos).
- **Séparation des responsabilités (UI vs Logique)** : Storybook force à développer les composants "Atom" et "Molecule" (ex: un bouton, une carte de ticket) en totale isolation (`components/ui`). Ce faisant, le composant n'est absolument pas pollué par la logique métier (pas d'appel bdd, pas de fetching).
- **Documentation Vivante et Scalabilité** : Lors de la soutenance, vous pouvez démontrer que n'importe quel autre développeur peut rejoindre le projet sans se demander "quel code couleur bleu utiliser ?". C'est l'apanage des architectures professionnelles et robustes, contrastant avec du code "bidouillé".

## 5. Zod & Validation

**Pourquoi tout valider avec Zod avant d'envoyer en base de données ?**

- **Prévention d'attaques** : On ne fait jamais confiance aux données d'un client. Zod valide la structure (type) et le fond (longueur, caractères) évitant drastiquement les attaques de type XSS ou Injections SQL sur le backend.

## 6. Gestion d'État Asynchrone : TanStack Query (React Query)

**Pourquoi utiliser TanStack Query au lieu d'un simple `useEffect` + `useState` ou du Context API de React ?**

- **Saut qualitatif de performance** : Le fetching de données classique avec `useEffect` amène de nombreux problèmes professionnels (waterfalls, re-renders intempestifs, données périmées, aucun mode hors-ligne).
- **Symbiose avec Supabase Realtime** : Lorsque Supabase Realtime détecte un changement en base de données, la logique indique simplement à TanStack Query d'invalider son cache (`queryClient.invalidateQueries()`). TanStack Query relance la requête silencieusement, ce qui garantit que l'UI affiche toujours une donnée fraîche sans aucun clignotement.
- **Optimistic Updates** : Pour l'action "Appeler le client suivant", on met à jour l'UI _avant_ même que le serveur n'ait répondu. Si le serveur échoue, on rollback. Résultat : une sensation de vitesse instantanée pour le commerçant.

## 7. Système de Styled Components Modernes : Tailwind CSS & la fonction `cn()`

**Pourquoi Tailwind CSS couplé à la fonction utilitaire `cn()` ?**

- **Scalabilité et Bundle Size** : Tailwind compile uniquement les classes CSS réellement utilisées. Pas de CSS mort.
- **Le pattern `cn()` (clsx + tailwind-merge)** : La fonction `cn()` que j'ai placée dans `lib/utils` est devenue le standard de l'écosystème React/Tailwind (notamment popularisé par shadcn/ui). Elle fusionne deux librairies :
    - **`clsx`** : Permet d'appliquer des classes de manière conditionnelle très proprement `(ex: clsx('btn', isLoading && 'opacity-50'))`.
    - **`tailwind-merge`** : Règle le plus gros défaut de Tailwind : les conflits de priorité. Si mon composant `<Button>` a par défaut `bg-blue-500`, et que je l'appelle avec `<Button className="bg-red-500" />`, le CSS final est conflictuel. `tailwind-merge` comprend l'intention et supprime `bg-blue-500` pour ne garder que `bg-red-500`.

## 8. UX et "Psychologie de l'attente" : Framer Motion

**Pourquoi importer une librairie d'animation comme Framer Motion sur un projet sérieux ?**

- **Feedback Immédiat** : Lorsqu'un client voit sa position dans la file d'attente passer de "12" à "11", une simple mise à jour de texte passe inaperçue.
- **Réduction de l'attente perçue** : Animer le changement de nombre et les déplacements de cartes (via `layout` en Framer Motion) communique que la file "avance". Un système fluide baisse drastiquement l'abandon des utilisateurs pendant une attente.

## 9. Sécurité Cryptographique des QR Codes (Tokens)

**Comment empêchons-nous un petit malin de générer lui-même des URLs de file d'attente ou de spammer la base via des bots ?**

- **Signatures Cryptographiques (HMAC-SHA256)** : Plutôt que des URL statiques, l'application génère dynamiquement des codes QR éphémères (d'une durée de vie de 30 secondes par exemple). J'ai implémenté une vérification avec l'API native `crypto.subtle` de Node/Browser. Concrètement, le token est une signature HMAC générée à l'aide d'une variable d'environnement secrète.
- **Tokens à Usage Unique & TTL** : Chaque token est consigné en base de données (`qr_tokens`) et possède une expiration stricte (`expiresAt`). Il est invalidé après utilisation via une procédure SQL (RPC `validate_qr_token`). Impossible de tricher sa position en bookmarkant l'URL.
- **Rate-Limiting (Anti-Spam)** : Les routes côté serveur limitent la génération par commerçant pour éviter qu'un robot n'inonde la table `qr_tokens`.

## 10. Stratégie stricte en TypeScript

**Pourquoi ne jamais utiliser le type `any` ou `ts-ignore` sans justification ?**

- **Typage de bout en bout (End-to-End Type Safety)** : Oui, le script `"gen:types"` dans mon `package.json` (`supabase gen types`) interroge mon projet Supabase distant et génère le fichier `types/database.ts`. Le client TypeScript "connait" donc la structure exacte des tables et colonnes de ma propre BDD. Par conséquent, si j'ajoute ou supprime une colonne en SQL, mon code React refuse de compiler sur Vercel avant même qu'une erreur ne se produise en production pour l'utilisateur finaI.

## 11. L'intégration de paiements (Stripe) et Webhooks

**Pourquoi avoir utilisé des Webhooks gérés par Next.js pour Stripe plutôt qu'une solution de paiement directe ?**

- **Isolation Backend** : L’action de paiement (Stripe Checkout) sort de notre interface pour garantir la sécurité bancaire PCI-DSS.
- **Source de Vérité Asynchrone** : La souscription n'est validée en BDD chez nous que lorsque le serveur Stripe "ping" notre API de manière asynchrone (le `webhook`). L'accès à l'API webhook est lui-même validé cryptographiquement (signature Stripe) pour éviter qu'un hacker envoie une fausse requête de "paiement validé".
