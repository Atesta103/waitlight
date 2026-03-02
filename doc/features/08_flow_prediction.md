# Feature 08: Prévision des Flux & Statistiques (Analytics)

* **Type** : Évolution de Rétention (Evolution)
* **Dépendances** : [Feature 03: Dashboard](./03_merchant_dashboard.md)

**Description** : Un résumé analytique pour aider le commerçant à prévoir le rush (stock, personnel).

## Sous-tâches d'intégration

### Backend (Supabase)
- [ ] Créer une vue matérialisée SQL (`merchant_analytics_view`) qui agglomère le volume historique de `queue_items` par jour de la semaine et tranche horaire (éviter de faire ramer la DB avec de gros GROUP BY en temps réel).
- [ ] Exposer une route Serveur `/api/analytics` ou réutiliser les RPC.

### Frontend (Next.js)
- [ ] Créer une nouvelle page `/(dashboard)/analytics`.
- [ ] Installer une librairie de visualisation (`Recharts` ou `Tremor`).
- [ ] Créer un composant "Heatmap" (Carte de chaleur) ou "Courbe des rush" avec les données renvoyées par la BDD.
