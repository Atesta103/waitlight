# Overview

## Goal

Wait-Light est une application SaaS de file d'attente virtuelle "Scan & Go". Elle permet aux clients de commerces de s'inscrire dans une file d'attente via un QR Code et de suivre leur progression en temps réel sur leur smartphone, les libérant de l'attente physique sur place.

## Users / Roles

- **Merchant (Admin)** : Crée son établissement, gère la file (appelle le client suivant, annule, clôture la file) et accède aux statistiques de fréquentation.

- **Customer** : Scanne le QR Code, rejoint la file avec son nom/prénom, et reçoit une notification visuelle/sonore quand son tour approche.

- **System** : Gère les WebSockets pour la mise à jour instantanée des positions dans la file.

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

- **Offline Resilience** : Gestion gracieuse des pertes de connexion (zones blanches en magasin) avec tentative de reconnexion automatique et feedback visuel immédiat.

- **Touch Targets** : Tous les éléments interactifs respecteront une taille minimale de 44x44px pour s'adapter à l'usage tactile "pouce".

- **Screen Wake Lock API** : Empêcher la mise en veille du téléphone tant que le client est dans la file active, pour ne pas manquer son tour.

- **Web Push Priority** : Privilégier les notifications Web Push (natives) plutôt que l'email (trop lent) pour alerter le client "C'est à votre tour".

# Core Features

## Data Model (Supabase Postgres)

### Tables

Table Columns Description
merchants id (PK), name, slug (Unique), is_open (Bool), avg_wait_time Infos du commerce et état de la file.
queue_items id (PK), merchant_id (FK), customer_name, status (waiting/called/done/cancelled), joined_at, called_at Les "tickets" dans la file.
settings merchant_id (FK), max_capacity, welcome_message Configuration personnalisée du commerçant.

### RLS

Pour garantir une sécurité maximale et empêcher un client de voir qui est dans la file d'un autre commerce :

- Table merchants : \* SELECT : Public pour permettre aux clients de voir si le commerce est ouvert.
  - UPDATE : Uniquement pour le marchand authentifié (auth.uid()).

- Table queue_items :
  - INSERT : Autorisé pour tous (permet de rejoindre la file).
  - SELECT :
    1. Le marchand voit tout son établissement.
    2. Le client voit uniquement son propre ticket (via son id stocké en LocalStorage) ET le nombre de personnes devant lui (via une fonction RPC sécurisée pour ne pas fuiter les noms des autres).
  - UPDATE : Uniquement le marchand pour changer le statut (Appeler/Terminer).
