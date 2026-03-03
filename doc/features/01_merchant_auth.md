# Feature 01: Authentification & Gestion de compte (Merchant Auth)

- **Type** : Cœur de l'application (Core)
- **Dépendances** : Aucune

**Description** : Permettre aux commerçants de créer un compte sécurisé (inscription/connexion/déconnexion) pour accéder et gérer leur espace Waitlight de manière privée. C'est la base indispensable pour isoler les données de chaque commerce (RLS).

## Sous-tâches d'intégration

### Backend (Supabase)

- [x] Configurer Supabase Auth (Email / Mot de passe) — projet connecté via `.env.local`.
- [x] Variables d'environnement Supabase configurées (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- [x] Créer la table `merchants` dans Supabase (profil public du commerce lié à `auth.uid()`).
- [x] Mettre en place les règles RLS sur `merchants` (le commerçant ne peut modifier que son propre profil).

### Frontend (Next.js)

- [x] Vues publiques `/(auth)/login`, `/(auth)/register`, `/(auth)/forgot-password`, `/(auth)/reset-password`.
- [x] Server Actions validées avec Zod (`loginAction`, `registerAction`, `forgotPasswordAction`, `resetPasswordAction`, `signOutAction`) dans `lib/actions/auth.ts`.
- [x] Schémas Zod dans `lib/validators/auth.ts` (`LoginSchema`, `RegisterSchema`, `ForgotPasswordSchema`, `ResetPasswordSchema`).
- [x] Clients Supabase séparés : `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (server), `lib/supabase/middleware.ts` (proxy).
- [x] `proxy.ts` (Next.js 16) — redirige les non-connectés hors du `/(dashboard)` et inversement.
- [x] Route `/auth/callback` pour l'échange PKCE (confirmation e-mail + reset password).
- [x] Bouton "Se déconnecter" dans `/(dashboard)/dashboard/page.tsx` via `signOutAction`.
- [x] Redirection `/` → `/login` (`app/page.tsx`).
- [x] Gestion des erreurs réseau dans les Server Actions (catch `TypeError: fetch failed`).
- [x] Bannières de succès/erreur post-redirect sur `/login` (`?reset=success`, `?error=auth_callback_error`).
- [x] État "Vérifiez votre boîte mail" après inscription réussie dans `RegisterForm`.

### Reste à faire

- [x] Activer la confirmation e-mail dans le dashboard Supabase (Auth → Email → "Confirm email").
- [x] Configurer les URLs autorisées dans Supabase (`Site URL` + `Redirect URLs` → `http://localhost:3000/auth/callback`).
- [x] Créer la table `merchants` et les politiques RLS associées — migration dans `supabase/migrations/20260302000000_initial_schema.sql`.
- [x] Lier `auth.uid()` à la table `merchants` à la première connexion — implémenté via `/onboarding` (`lib/actions/onboarding.ts`).
