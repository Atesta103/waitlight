# Flux Utilisateurs — Wait-Light

Ce document décrit les 3 flux critiques de l'application. Ils doivent être validés avant tout développement pour s'assurer que les routes, le modèle de données et les composants sont bien alignés.

---

## Flux 1 — Onboarding Marchand

```
[Page /]  →  Clic "Créer mon établissement"
    ↓
[/login]  →  Inscription email/mot de passe (Supabase Auth)
    ↓
[/onboarding]
  1. Renseigner le nom du commerce
  2. Choisir un slug unique (ex: "boulangerie-martin")
     → Vérification en temps réel de la disponibilité (RPC Supabase)
  3. Configurer la capacité max et le message d'accueil
    ↓
  INSERT INTO merchants + INSERT INTO settings
    ↓
[/dashboard]  ←  Redirection automatique
  → Affichage du QR Code généré depuis le slug
  → Bouton "Télécharger le QR Code" (PNG)
  → Bouton "Ouvrir la file" (UPDATE merchants SET is_open = true)
```

**Points d'attention :**

- Le slug doit être validé avec Zod (lowercase, alphanumerique, tirets uniquement, 3-50 chars).
- Si le slug est déjà pris, afficher un message d'erreur inline — pas de toast.
- L'étape onboarding n'est présentée qu'une seule fois (redirection directe vers `/dashboard` si `merchant` existe déjà pour l'`auth.uid()`).

---

## Flux 2 — Client rejoint la file

```
[Client scanne le QR Code]
    ↓
[/[slug]]  →  Page SSR
  ├─ Si commerce inexistant → 404 personnalisée
  ├─ Si is_open = false → Page "File fermée"
  ├─ Si file pleine (count >= max_capacity) → Page "File complète"
  └─ Sinon → Affichage du temps d'attente estimé + bouton "Rejoindre"
    ↓
[/[slug]/join]  →  Formulaire CSR
  1. Saisie du prénom (ou surnom)
  2. Consentement RGPD (checkbox obligatoire)
  3. (Optionnel) Demande de permission pour les notifications Web Push
    ↓
  Validation Zod côté serveur (Edge Function)
    ↓
  INSERT INTO queue_items (status: 'waiting')
    ↓
  Si permission Push accordée → INSERT INTO push_subscriptions
    ↓
  UUID du ticket stocké dans localStorage (clé : waitlight_ticket_{slug})
    ↓
[/[slug]/wait/[ticketId]]  →  Redirection automatique
```

**Points d'attention :**

- Si l'utilisateur a déjà un ticket valide (`waiting` ou `called`) en localStorage pour ce slug, rediriger directement vers `/wait/[ticketId]` sans repasser par le formulaire.
- La permission Web Push est demandée **après** l'inscription (pattern UX recommandé : ne jamais demander la permission au chargement initial).
- Le formulaire doit être soumis via une Edge Function, pas directement via le client Supabase, pour permettre le rate limiting par IP.

---

## Flux 3 — Client suit sa position & est appelé

```
[/[slug]/wait/[ticketId]]  →  Page CSR + Realtime
    ↓
  Chargement initial (TanStack Query) :
    - GET ticket (RLS : uniquement le sien)
    - GET position (RPC get_position)
    ↓
  Abonnement Realtime :
    supabase.channel(`queue:merchant_id=eq.${merchantId}`)
    → Sur chaque changement → invalidateQueries(['queue', ticketId])
    ↓
  ┌─ Affichage en temps réel ─────────────────────────────┐
  │  "Vous êtes en position X"                             │
  │  "Temps d'attente estimé : ~Y minutes"                 │
  │  Animation Framer Motion lors du passage X → X-1       │
  │  Screen Wake Lock actif (+ fallback vidéo 1×1px)       │
  └───────────────────────────────────────────────────────┘
    ↓
  [Marchand appuie "Appeler suivant" dans /dashboard]
    ↓
  UPDATE queue_items SET status = 'called', called_at = NOW()
    ↓  (déclenche le Realtime)
  ┌─ Côté client ──────────────────────────────────────────┐
  │  Notification Web Push (si accordée)                   │
  │  OU AudioContext beep + navigator.vibrate([200,100])   │
  │  Affichage : "C'EST VOTRE TOUR ! Présentez-vous."      │
  │  Animation d'entrée Framer Motion (scale + couleur)    │
  └───────────────────────────────────────────────────────┘
    ↓
  [Marchand appuie "Terminer" OU timeout 5 min]
    ↓
  UPDATE queue_items SET status = 'done', done_at = NOW()
    ↓
  Trigger recalcule avg_wait_time dans merchants
    ↓
  Page client → Affichage : "Merci ! Bonne journée." → Nettoyage localStorage
```

**Gestion de la perte de connexion :**

```
Connexion perdue
    ↓
Bannière : "Connexion perdue — Reconnexion en cours..."
    ↓
Tentative toutes les 5s (backoff × 2, max 30s)
    ↓
Reconnexion réussie → Rafraîchissement forcé des données (invalidateQueries)
                    → Bannière disparaît
```

---

## Flux 4 — Tableau de bord Marchand (temps réel)

```
[/dashboard]  →  SSR initial (liste des tickets en cours)
    ↓
  Abonnement Realtime sur sa propre file (merchant_id filtré)
    ↓
  ┌─ Affichage ───────────────────────────────────────────┐
  │  Liste ordonnée des tickets 'waiting'                  │
  │  Bouton "Appeler [Prénom]" → UPDATE status = 'called'  │
  │  Bouton "Annuler" → UPDATE status = 'cancelled'        │
  │  Toggle "Ouvrir/Fermer la file" → UPDATE is_open       │
  │  Compteur en temps réel : X personnes en attente       │
  └───────────────────────────────────────────────────────┘
    ↓
  Clic "Appeler le suivant"
    → UPDATE queue_items SET status = 'called' WHERE id = [premier ticket]
    → Edge Function envoie la notification Web Push au client concerné
```

**Points d'attention :**

- Le marchand ne peut appeler qu'**un seul client à la fois** : le bouton "Appeler" est désactivé s'il existe déjà un ticket en `status = 'called'`.
- La fermeture de la file (`is_open = false`) n'annule pas les tickets existants — elle empêche seulement de nouveaux INSERTs.
- Les données du dashboard sont protégées par RLS : le marchand ne voit **que** les tickets de son `merchant_id`.
