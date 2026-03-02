# Feature 09: Intégration Caisse (POS - Point Of Sale)

* **Type** : La "Killer Feature" (High-value Evolution)
* **Dépendances** : [Feature 03: Dashboard](./03_merchant_dashboard.md)

**Description** : Mettre fin à la double saisie pour le commerçant. La caisse (Square, SumUp, Lightspeed) pousse la commande validée directement dans la file d'attente Waitlight.

## Sous-tâches d'intégration

### Backend (Supabase)
- [ ] Créer une route système API Publique (Next.js Route Handler : `/api/webhooks/pos`).
- [ ] Mettre en place un système de sécurité (Headers HMAC ou Token API par commerçant).
- [ ] Interpréter le payload standard de caisse en ticket format "Waitlight" et l'insérer en base (côté Serveur = déclenche les animations Realtime pour les vues ouvertes).

### Frontend (Next.js)
- [ ] Dans l'écran "Paramètres", ajouter un bloc de configuration "Intégration API / Générer ma clé Secrète".
- [ ] Mise à jour du Dashboard : Afficher les détails de la commande reçue d'un POS (le nombre de menus, burgers, etc.) directement dans le menu de la `TicketCard`.
