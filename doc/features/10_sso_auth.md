# Feature 10: Authentification Multicanal (SSO Google/Apple)

* **Type** : Évolution de conversion (Evolution)
* **Dépendances** : [Feature 01: Authentification & Gestion de compte](./01_merchant_auth.md)

**Description** : Simplifier l'inscription des commerçants avec une authentification tiers rapide (Social Login). Cela réduit la friction à l'inscription.

## Sous-tâches d'intégration

### Backend (Supabase)
- [ ] Activer les fournisseurs Google et Apple dans le panneau d'administration de **Supabase Auth**.
- [ ] Récupérer les identifiants OAuth auprès de Google (Google Cloud Console) et Apple (Developer Portal) et les lier à Supabase.
- [ ] S'assurer que le trigger de création automatique du profil `merchants` fonctionne aussi avec les connexions sociales (OAuth).

### Frontend (Next.js)
- [ ] Ajouter les boutons "Continuer avec Google" et "Continuer avec Apple" sur la page `/(auth)/login` et `/(auth)/register`.
- [ ] Lier les boutons avec la méthode `supabase.auth.signInWithOAuth({ provider: 'google' })`.
- [ ] Gérer les erreurs de redirection d'authentification (ex: refus OAuth) dans l'URL.
