# 16. Site Vitrine (One-Page Landing)

## 1. Metadata

- Feature: Site Vitrine (Marketing Landing Page)
- Owner: Founding Team
- Status: `in-progress`
- Last updated: 2026-04-17
- Value to user: 5
- Strategic priority: 5
- Time to code: 3
- Readiness score: 100/100

---

## Business Value

Le site vitrine est le premier point de contact des futurs commerçants (merchants) avec Wait-Light. Inspiré du site **Medvi** (Bento Grid, Glassmorphism, typographie XXL), il doit convaincre en quelques secondes via un design premium et des démonstrations visuelles directes. Une structure « One-Page » fluide maximise le taux de conversion et réduit le taux de rebond.

---

## 2. Style Visuel & Direction Artistique

### 2.1 Mode & Palette

- **White mode uniquement** — pas de dark mode sur le site vitrine.
- Fond quasi-blanc : `#F8F9FA` (correspondant au token `surface-base` en mode light).
- La palette de couleurs existante du Design System (`brand-primary`, `brand-secondary`, etc.) est conservée.
- Les accents (`brand-primary`, `brand-secondary`) sont utilisés pour les CTA, les highlights et les icônes — jamais sur le fond principal.
- **Aucune valeur hex brute dans les composants** — toujours via les tokens Tailwind définis dans `tailwind.config.ts`.

### 2.2 Bento Grid & Glassmorphism

Le **Bento Grid** est le coeur visuel du site : une grille de boîtes de tailles différentes (inspirée du standard Framer/Medvi/Linear) pour présenter les fonctionnalités.

Chaque boîte utilise l'effet **Glassmorphism** :

```css
/* Template de base pour une carte Bento */
background: rgba(255, 255, 255, 0.65);
backdrop-filter: blur(16px);
border: 1px solid rgba(255, 255, 255, 0.4);
border-radius: 20px;
box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
```

> Ces valeurs doivent être extraites en tokens Tailwind (ex: `bento-card`) ou en classe utilitaire `cn()` réutilisable — **jamais inline** sauf pour des valeurs dynamiques d'animation.

**Disposition des cases (responsive, 12 colonnes) :**

| Case | Taille | Contenu |
|------|--------|---------|
| 1 (grande) | col-span-7 / row-span-2 | Mockup de l'interface client sur smartphone — image flottante animée |
| 2 (petite) | col-span-5 / row-span-1 | Animation de vibration du téléphone (icône + `useReducedMotion`) |
| 3 (moyenne) | col-span-5 / row-span-1 | Mini-graphique dynamique illustrant l'algorithme de calcul du temps |
| 4 (petite) | col-span-4 / row-span-1 | Zéro installation — icône QR Code + texte |
| 5 (petite) | col-span-4 / row-span-1 | Marque blanche — 3 logos de restaurants placeholder |
| 6 (petite) | col-span-4 / row-span-1 | Vibrations & Alertes — visuel de notification |

---

## 3. Structure de la Page (Sections)

### 3.1 Navigation (`MarketingNav`)

- Logo Wait-Light à **gauche**.
- Liens d'ancre au **centre** : Fonctionnalités · Tarifs · FAQ.
- Bouton `"Connexion"` (variant `ghost`) à **droite** + bouton `"Démarrer"` (variant `primary`) optionnel.
- Navigation sticky transparente qui obtient un fond blanc semi-opaque avec `backdrop-blur` au scroll.

### 3.2 Hero Section (`HeroSection`)

- **Titre gigantesque et centré (h1, heading-xl)** : `"L'attente devient un plaisir."`
- Sous-titre explicatif (1–2 lignes, `text-secondary`) : proposition de valeur en une phrase.
- **CTA principal** : bouton `"Démarrer l'essai gratuit"` avec un effet de **lueur (glow)** via `box-shadow` animé au hover — utiliser `brand-primary` pour la couleur du glow.
- **CTA secondaire** : `"Voir une démo"` en variant `ghost`.
- **Mockup flottant** : visuel de l'interface client (page `/[slug]/wait/[ticketId]`) dans un cadre de smartphone, avec une légère animation `y: [0, -12, 0]` en boucle (Framer Motion, `duration.slow`, `ease: easeInOut`) pour donner l'impression qu'il « sort » de l'écran.

