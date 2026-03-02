# Feature 02: Configuration du commerce (Merchant Settings)

* **Type** : Cœur de l'application (Core)
* **Dépendances** : [Feature 01: Authentification](./01_merchant_auth.md)

**Description** : Écran de paramétrage permettant au commerçant enregistré de définir l'identité de sa boutique (nom, logo, URL personnalisée "slug", temps d'attente manuel par défaut).

## Sous-tâches d'intégration

### Backend (Supabase)
- [ ] Ajouter les colonnes de configuration dans la table `merchants` (ex: `shop_name`, `slug`, `default_prep_time_min`).
- [ ] Créer un Storage Bucket public pour uploader le logo du commerce.
- [ ] Mettre à jour l'action de modification (`update_merchant_settings`) avec la sécurité RLS.

### Frontend (Next.js)
- [ ] Pager la vue `/(dashboard)/settings`.
- [ ] Créer un composant Formulaire (React Hook Form + Zod) pour la mise à jour des informations avec retours d'erreur.
- [ ] Créer le composant d'upload d'image (Avatar/Logo) relié à Supabase Storage.
- [ ] Valider dynamiquement la disponibilité du `slug` (nom formaté dans l'URL) pour qu'il soit unique.
