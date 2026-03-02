# 2. Le Tableau de Bord Commerçant (Dashboard)

**Description** : L'interface ultra-rapide pour le commerçant (sur tablette ou téléphone) pour voir la liste des personnes en attente, et les appeler (changer leur statut).

## Implémentation Backend
* **Server Actions Next.js** (`lib/actions/queue.ts`) pour les mutations (`callNext`, `completeTicket`). 
* Ces requêtes backend mettent à jour les champs `status` (waiting -> called -> done) dans la table PostgreSQL `queue_items`. Ce changement déclenche automatiquement le Broadcast Realtime vers les clients.

## Implémentation Frontend
* **Server Components** pour le rendu initial par sécurité. 
* **Liste interactive** (`TicketCard`) optimisée pour les gros doigts (Boutons massifs "Appeler", "Terminer", design épuré sans badges redondants).
