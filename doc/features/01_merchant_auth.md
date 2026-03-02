# Feature 01: Authentification & Gestion de compte (Merchant Auth)

* **Type** : Cœur de l'application (Core)
* **Dépendances** : Aucune

**Description** : Permettre aux commerçants de créer un compte sécurisé (inscription/connexion/déconnexion) pour accéder et gérer leur espace Waitlight de manière privée. C'est la base indispensable pour isoler les données de chaque commerce (RLS).

## Sous-tâches d'intégration

### Backend (Supabase)
- [ ] Configurer Supabase Auth (Email / Mot de passe).
- [ ] Créer la table `merchants` (profil public du commerce lié au `auth.uid()`).
- [ ] Mettre en place les règles RLS (Row Level Security) sur `merchants` pour que le commerçant puisse modifier son propre profil.

### Frontend (Next.js)
- [ ] Créer les vues publiques `/(auth)/login` et `/(auth)/register`.
- [ ] Mettre en place un Server Action Next.js pour valider les identifiants avec Zod.
- [ ] Configurer le `middleware.ts` pour rediriger les non-connectés loin du `/(dashboard)` et inversement.
- [ ] Implémenter le bouton/action de "Déconnexion".
