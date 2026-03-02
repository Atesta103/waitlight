# 5. Prévision des Flux (Affluence)

**Description** : Dire au commerçant "Préparez-vous, d'habitude à 19h le vendredi, c'est le rush".

## Implémentation Backend
* Création d'une **vue matérialisée SQL** (Materialized View) qui agglomère le volume de tickets par jour de la semaine et tranche horaire.

## Implémentation Frontend
* Intégration d'une **librairie de graphiques** (ex: `Recharts` ou `Tremor`) dans un nouvel onglet "Statistiques" du Dashboard Commerçant pour une visualisation claire de l'historique et des prévisions.
