# Overview

## Goal

Wait-Light est une application SaaS de file d'attente virtuelle "Scan & Go". Elle permet aux clients de commerces de s'inscrire dans une file d'attente via un QR Code et de suivre leur progression en temps réel sur leur smartphone, les libérant de l'attente physique sur place.

## Users / Roles

- **Merchant (Admin)** : Crée son établissement, gère la file (appelle le client suivant, annule, clôture la file) et accède aux statistiques de fréquentation.

- **Customer** : Scanne le QR Code, rejoint la file avec son nom/prénom, et reçoit une notification visuelle/sonore quand son tour approche. **Les clients peuvent être de n'importe quelle langue, avoir un handicap visuel, moteur ou auditif.** L'interface coteé client doit être utilisable par tous sans exception.

- **System** : Gère les WebSockets pour la mise à jour instantanée des positions dans la file.

## Accessibilité & Inclusivité

- L'application vise la conformité **WCAG 2.1 Niveau AA** sur toutes les pages.
- La surface client (`/[slug]/*`) est la priorité absolue : elle doit fonctionner correctement avec un lecteur d'écran (VoiceOver iOS, TalkBack Android), au clavier seul, et à 200% de zoom navigateur.
- L'interface est disponible en **français** (défaut) et en **anglais** (première addition obligatoire). L'architecture i18n doit permettre d'ajouter d'autres langues sans modification de code.
- Les alertes de changement de statut (position, tour arrivé) sont communiquées via plusieurs canaux simultanés : visuel (bannière haute visibilité), sonore (`AudioContext`), et haptique (`navigator.vibrate`) — aucun canal n'est suffisant seul.
- Règles détaillées : [`doc/accessibility.md`](./doc/accessibility.md).

# Technical Stack

## Frontend

- **Framework : Next.js (App Router)**. Justification : SSR pour le tableau de bord marchand et une version PWA (Progressive Web App) pour que les clients n'aient rien à installer.

- **Real-time UI** : Framer Motion. Justification : Pour des transitions fluides lorsque les clients "remontent" dans la file (Exigence Front).

- **State Management** : TanStack Query (React Query). Justification : Gestion parfaite du cache et de la synchronisation avec le serveur.

## Backend

- **BaaS** : Supabase. Justification : Utilisation intensive de Supabase Realtime (Postgres Changes) pour éviter de rafraîchir la page.

- **Notifications** : Web Push API ou Resend. Justification : Alerter le client même si son téléphone est en veille.

- **Logic** : Edge Functions pour valider les entrées et gérer la logique de "ticket" unique.

## DevOps

- **Hosting** : Vercel pour le front, Supabase pour la data.

- **Monitoring** : Sentry pour le suivi des erreurs en production (Critère de performance/qualité).

- **Security** : Rate Limiting sur la création de tickets pour éviter qu'un plaisantin ne remplisse la file à distance (Sévérité Sécu).

## Mobile First Strategy (UX/UI)

- **Offline Resilience** : Gestion gracieuse des pertes de connexion (zones blanches en magasin) avec tentative de reconnexion automatique (`supabase.channel().subscribe()` avec backoff exponentiel) et feedback visuel immédiat (bannière "Connexion perdue – Reconnexion...").

- **Touch Targets** : Tous les éléments interactifs respecteront une taille minimale de 44×44px pour s'adapter à l'usage tactile "pouce".

- **Screen Wake Lock API** : Empêcher la mise en veille du téléphone tant que le client est dans la file active.
    - ⚠️ **Fallback** : Non supporté sur iOS < 16.4. Prévoir une vidéo transparente 1×1px en lecture en boucle (`<video autoplay loop muted playsInline>`) comme polyfill largement utilisé, avec un avertissement UX si ni l'un ni l'autre ne fonctionne.

- **Web Push Priority** : Privilégier les notifications Web Push (natives) plutôt que l'email (trop lent) pour alerter le client "C'est à votre tour".
    - ⚠️ **Limite iOS** : Web Push n'est supporté sur iOS Safari que depuis iOS 16.4, et **uniquement si la PWA est installée depuis l'écran d'accueil** (pas depuis le navigateur). Fallback obligatoire : si `Notification.permission` n'est pas accordé ou non supporté, la page reste ouverte et utilise `AudioContext` + `navigator.vibrate()` pour alerter localement.

- **PWA & Service Worker** : L'application doit être déclarée installable (fichier `manifest.json` complet) et disposer d'un Service Worker pour :
    1. Mettre en cache les assets statiques (stratégie _Cache First_).
    2. Gérer la réception des notifications Web Push en background.
    3. Afficher une page offline dédiée si la navigation initiale échoue.
    - Utiliser `next-pwa` ou une configuration Workbox manuelle (Next.js ne gère pas le SW nativement).

