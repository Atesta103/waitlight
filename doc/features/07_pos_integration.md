# 7. Connexion API Caisse (Intégration POS) - *La "Killer Feature"*

**Description** : La machine à carte ou la caisse enregistreuse envoie directement l'ordre à Wait-Light (pas de double saisie par le commerçant).

## Implémentation Backend
* Création d'une **API REST publique entrante** (`/api/webhooks/pos`).
* Quand la caisse encaisse, elle envoie un payload Webhook. Le Backend valide le webhook via **Zod**, insère le client en BDD (Broadcast Realtime auto du nouveau ticket vers l'interface du commerçant).

## Implémentation Frontend
* Affichage des **détails de la commande importée** (ex: "Commande #42 : 2 Burgers") à l'intérieur de la `TicketCard` via son menu Dropdown.
