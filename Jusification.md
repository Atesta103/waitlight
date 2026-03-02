# Document de Justification Technique - Wait-Light

Ce document détaille les choix technologiques et architecturaux effectués pour le projet Wait-Light, ainsi que les mesures prises pour garantir la sécurité et la performance du produit.

## Choix de la Stack Technique

### Frontend : Next.js (App Router)

- Justification : Nous avons choisi Next.js pour son architecture hybride. Le Server-Side Rendering (SSR) est utilisé pour le dashboard marchand afin de garantir une sécurité accrue des données, tandis que le Client-Side Rendering (CSR) est privilégié pour l'interface client pour sa réactivité.

- Performance : L'optimisation native des images et le "code-splitting" automatique nous permettent d'atteindre un score Lighthouse > 90, crucial pour des clients utilisant la 4G/5G à l'extérieur des commerces.

### Styling : Tailwind CSS & Framer Motion

- Justification : Tailwind permet une itération rapide sur le design tout en garantissant un bundle CSS minimal.

- Expérience Utilisateur (UX) : L'utilisation de Framer Motion permet d'animer les changements de position dans la file de manière fluide. Cela réduit la perception du temps d'attente chez l'utilisateur (psychologie de l'attente).

### Backend & Realtime : Supabase (PostgreSQL)

- Justification : Plutôt que de monter un serveur WebSocket complexe, nous utilisons Supabase Realtime. Cela permet de synchroniser l'état de la file d'attente instantanément entre le marchand (qui appelle un client) et le client (qui voit son rang diminuer) directement via les événements de la base de données.

- **Canaux filtrés (impératif de sécurité et de performance)** : Chaque client Realtime s'abonne à un canal **filtré par `merchant_id`**, pas à la table entière :
    ```ts
    supabase
        .channel(`queue:merchant_id=eq.${merchantId}`)
        .on(
            "postgres_changes",
            {
                event: "*",
                schema: "public",
                table: "queue_items",
                filter: `merchant_id=eq.${merchantId}`,
            },
            handler,
        )
        .subscribe()
    ```
    Sans ce filtre, chaque client recevrait les changements de **tous** les commerces → fuite de données + surcharge réseau inacceptable.

### Coexistence TanStack Query + Supabase Realtime

- **Problème potentiel** : TanStack Query gère le cache côté client, mais les mises à jour Realtime arrivent via un canal WebSocket Supabase — les deux mécanismes ne se connaissent pas nativement.

- **Stratégie adoptée** : lorsqu'un événement Realtime est reçu, le handler appelle `queryClient.invalidateQueries({ queryKey: ['queue', merchantId] })`. Cette approche simple garantit la cohérence sans logique de merge complexe.

    Pour les mises à jour très fréquentes (file très active), une mise à jour **optimiste du cache** (`queryClient.setQueryData`) peut être privilégiée pour éviter un round-trip réseau inutile.

## Sécurité & Robustesse

Le jury étant sévère sur les failles, nous avons implémenté les couches de protection suivantes :

### Sécurité des données (RLS)

Nous n'utilisons pas d'API "ouverte". Chaque accès à la base de données est filtré par des Row Level Security (RLS) policies au niveau SQL :

- Un client peut créer un ticket mais ne peut pas modifier celui d'un autre.
- Un commerçant ne peut agir que sur sa propre file d'attente.
- Les informations sensibles (noms des autres clients) sont masquées : le client ne reçoit que le nombre de personnes devant lui, pas leur identité.

### Protection contre les abus (Anti-Spam)

Pour éviter qu'un utilisateur malveillant ne sature une file d'attente à distance :

- Rate Limiting : Implémentation d'une limite de requêtes par IP via les Edge Functions.
- Validation de schéma : Utilisation de Zod pour valider strictement chaque entrée utilisateur côté serveur, empêchant les injections de scripts (XSS) ou de données corrompues.

### Intégrité du Déploiement

- **Environment Variables** : Aucune clé secrète n'est committée. Utilisation de variables d'environnement gérées par Vercel (chiffrées au repos). Les clés Supabase `anon` (publique) et `service_role` (secrète, côté serveur uniquement) sont strictement séparées.

- **Headers de sécurité** : Configuration dans `next.config.ts` :
    - `Content-Security-Policy` : restreint les sources de scripts/styles pour prévenir XSS.
    - `X-Frame-Options: DENY` : empêche l'intégration dans des iframes (clickjacking).
    - `Strict-Transport-Security` : force HTTPS.
    - `X-Content-Type-Options: nosniff` : empêche le MIME sniffing.

### RGPD — Consentement Utilisateur

La spec mentionne la conformité RGPD, mais elle nécessite une implémentation concrète dans le flux client :

- **Bannière de consentement** sur le formulaire `/[slug]/join` : _"En rejoignant cette file, vous acceptez que votre prénom soit utilisé pour vous appeler. Il sera supprimé automatiquement à la fin de la session."_ avec un lien vers la politique de confidentialité.

- **Droit à l'oubli** : les tickets `done` et `cancelled` sont **purgés automatiquement après 24h** via un Cron Job Supabase (`DELETE FROM queue_items WHERE status IN ('done','cancelled') AND done_at < NOW() - INTERVAL '24 hours'`).

- **Minimisation des données** : seul le prénom (ou un surnom) est collecté. Pas d'email, pas de numéro de téléphone, pas de compte obligatoire.

## Justification Métier & Commercialisation

Wait-Light se distingue par sa simplicité de mise en œuvre :

- Low Barrier to Entry : Pas d'application à télécharger pour le client (PWA/Web mobile).
- Scalabilité : L'architecture Serverless permet de supporter une montée en charge soudaine (ex: événement spécial, heure de pointe) sans maintenance manuelle du serveur.
- RGPD : Nous ne collectons que le strict minimum (Nom/Prénom). Les données de la file sont purgées automatiquement après chaque session pour respecter la vie privée.

## Stratégie de Déploiement

- **Vercel** : Choisi pour sa gestion native des branches de "Preview" (indispensable pour les tests en groupe de 3) et son CDN mondial garantissant une latence minimale.
- **CI/CD Pipeline** : Chaque push sur `main` déclenche via GitHub Actions :
    1. `pnpm lint` — vérification ESLint.
    2. `pnpm test` — tests unitaires (Vitest).
    3. `pnpm build` — vérification du build Next.js.
    4. Si tout passe → déploiement automatique sur Vercel.
    - En cas d'échec sur n'importe quelle étape, le déploiement est annulé et une alerte est envoyée.

## Stratégie de Tests

Conformément à l'exigence de qualité du projet, trois niveaux de tests sont prévus :

### Tests Unitaires (Vitest)

- Validation des schémas Zod (inputs malformés, XSS, injection SQL).
- Logique de calcul de position et de temps d'attente moyen.
- Fonctions utilitaires (formatage de temps, génération de slugs).

### Tests d'Intégration (Vitest + Supabase local)

- Vérification des RLS policies : s'assurer qu'un client ne peut pas lire les tickets d'un autre marchand.
- Test du trigger `check_queue_capacity` : comportement à capacité max.
- Test des Edge Functions avec des payloads valides et invalides.

### Tests E2E (Playwright)

- Flux complet **client** : scan URL → rejoindre la file → voir sa position diminuer → recevoir l'alerte.
- Flux complet **marchand** : connexion → appeler le suivant → voir la file se mettre à jour en temps réel.
- Test de résilience : simuler une perte de connexion et vérifier la reconnexion automatique.

> Les tests E2E tournent dans la CI contre un environnement Supabase de staging (projet séparé du projet de production).