> Le mockup est généré via `next/image` et doit être une vraie capture d'écran nettoyée de l'interface actuelle, mise dans un cadre SVG de téléphone.

### 3.3 Bento Grid Features (`BentoFeaturesGrid`)

Voir la disposition détaillée en section 2.2.

**Micro-animations au survol (hover) :**

- **Case Notification (vibration)** : au `onMouseEnter`, l'icône du smartphone effectue une animation `rotate: [-3, 3, -3, 0]` rapide (150ms par cycle, 2 cycles) — Framer Motion. **Toujours wrapper avec `useReducedMotion()`.**
- **Case Algorithme** : au `onMouseEnter`, une petite barre de progression (`<motion.div>`) avance de 0 % à 100 % en 800ms puis se réinitialise — simule le calcul du temps d'attente.
- **Toutes les cases** : `scale: 1.02` au hover avec `transition: duration.fast`.

### 3.4 Section « Comment ça marche » (`StepsHowItWorks`)

3 étapes visuelles, très linéaires et propres, reliées par un trait horizontal ou des flèches :

1. **Scan** — Le client scanne le QR Code.
2. **Attente** — Il suit sa position en temps réel sur son téléphone.
3. **Récupération** — Il est notifié et récupère sa commande/son tour.

Layout : `flex-row` sur desktop, `flex-col` sur mobile. Chaque étape est une carte minimaliste avec un numéro en grand, une icône, et 1–2 lignes de texte.

### 3.5 Tarification (`PricingSection`)

Cartes de prix épurées, inspirées du style Medvi :

- 3 plans maximum (Free, Pro, Enterprise ou équivalent).
- Plan recommandé mis en avant avec un badge et une ombre plus prononcée.
- Prix clairs, fonctionnalités listées avec des coches (`✓`).
- CTA par plan : `"Commencer"` (primary) ou `"Nous contacter"` (ghost).

### 3.6 FAQ & Footer

- **FAQ** : accordéon simple (Radix UI Accordion si déjà installé, sinon `<details>/<summary>` natif) — 5 à 7 questions courantes.
- **Footer** : liens légaux (CGU, Politique de confidentialité), copyright, liens réseaux sociaux.

---

## 4. Cas Concrets (Use Cases)

Ces cas restent dans la doc pour guider le contenu textuel des sections et cartes, mais ne nécessitent **pas** une section dédiée supplémentaire sur la page (ils peuvent être intégrés dans la Bento Grid ou la section « Comment ça marche »).

### 4.1 Restauration (Food Truck, Fast Food, Brasserie)
**Problème** : Clients amassés devant le comptoir ou bipeurs coûteux.
**Solution** : Scan → assis/se promener → vibration quand le plat est prêt.

### 4.2 Santé (Médecin, Clinique)
**Problème** : Salles d'attente bondées et anxiogènes.
**Solution** : Scan à l'accueil → attente en voiture → notification quand le médecin est prêt.

### 4.3 Retail & Administrations (SAV, Préfecture)
**Problème** : 45+ minutes debout, perte d'opportunités d'achat.
**Solution** : Ticket digital → shopping libre → notification quand le conseiller est dispo.

### 4.4 Événementiel & Loisirs (Parcs, Festivals)
**Problème** : Files interminables pour attractions ou food-trucks.
**Solution** : File virtuelle → mini-jeux intégrés (Snake, 2048) → appel au bon moment.

---

## 5. Definition of Done

