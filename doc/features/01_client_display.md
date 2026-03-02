# 1. La File d'Attente Visuelle (Display Client)

**Description** : L'écran que le client regarde. Il montre sa position exacte, le nombre de personnes devant lui, et une estimation du temps, le tout animé en temps réel sans rafraîchir la page.

## Implémentation Backend (Supabase)
* Utilisation de **Supabase Realtime**. Le client s'abonne à un canal filtré par `merchant_id`.
* Les données sensibles (noms des autres) sont bloquées par les règles de sécurité **RLS (Row Level Security)**. 
* Une fonction RPC SQL `get_position(ticket_id)` calcule le rang du client sans exposer la table `queue_items`.

## Implémentation Frontend (Next.js)
* **Client Component** (`QueuePositionCard`). Utilisation de **Framer Motion** pour animer les changements de rang (effet odomètre) afin de rendre l'attente psychologiquement plus agréable.
* Invalidations optimistes du cache via **TanStack Query** dès qu'un évènement Realtime est reçu.
