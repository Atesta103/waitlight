# 3. Calcul du Temps d'Attente Estimé

**Description** : Informer le client de son temps d'attente approximatif plutôt que juste de son rang.

## Implémentation Backend
* Création d'une fonction SQL (RPC) ou requête complexe via TanStack Query qui calcule la moyenne de traitement d'un ticket au cours de la dernière heure, multipliée par la position actuelle du client.

## Implémentation Frontend
* Affichage d'un **"Time Pill" dynamique** (ex: "Votre tour vers 18h42") qui se rafraîchit doucement sur la carte client.