- [ ] `app/page.tsx` est un **Server Component** pur — `"use client"` uniquement dans des wrappers d'animation isolés.
- [ ] `MarketingNav` : sticky, transparent → blur/blanc au scroll.
- [ ] `HeroSection` : titre h1, CTA avec glow, mockup flottant animé.
- [ ] `BentoFeaturesGrid` : grille 6 cases, Glassmorphism, responsive 12 colonnes.
- [ ] Micro-animations hover sur les cases Notification et Algorithme, avec `useReducedMotion()`.
- [ ] `StepsHowItWorks` : 3 étapes, linear et propre.
- [ ] `PricingSection` : 3 plans, cartes épurées, plan recommandé mis en avant.
- [ ] FAQ (accordéon) + Footer complet.
- [ ] **White mode uniquement** — aucune logique dark mode.
- [ ] `next/image` pour tous les mockups et illustrations.
- [ ] Balises `metadata` Next.js configurées (title, description, OpenGraph).
- [ ] Responsive 320px → desktop.
- [ ] Toutes les chaînes de caractères sont des clés `next-intl` (pas de texte français hardcodé).
- [ ] Chaque animation respecte `useReducedMotion()`.

---

## 6. Technical Details

### 6.1 Structure des Composants

Nouveaux composants dans `components/sections/marketing/` :

```
MarketingNav.tsx          ← Navigation sticky
HeroSection.tsx           ← Hero + CTA + mockup flottant
BentoFeaturesGrid.tsx     ← Bento Grid 6 cases + Glassmorphism
BentoCard.tsx             ← Atome réutilisable pour chaque case Bento
StepsHowItWorks.tsx       ← Section 3 étapes
PricingSection.tsx        ← Cartes de tarifs
FaqSection.tsx            ← Accordéon FAQ
MarketingFooter.tsx       ← Footer légal
```

### 6.2 Performances & SEO

- `app/page.tsx` : Server Component. Zéro fetch client.
- `next/image` obligatoire pour le mockup du Hero et la case « Marque blanche ».
- `generateMetadata` dans `app/page.tsx` :
  - Title : `"Wait-Light — La file d'attente digitale pour votre commerce"`
  - Description : cibler « file d'attente digitale », « logiciel file d'attente »
  - OpenGraph : image du mockup Hero

### 6.3 UX / UI

- Smooth scrolling via `scroll-behavior: smooth` (CSS global) et ancres `#features`, `#pricing`, `#faq`.
- Fond de page : `bg-[#F8F9FA]` (token `surface-base` light) — **jamais de `bg-white` pur**.
- Espacements : généreux (`py-24`, `py-32` entre les sections) pour un rendu aéré.
- Police : conforme au Design System (`font-sans` → Inter ou équivalent).
- `cn()` pour toute composition de classes conditionnelles.

### 6.4 Animation Rules

- Framer Motion uniquement pour des transitions **signifiantes** (hover, scroll reveal).
- Les animations de scroll reveal (fade-in au scroll) sont autorisées sur cette page marketing — uniquement sur les sections Bento et Steps.
- Tous les composants animés doivent vérifier `useReducedMotion()` et désactiver l'animation si `true`.
- Aucune animation au premier rendu de la page (pas de page intro / splash).

---

## 7. Open Questions

> Ces points doivent être tranchés avant de commencer le code.

- **Mockup Hero** : Utiliser une vraie capture d'écran de `/[slug]/wait/[ticketId]` ou un mockup SVG stylisé ? → Préférence : vraie capture dans un cadre SVG de smartphone.
- **Marque blanche (Case 5)** : Les 3 logos de restaurants sont-ils réels ou des placeholders générés ? → Placeholders pour l'instant.
- **Pricing** : Les plans définitifs sont-ils dans `Spec.md` ? → Vérifier avant d'implémenter.
- **FAQ** : Radix UI Accordion est-il déjà installé dans le projet ? → Vérifier `package.json`.