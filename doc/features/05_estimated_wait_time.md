# Feature 05: Calcul du Temps d'Attente Estimé

* **Type** : Évolution très utile (Core/Evo)
* **Dépendances** : [Feature 04: Display Client](./04_client_display.md), [Feature 03: Dashboard](./03_merchant_dashboard.md)

**Description** : Transformer la position brute (ex: "#3") en une information actionnable (ex: "Temps d'attente: ~8 min").

## Sous-tâches d'intégration

### Backend (Supabase)
- [ ] Améliorer la fonction RPC `get_position` pour exposer également `estimated_time`. 
- [ ] Calcul algorithmique BDD : Multiplier le rang de la personne par la valeur configurée `default_prep_time_min` du commerce.

### Frontend (Next.js)
- [ ] Mettre à jour l'interface `QueuePositionCard` (Client) pour ajouter l'icône Horloge et le "Time Pill" dynamique (Affiche: Temps restant, et l'Heure exacte approximative).
- [ ] (Optionnel) Côté commerçant `TicketCard`, afficher ce temps théorique.
