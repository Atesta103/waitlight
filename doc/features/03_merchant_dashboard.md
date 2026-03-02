# Feature 03: Tableau de Bord Commerçant (Dashboard & Actions)

* **Type** : Cœur de l'application (Core)
* **Dépendances** : [Feature 02: Configuration](./02_merchant_settings.md)

**Description** : L'interface ultra-rapide pour le commerçant (sur tablette ou téléphone) pour ajouter des clients dans sa file, voir la liste en attente, et les appeler.

## Sous-tâches d'intégration

### Backend (Supabase)
- [ ] Créer la table `queue_items` (`id`, `merchant_id`, `customer_name`, `status`, `joined_at`).
- [ ] Écrire le Server Action `add_ticket` (validation Zod du prénom).
- [ ] Écrire les mutations de changement d'état : `callTicket` (`status = called`), `completeTicket` (`status = done`), `cancelTicket` (`status = cancelled`).
- [ ] Configurer la sécurité: le commerçant X ne voit que les `queue_items` du `merchant_id = X`.

### Frontend (Next.js)
- [ ] Implémenter la vue `/(dashboard)/queue`.
- [ ] Créer le gros bouton d'ajout de ticket "Ajouter un client".
- [ ] Intégrer le composant `TicketCard` avec ses actions "Appeler" et "Terminer".
- [ ] Lier la liste (`QueueList`) avec **TanStack Query** (récupération initiale et rechargement lors des actions).
