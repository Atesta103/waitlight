# Feature 04: File d'Attente Visuelle (Display Client)

* **Type** : Cœur de l'application (Core)
* **Dépendances** : [Feature 03: Tableau de Bord](./03_merchant_dashboard.md)

**Description** : L'écran que le client regarde sur son téléphone ("Votre position est: #3"). Il montre le rang animé en temps réel.

## Sous-tâches d'intégration

### Backend (Supabase)
- [ ] Activer **Supabase Realtime** sur la table `queue_items` pour les évènements `UPDATE`.
- [ ] Rédiger une fonction RPC PostgreSQL `get_position(ticket_id)` qui renvoie simplement un chiffre (calcul de rang) sans exposer la liste des autres clients de la table.

### Frontend (Next.js)
- [ ] Créer la page publique `/[slug]/ticket/[ticket_id]` (récupération côté serveur via Server Component Initial).
- [ ] Côté client, s'abonner au `channel` Realtime filtré par le `merchant_id` de la boutique.
- [ ] Intégrer la `QueuePositionCard` (l'odomètre avec Framer Motion).
- [ ] À la réception d'un event Realtime, déclencher le recalcul du rang optimiste via TanStack Query.
- [ ] Afficher un magnifique overlay "Cest votre tour 🎉" lorsque la position tombe à 0.
