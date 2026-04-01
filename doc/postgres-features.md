# Architecture PostgreSQL — Wait-Light

Ce document recense les fonctionnalités natives et avancées de PostgreSQL utilisées au cœur de Wait-Light. Le backend ne s'appuie pas sur un simple CRUD classique : il déporte une grande partie de la sécurité et de la logique métier directement dans le moteur de base de données.

---

## 🔒 1. Row Level Security (RLS)

PostgreSQL RLS est la fondation du modèle de sécurité "Zero Trust" du projet. Chaque requête passée via l'API (PostgREST) prend le rôle `anon` (client) ou `authenticated` (marchand) selon le JWT fourni.

**Isolation Multi-Tenant (Marchands) :**
- Les requêtes d'un marchand (ex: `SELECT * FROM queue_items`) sont automatiquement filtrées par Postgres grâce à la politique : `merchant_id = auth.uid()`.
- Il est impossible pour un marchand d'accéder aux tickets, paramètres ou tokens d'un concurrent, même en forgeant des requêtes HTTP.

**Data Privacy (Clients) :**
- Un client (anonyme) ne peut faire un `SELECT` sur `queue_items` que pour **son propre ticket** (clause `id = [param]`).
- Les noms des autres clients ne sont jamais renvoyés en lot vers un navigateur public.

---

## ⚡ 2. Fonctions RPC (Stored Procedures) & SECURITY DEFINER

Wait-Light utilise des fonctions `PL/pgSQL` avec le modificateur `SECURITY DEFINER`. Cela permet d'exécuter une fonction avec les privilèges de son créateur (bypass RLS) de manière extrêmement contrôlée.

- **`validate_qr_token(nonce, slug)`** : Exécutée par un client anonyme lors du scan. Autorise Postgres à vérifier l'existence du token bloqué par RLS, vérifier sa validité temporelle (TTL 30s) et le marquer immédiatement comme `used = true` de manière atomique pour éviter les *Race Conditions* (Token Replay).
- **`get_position(ticket_id)`** : Permet à un utilisateur anonyme de connaître la taille de la file devant lui (`COUNT(*)`) sans avoir les droits de lire les autres lignes de la table `queue_items`.
- **`check_slug_available(slug)`** : Vérifie la disponibilité d'un identifiant sans permettre l'énumération globale de la table `merchants`.

---

## 🛡️ 3. Triggers & Constraints (Défense Anti-Abus)

Les limites de sécurité applicatives (Server Actions) peuvent théoriquement être contournées. Les Triggers Postgres agissent comme l'ultime rempart infranchissable.

- **`check_queue_capacity` (BEFORE INSERT)** : Ce trigger s'assure qu'avant chaque ajout dans `queue_items`, le nombre de tickets au statut `waiting` ne dépasse pas le `max_capacity` défini dans la table `settings`. Si la file est pleine, la base rejette l'insertion (`RAISE EXCEPTION`), empêchant tout bot de flooder le système applicatif.
- **Constraints d'unicité croisées** : Par exemple sur la table `banned_words` (`merchant_id`, `word`), empêchant l'insertion de doublons au niveau physique.

---

## 📊 4. Vues Matérialisées & Analytiques

Le tableau de bord analytique nécessite des calculs lourds (fréquentation, temps d'attente moyen, etc.).

- Au lieu d'effectuer des `GROUP BY` et `AVG()` massifs sur des milliers de tickets lors du chargement de la page Next.js, Wait-Light utilise des **vues** (ex: `merchant_analytics_view`).
- Ces vues permettent de pré-calculer et d'exposer les métriques proprement à l'application, soulageant le backend d'un travail d'agrégation coûteux.

---

## 🔄 5. Logical Replication (Realtime)

Le système de websocket "Realtime" de Supabase n'est pas une surcouche applicative, il écoute directement le WAL (Write-Ahead Log) de PostgreSQL via la réplication logique.
- Dès qu'un marchand modifie le statut d'un ticket (UPDATE `queue_items`), Postgres propage le changement dans le WAL.
- Cela permet aux clients connectés de voir le changement d'état (ex: appel au comptoir) de manière instantanée, en conservant la source de vérité absolue côté base.

---

## ⏱️ 6. pg_cron (Tâches planifiées en base)

Wait-Light possède des besoins d'expiration et de nettoyage autonome.
- **Purge des Tokens QR :** Un job `pg_cron` tourne toutes les 5 minutes pour supprimer (`DELETE`) les enregistrements de la table `qr_tokens` dont le `expires_at` est dépassé, garantissant que la table ne grossisse pas inutilement avec les rotations toutes les 15 secondes.
- **Auto-Close des tickets :** Un job clôturant les tickets ignorés depuis plus de 5 minutes permet de désengorger automatiquement les files des marchands inactifs.

---

## 🔑 7. Architecture des Privilèges : Le rôle `service_role`

Contrairement à une infrastructure classique où une API Node.js/Express établit une connexion persistante (TCP) avec un super-utilisateur de base de données (avec login/mot de passe), Wait-Light est une application **Serverless** hébergée sur l'Edge.

L'utilisation de la `SUPABASE_SERVICE_ROLE_KEY` est une spécificité architecturale cruciale qui s'interface avec PostgreSQL via **PostgREST** :

- Le backend n'ouvre pas de vraie connexion TCP coûteuse. Il fait une simple requête HTTP à l'API de Supabase.
- Au lieu d'un login classique, l'API lit le JWT (la clé *service_role*).
- PostgREST traduit automatiquement ce JWT en un basculement (`SET ROLE service_role;`) au sein de Postgres le temps précis de la petite transaction HTTP.
- Le rôle natif `service_role` dans l'instance Postgres de Supabase possède l'attribut spécial `BYPASS RLS`.

Cela permet à Wait-Light d'exécuter des actions sécurisées côté serveur (Server Actions) nécessitant des privilèges d'administration (ex: réception sécurisée d'un webhook Stripe gérant la base `subscriptions`, ou l'action `togglePaywallBypass` d'un admin validé) **sans s'exposer aux problèmes de Pool Limits** ni aux lourdeurs des Cold Starts liés aux connexions DB traditionnelles. L'utilisation du `service_role` est donc le choix architectural exact dicté par la stack NextJS+Supabase.
