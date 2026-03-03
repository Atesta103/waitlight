# Feature 02: Configuration du commerce (Merchant Settings)

- **Type** : Cœur de l'application (Core)
- **Dépendances** : [Feature 01: Authentification](./01_merchant_auth.md)
- **Statut** : ✅ Implémenté (2026-03-03) — tâches additionnelles complétées (2026-03-04)

**Description** : Écran de paramétrage permettant au commerçant enregistré de définir l'identité de sa boutique (nom, logo, URL personnalisée "slug", temps d'attente manuel par défaut) ainsi que la configuration de la file (capacité max, message d'accueil, notifications, fermeture automatique).

## Sous-tâches d'intégration

### Backend (Supabase)

- [x] Ajouter les colonnes `logo_url` et `default_prep_time_min` dans la table `merchants`.
- [x] Ajouter les colonnes `notifications_enabled` et `auto_close_enabled` dans la table `settings`.
- [x] Créer un Storage Bucket public `merchant-logos` (512 Ko max, JPEG/PNG/WebP) avec policies RLS propriétaire.
- [x] Créer la RPC `check_slug_available(p_slug, p_exclude_merchant_id)` — vérifie la disponibilité d'un slug en excluant le commerçant lui-même.
- [x] Mettre à jour les actions de modification (`updateMerchantIdentityAction`, `updateQueueSettingsAction`, `regenerateQRAction`) avec session auth + Zod.

### Frontend (Next.js)

- [x] Page `/(dashboard)/dashboard/settings/page.tsx` — Server Component SSR qui charge les données initiales et les passe au `SettingsPanel`.
- [x] Composant `SettingsPanel` rewired — séparé en deux sections indépendantes (Identité / Configuration file), chacune avec son propre `useTransition` + Server Action.
- [x] Upload d'image logo — upload client-side vers `merchant-logos` bucket via le Supabase browser client, URL publique sauvegardée via `updateMerchantIdentityAction`.
- [x] Validation dynamique du slug avec `SlugInput` branché sur `checkSlugAvailabilitySettingsAction` (exclut le slug actuel du commerçant).
- [x] Mise à jour du composant `Avatar` pour supporter la prop `imageUrl` (affichage `next/image` si disponible).
- [x] Formulaires avec retours d'erreur inline et confirmation succès.

## Tâches additionnelles identifiées

### Qualité & robustesse

- [x] **Tests Zod** : Ajouter des tests unitaires pour `MerchantIdentitySchema` et `QueueSettingsSchema` (1 cas valide, 2 cas invalides chacun — règle AGENTS.md §2.6). — 19 tests dans `lib/validators/__tests__/settings.test.ts`.
- [ ] **Tests d'intégration** : Tester `updateMerchantIdentityAction` et `updateQueueSettingsAction` en environment de test.
- [x] **Suppression de logo** : Ajouter un bouton "Supprimer le logo" (supprime le fichier Supabase Storage + met `logo_url` à `null`).

### UX & accessibilité

- [x] **Preview du logo** avant upload (FileReader API) pour éviter un aller-retour réseau inutile.
- [x] **Confirmation slug** : Avertir l'utilisateur qu'un changement de slug invalide les QR codes déjà imprimés (Dialog de confirmation).
- [x] **Navigation** : Ajouter un lien "Paramètres" dans la navigation du dashboard.

### Sécurité

- [x] **Rate limit** sur `updateMerchantIdentityAction` (slug change) — `merchants.slug_last_changed_at` + cooldown 1 h enforced server-side (migration `20260303000001_slug_rate_limit.sql`).

## Notes d'architecture

- Le `SettingsPanel` est divisé en deux sections avec états locaux séparés pour éviter de bloquer la section QR/capacité lors de la sauvegarde de l'identité et inversement.
- L'upload du logo se fait **côté client** via le browser client Supabase (session anonyme avec policy storage) : la clé `service_role` n'est jamais exposée.
- La RPC `check_slug_available` est `SECURITY DEFINER` : elle ne laisse pas filtrer les slugs existants via brute-force depuis la clé anon.
- Le QR Code n'est **pas re-généré après un changement de slug** — le composant React le recalcule côté client depuis le slug mis à jour dans l'état local. La sauvegarde met à jour `merchants.slug` en base.
