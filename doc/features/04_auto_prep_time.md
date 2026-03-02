# 4. Ajustement Automatique du Temps de Préparation (Machine Learning allégé)

**Description** : L'app apprend le rythme réel du commerçant et ajuste les estimations de temps de préparation automatiquement.

## Implémentation Backend
* Un **Cron Job Supabase** (pg_cron) ou une **Edge Function** déclenchée toutes les nuits analyse les timestamps réels des tickets de la journée (`created_at` jusqu'à `done_at`).
* Il calcule l'écart type et met à jour un champ `calculated_avg_prep_time` dans la table `merchants` si la tendance se confirme sur les 50 dernières commandes.

## Implémentation Frontend
* Ce temps pré-calculé est **automatiquement injecté** dans l'affichage client. Le commerçant n'a rien à configurer. 
* Un tableau de bord Analytics pourra lui montrer l'évolution de son rythme de croisière.
