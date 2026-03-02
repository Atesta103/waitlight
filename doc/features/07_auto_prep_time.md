# Feature 07: Ajustement Automatique du Temps de Préparation (Machine Learning)

* **Type** : Évolution avancée (Evolution)
* **Dépendances** : [Feature 05: Wait Time Estimation](./05_estimated_wait_time.md)

**Description** : L'app apprend le rythme réel du commerçant et modifie la valeur de temps estimée basée sur la réalité, de manière totalement transparente.

## Sous-tâches d'intégration

### Backend (Supabase)
- [ ] Écrire une fonction SQL `calculate_avg_prep` qui fait la moyenne du temps entre `joined_at` et `done_at` sur le jour en cours pour un commerçant donné.
- [ ] Créer une **Supabase Edge Function** ou configurer **pg_cron**.
- [ ] Déclencher le calcul toutes les N commandes (ex: 20 appels) ou la nuit. Si la différence avec `default_prep_time_min` est flagrante (> 2 min), écrire la nouvelle valeur dans une colonne `calculated_avg_prep_time`.

### Frontend (Next.js)
- [ ] L'affichage client de la Feature 05 n'aura plus besoin d'être modifié, il récupèrera la variable auto-générée du backend.
- [ ] Dans le Dashboard commerçant (Settings), indiquer visuellement "Temps calculé automatiquement par l'Assistance IA" avec un petit graphique simple.
