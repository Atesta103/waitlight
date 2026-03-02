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

- Environment Variables : Aucune clé secrète n'est committée. Utilisation de fichiers .env chiffrés sur les plateformes de déploiement.

- Headers de sécurité : Configuration de headers HTTP stricts (Content Security Policy, X-Frame-Options) pour prévenir le clickjacking et le sniffing de données.

## Justification Métier & Commercialisation

Wait-Light se distingue par sa simplicité de mise en œuvre :

- Low Barrier to Entry : Pas d'application à télécharger pour le client (PWA/Web mobile).
- Scalabilité : L'architecture Serverless permet de supporter une montée en charge soudaine (ex: événement spécial, heure de pointe) sans maintenance manuelle du serveur.
- RGPD : Nous ne collectons que le strict minimum (Nom/Prénom). Les données de la file sont purgées automatiquement après chaque session pour respecter la vie privée.

## Stratégie de Déploiement

- Vercel : Choisi pour sa gestion native des branches de "Preview" (indispensable pour les tests en groupe de 3) et son CDN mondial garantissant une latence minimale.
- CI/CD : Chaque push sur main déclenche une série de tests automatisés. Si un test de sécurité ou de build échoue, le déploiement est annulé, garantissant une production toujours stable.
