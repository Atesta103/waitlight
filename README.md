## Adresse de test SaaS

- URL site hébergé: `https://waitlight.fr`

## Accès de test (Environnement de production)
L'application propose deux méthodes d'authentification :

- Authentification Sociale : Connexion via Google Auth (Supabase).
- Authentification Classique : Inscription et connexion par email et mot de passe.

Vous pouvez créer votre propre compte marchand directement sur la page d'inscription.

### Simulation de paiement (Stripe)
Le système de facturation est actuellement configuré en mode test. Pour simuler une souscription premium sans frais réels, veuillez utiliser les identifiants de carte de test suivants lors du passage en caisse (Stripe Checkout) :

Numéro de carte : 4242 4242 4242 4242

Date d'expiration : Toute date future (ex : 12/28)

CVC : 123

Une fois le paiement validé, le webhook Stripe traite l'événement checkout.session.completed pour mettre à jour les droits de l'utilisateur dans la base de données Supabase en temps réel.

### En local : 
- Commande a lancé : `npm run dev`
- URL de test: `http://localhost:3000`

---

# Wait-Light

Wait-Light est un SaaS de gestion de file d'attente virtuelle (Scan and Go).

Objectif:

- Cote marchand: piloter la file en temps reel depuis le dashboard
- Cote client: scanner un QR code, rejoindre la file, suivre sa position et son temps d'attente

## Fonctionnalites principales

- Onboarding marchand
- Authentification (email/password + callback auth)
- Dashboard file d'attente (ouverture/fermeture, suivi, actions)
- Page publique client par slug marchand
- Temps d'attente estime
- Realtime via Supabase
- Parametrage visuel et metier
- Abonnement Stripe (checkout + webhooks)

## Stack technique

- Next.js (App Router)
- React + TypeScript strict
- Tailwind CSS
- TanStack Query
- Framer Motion
- Supabase (Postgres, Auth, Realtime)
- Stripe
- Vitest + Storybook

## Architecture (vue rapide)

```text
app/
	(auth)/            pages d'auth marchand
	(dashboard)/       pages protegees marchand
	[slug]/            pages publiques client
	api/               routes API (webhooks, etc.)

components/
	ui/                atoms
	composed/          molecules
	sections/          organisms

lib/
	actions/           server actions
	hooks/             hooks TanStack Query
	validators/        schemas Zod
	supabase/          clients browser/server/admin
```

## Prerequis

- Node.js 20+
- npm 10+
- Un projet Supabase
- Un compte Stripe (si vous testez la facturation)

## Installation locale

1. Installer les dependances:

```bash
npm install
```

2. Creer votre fichier d'environnement:

```bash
cp .env.example .env.local
```

3. Renseigner les variables dans `.env.local`

4. Lancer le serveur local:

```bash
npm run dev
```

5. Ouvrir:

- `http://localhost:3000`

## Variables d'environnement

Extrait principal (voir `.env.example` pour la liste complete):

```bash
# Supabase (public)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Supabase (server only)
SUPABASE_SERVICE_ROLE_KEY=

# Admin
ADMIN_EMAILS=admin@example.com,admin2@example.com

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PRICE_ID=
STRIPE_WEBHOOK_SECRET=

# Dev local
NEXT_PUBLIC_ENABLE_TEST_MODE="true"
```

## Scripts utiles

```bash
npm run dev            # Lancer en local
npm run build          # Build production
npm run start          # Demarrer la build
npm run lint           # Lint
npm run typecheck      # Verification TypeScript
npm run test           # Tests Vitest
npm run test:unit      # Tests unitaires
npm run storybook      # Storybook
npm run build-storybook
npm run docs           # Documentation TypeDoc
npm run gen:types      # Regenerer types Supabase
```

## Documentation projet

- `Spec.md`: specification fonctionnelle et technique
- `FLOWS.md`: parcours utilisateurs
- `AGENTS.md`: regles d'implementation et conventions
- `doc/architecture.md`: patterns Next.js/Supabase
- `doc/security.md`: checklist securite
- `doc/design-system.md`: tokens et regles UI
- `doc/accessibility.md`: exigences accessibilite

## Qualite et conventions

- TypeScript strict
- Validation des entrees via Zod
- Server Actions retournent `{ data } | { error: string }`
- Pas de cle service role cote client
- Realtime scope par identifiant metier