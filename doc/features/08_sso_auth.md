# 8. Authentification Multicanal (SSO Google/Apple)

**Description** : Simplifier l'inscription des commerçants avec une authentification tiers rapide.

## Implémentation Backend
* Configuration stricte des fournisseurs dans le panneau d'administration de **Supabase Auth**. Aucune complexité côté serveur n'est ajoutée.

## Implémentation Frontend
* Remplacement des formulaires classiques par `supabase.auth.signInWithOAuth({ provider: 'google' })`.
