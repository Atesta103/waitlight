# Code Quality, Automations & Storybook Blueprint

Ce document résume l'ensemble des règles, des outils de qualité de code, du pipeline d'intégration continue et de la configuration Storybook mis en place sur le projet WaitLight. Il a pour but de servir de modèle afin de recréer rapidement ce socle technique robuste sur de futurs projets.

---

## 1. Règles et Qualité de Code

Le projet maintient une grande rigueur sur la propreté du code grâce à plusieurs outils complémentaires :

### 1.1. TypeScript & Typages
- Mode strictly typé imposé (`"strict": true` dans `tsconfig.json`).
- Commande de vérification statique sans build : `npm run typecheck` (`tsc --noEmit`).

### 1.2. ESLint
La configuration (`eslint.config.mjs`) est basée sur les standards de Next.js (`eslint-config-next/core-web-vitals` et `typescript`) augmentée de règles personnalisées :
- **Variables non utilisées** (`@typescript-eslint/no-unused-vars`) : Provoquent une erreur bloquante (au lieu d'un avertissement), mais ignorent les variables préfixées par un underscore `_`.
- Fichiers ciblés : `app/`, `components/`, `lib/`, `types/`.
- Fichiers ignorés : Dossiers de build (`.next`, `storybook-static`), documentations générées (`doc/api/`), et environnements locaux (`supabase/`).

## 2. Git Hooks & Convention de Commit (Husky)

Husky est configuré dans le dossier `.husky/` pour interagir avec les actions Git :

### 2.1. `pre-commit`
S'exécute avant chaque commit pour s'assurer que le code poussé est valide :
- Lance des scripts Node de validation maison (ex: `check-schema-migration.mjs` et `check-spec-completion.mjs`).
- Exécute `lint-staged` qui permet de ne vérifier que les fichiers actuellement stagés (gain de temps).
  - *Dans le `package.json`*, `lint-staged` déclenche `check-dead-exports.mjs` sur les fichiers `.ts/tsx` et régénère un classement des specs pour les fichiers `.md`.

### 2.2. `commit-msg`
S'assure que les messages de commit sont normalisés.
- Utilise **commitlint** (`@commitlint/cli` + `@commitlint/config-conventional`).
- Oblige le développeur à utiliser des préfixes sémantiques tels que `feat:`, `fix:`, `chore:`, `docs:`, etc.

## 3. Tests & Vérification

### 3.1. Vitest
- Configuré pour les tests unitaires et composants (`vitest.config.ts`, `vitest.unit.config.ts`).
- Scripts disponibles :
  - `npm run test` et `npm run test:watch`.
  - `npm run test:storybook` (utilisation de Vitest pour lancer les tests associés aux interactions Storybook).

## 4. Design System & Storybook

La centralisation des composants de l'interface graphique est gérée par **Storybook**.

### 4.1. Framework & Addons
- **Framework** : `@storybook/react-vite`. L'usage de Vite pour Storybook accélère considérablement les temps de build et de rafraîchissement.
- **Addons installés** : `@storybook/addon-essentials`, `@storybook/addon-interactions`, `@storybook/blocks`, et `@storybook/nextjs`.

### 4.2. Configuration principale (`.storybook/main.ts`)
- Scanne les fichiers terminant par `.stories.tsx` dans `components/` et `stories/`.
- Définit le mapping d'alias (`@/`) dans sa configuration `viteFinal` pour relier proprement Storybook à la structure de Next.js.
- Expose le contenu de `public/` en tant que répertoire statique (`staticDirs`).

### 4.3. Aperçu & Environnement (`.storybook/preview.ts`)
- Mocks explicites des variables d'environnement (`window.process.env.NEXT_PUBLIC_BASE_URL`) pour éviter les plantages de composants client-side.
- Importation du fichier CSS global (`app/globals.css`), permettant à Tailwind de fonctionner instantanément.
- Configuration des fonds d'écran (clair, blanc, sombre) et de la méthode de rendu (centré).

### 4.4. Chromatic
Outil de référence lié à Storybook pour le déploiement continu et les tests de non-regression visuelle (VRT - Visual Regression Testing).
- Script NPM : `npx chromatic --exit-once-uploaded`.

## 5. Intégration Continue (GitHub Actions)

Les workflows sont découpés de manière granulaire dans le dossier `.github/workflows/` pour exécuter exactement ce qui est nécessaire :

### 5.1. `app-ci.yml`
Pipeline de l'application Next.js :
1. Vérification du contrat (UI contract)
2. Linting complet
3. Typechecking
4. Tests unitaires
5. Build test de l'application Next.js.

### 5.2. `design-system.yml` & `chromatic.yml`
- `design-system.yml` valide le build et le linting spécifiquement pour la partie Design System.
- `chromatic.yml` lance les vérifications visuelles via Chromatic à chaque PR modifiant l'interface ou les composants.

---

## 📌 Synthèse de la Stack à installer pour un nouveau projet

1. **Typer et Nettoyer** : `typescript`, `eslint`, `eslint-config-next`
2. **Standardiser Git** : `husky`, `lint-staged`, `@commitlint/cli`, `@commitlint/config-conventional`
3. **Tester** : `vitest`, `@vitest/ui`
4. **Isoler et Documenter l'UI** : `storybook`, addons essentiels, intégration avec `vite`
5. **Prévenir la régression visuelle** : `chromatic`
6. **Automatiser** : Fichiers YAML GitHub Actions pour orchestrer Lint + Tests + Build + Déploiement Storybook.