# Core Features

## Data Model (Supabase Postgres)

### Tables

| Table                | Colonnes clés                                                                                                                                  | Description                                                                                                                                                   |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `merchants`          | `id` (PK), `name`, `slug` (Unique), `is_open` (Bool), `avg_wait_time` (calculé)                                                                | Infos du commerce et état de la file. `avg_wait_time` est mis à jour par un **trigger Postgres** lors de chaque transition `called → done`, pas manuellement. |
| `queue_items`        | `id` (PK, UUID v4), `merchant_id` (FK), `customer_name`, `status` (`waiting`/`called`/`done`/`cancelled`), `joined_at`, `called_at`, `done_at` | Les "tickets" dans la file. `done_at` est nécessaire pour calculer la durée réelle du service.                                                                |
| `settings`           | `merchant_id` (FK), `max_capacity`, `welcome_message`, `qr_regenerated_at`                                                                     | Configuration personnalisée. `qr_regenerated_at` permet au marchand de régénérer son QR Code (invalidant le précédent).                                       |
| `push_subscriptions` | `id` (PK), `queue_item_id` (FK), `endpoint`, `p256dh`, `auth`, `created_at`                                                                    | Souscriptions Web Push associées à un ticket (pas à un compte, les clients étant anonymes).                                                                   |

> **Index obligatoire (performance)** : la position dans la file est calculée dynamiquement par un `COUNT(*)`. Sans index, chaque recalcul est un full scan sur toute la table.
>
> ```sql
> CREATE INDEX idx_queue_items_merchant_status_joined
>   ON queue_items (merchant_id, status, joined_at);
> ```

### RLS

Pour garantir une sécurité maximale et empêcher un client de voir qui est dans la file d'un autre commerce :

