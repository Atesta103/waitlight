# Feature 06: QR Code Dynamique

* **Type** : Évolution d'usage (Evolution)
* **Dépendances** : [Feature 02: Settings (Slug dispo)](./02_merchant_settings.md)

**Description** : Mettre à disposition un écran dans l'espace commerçant générant un QR Code permanent scannable par le client, renvoyant vers l'URL d'abonnement à la file.

## Sous-tâches d'intégration

### Backend (Supabase)
- [ ] Aucun impact BDD significatif. L'URL cible sera statique (ex: `https://wait-light.app/[slug]/join`).

### Frontend (Next.js)
- [ ] Ajouter une vue `/(dashboard)/qr-display`.
- [ ] Intégrer le package NPM `react-qr-code` ou `qrcode.react`.
- [ ] Paramétrer l'API Navigateur **WakeLock** (pour empêcher l'écran du device du commerçant de s'éteindre s'il pose la tablette face au client).
- [ ] Ajouter un bouton de téléchargement du QR Code en PDF / Image haute qualité.