- **Table `merchants`** :
    - `SELECT` : Public (permet aux clients de voir si le commerce est ouvert et s'il accepte encore du monde).
    - `UPDATE` : Uniquement pour le marchand authentifié (`auth.uid()`).

- **Table `queue_items`** :
    - `INSERT` : Autorisé pour tous (permet de rejoindre la file). Protégé en amont par le trigger ci-dessous.
    - `SELECT` :
        1. Le marchand voit tous les tickets de son établissement.
        2. Le client voit **uniquement son propre ticket** (via son `id` UUID stocké en LocalStorage) ET le nombre de personnes devant lui via une **fonction RPC sécurisée** — les noms des autres clients ne sont jamais exposés.
    - `UPDATE` : Uniquement le marchand pour changer le statut (`called`, `done`, `cancelled`).

- **Table `push_subscriptions`** :
    - `INSERT` : Autorisé pour tous (le client enregistre sa subscription au moment de rejoindre la file).
    - `SELECT` / `DELETE` : Uniquement via les Edge Functions système (jamais exposé côté client).

### Trigger Postgres — Dernier rempart anti-spam

Le Rate Limiting sur les Edge Functions peut être contourné par un appel direct à l'API REST Supabase. Ce trigger constitue la défense de dernière ligne :

```sql
CREATE OR REPLACE FUNCTION check_queue_capacity()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
  max_cap       INTEGER;
BEGIN
  SELECT max_capacity INTO max_cap
    FROM settings WHERE merchant_id = NEW.merchant_id;

  SELECT COUNT(*) INTO current_count
    FROM queue_items
    WHERE merchant_id = NEW.merchant_id AND status = 'waiting';

  IF current_count >= max_cap THEN
    RAISE EXCEPTION 'Queue is full';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_queue_capacity
  BEFORE INSERT ON queue_items
  FOR EACH ROW EXECUTE FUNCTION check_queue_capacity();
```

## Routes (App Router Next.js)

| Route                     | Rôle                                                                                 | Rendu          | Auth requise      |
| ------------------------- | ------------------------------------------------------------------------------------ | -------------- | ----------------- |
| `/`                       | Landing page publique (présentation du produit)                                      | SSR            | Non               |
| `/login`                  | Authentification marchand                                                            | CSR            | Non               |
| `/onboarding`             | Création du compte marchand + `slug`                                                 | CSR            | Oui (marchand)    |
| `/[slug]`                 | Page publique du commerce (QR landing : statut ouvert/fermé, temps d'attente estimé) | SSR            | Non               |
| `/[slug]/join`            | Formulaire de rejointe de la file (nom/prénom + consentement RGPD)                   | CSR            | Non               |
| `/[slug]/wait/[ticketId]` | Suivi de position en temps réel (client)                                             | CSR + Realtime | Non (UUID en URL) |
| `/dashboard`              | File d'attente en temps réel (marchand)                                              | SSR + Realtime | Oui (marchand)    |
| `/dashboard/settings`     | Gestion du QR Code, capacité max, message d'accueil                                  | SSR            | Oui (marchand)    |
| `/dashboard/stats`        | Statistiques de fréquentation                                                        | SSR            | Oui (marchand)    |

> **Sécurité des routes `/dashboard/*`** : protégées par un middleware Next.js vérifiant le cookie de session Supabase. Toute tentative d'accès non authentifiée redirige vers `/login`.

## Business Logic

### QR Code

- L'URL encodée dans le QR est `/[slug]/join`.
- Le QR Code est **généré côté client** (lib `qrcode.react`) depuis le `slug` du marchand, sans stockage en base (le slug suffit).
- Le marchand peut **régénérer son QR** depuis `/dashboard/settings`, ce qui met à jour `settings.qr_regenerated_at`. Les anciens liens `/join` restent fonctionnels (même URL), mais l'action met à jour le visuel imprimé.

> ⚠️ Si le `slug` est compromis (spam), le marchand peut le **modifier** depuis les paramètres, invalidant physiquement l'ancien QR Code imprimé.

### Cycle de vie d'un ticket

```
[Client scanne le QR]
      ↓
  status: waiting        ← Ticket créé (INSERT)
      ↓
  status: called         ← Marchand appuie "Appeler suivant" (UPDATE par marchand)
      ↓                       → Notification Web Push envoyée au client
  status: done           ← Marchand appuie "Terminer" OU timeout de 5 min (UPDATE)
                              → `done_at` renseigné → trigger recalcule `avg_wait_time`
      ↑ (alternative)
  status: cancelled      ← Marchand annule OU client se désiste
```

**Règle sur le timeout `called → done`** : si le marchand ne clique pas "Terminer" dans les 5 minutes suivant l'appel, une Edge Function schedulée (`pg_cron` ou Supabase Cron Job) passe automatiquement le ticket en `done`. Cela évite le blocage de la file.

### Calcul de position

La position d'un client est calculée via une **fonction RPC Postgres** (pas exposée via SELECT direct) :

```sql
CREATE OR REPLACE FUNCTION get_position(ticket_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM queue_items
  WHERE merchant_id = (SELECT merchant_id FROM queue_items WHERE id = ticket_id)
    AND status = 'waiting'
    AND joined_at < (SELECT joined_at FROM queue_items WHERE id = ticket_id);
$$ LANGUAGE sql SECURITY DEFINER;
```

## Error States

Chaque cas d'erreur doit avoir une page ou un composant dédié — pas de page blanche ni d'erreur brute exposée à l'utilisateur :

| Scénario                              | Page / Comportement                                                                                          |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `slug` inexistant                     | Page 404 personnalisée "Ce commerce n'existe pas."                                                           |
| Commerce fermé (`is_open = false`)    | Page `/[slug]` affiche "La file est fermée pour aujourd'hui." avec l'heure d'ouverture si disponible.        |
| File pleine (`max_capacity` atteinte) | Page `/[slug]/join` affiche "La file est complète, revenez plus tard."                                       |
| `ticketId` invalide ou expiré         | Page `/[slug]/wait/[ticketId]` affiche "Ce ticket n'est plus valide." avec un lien pour rejoindre à nouveau. |
| Perte de connexion Realtime           | Bannière persistante + tentative de reconnexion toutes les 5s (backoff exponentiel jusqu'à 30s).             |
| Erreur Edge Function (5xx)            | Message d'erreur convivial + log Sentry automatique.                                                         |

## Statistics

Le dashboard marchand expose les métriques suivantes (calculées depuis `queue_items`) :

| Métrique                             | Calcul                                                         |
| ------------------------------------ | -------------------------------------------------------------- |
| Nombre de clients servis aujourd'hui | `COUNT(*) WHERE status = 'done' AND DATE(done_at) = TODAY`     |
| Temps d'attente moyen                | `AVG(called_at - joined_at) WHERE status IN ('called','done')` |
| Taux d'abandon                       | `COUNT(cancelled) / COUNT(*) * 100`                            |
| Fréquentation par heure              | `COUNT(*) GROUP BY EXTRACT(HOUR FROM joined_at)`               |
| Pic de fréquentation                 | Heure avec le plus grand nombre de `joined_at`                 |

> Ces métriques sont calculées via des **vues Postgres** (ou fonctions RPC) et mises en cache côté Next.js avec `revalidate` pour ne pas surcharger la base à chaque affichage.
