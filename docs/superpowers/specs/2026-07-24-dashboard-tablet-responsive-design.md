# Dashboard sans scroll de page, à toute taille d'écran — design

**Date :** 2026-07-24, révisé 2026-08-05
**Statut :** Validé, prêt pour implémentation

## Révision du 2026-08-05

Le périmètre initial (ci-dessous, section « Contexte ») ne couvrait que `lg:` et plus, avec mobile et tablette portrait explicitement exclus. Après un premier passage limité à `lg:`, décision prise d'étendre le principe à **toutes les tailles d'écran** : desktop, tablette paysage, tablette portrait et téléphone doivent tous éviter le scroll de la page entière, avec uniquement la liste des tickets qui défile en interne. Le reste de ce document est mis à jour en conséquence.

## Contexte

Le dashboard marchand (file d'attente + panneau QR) est appelé à rester ouvert toute la journée, posé au comptoir sur des appareils de tailles très diverses — desktop, tablette (paysage et portrait), téléphone. La mise en page suivait le flux naturel du document : dès que le contenu dépassait la hauteur de l'écran, toute la page défilait — gênant sur un poste censé fonctionner comme un écran de contrôle fixe, à n'importe quelle taille.

Trois seuils structurent la nouvelle mise en page, choisis pour rester cohérents avec ceux déjà utilisés ailleurs dans ce layout (l'en-tête bascule déjà en navigation desktop à `md:`) :
- **`< md:` (< 768px, téléphone)** — écran court, pas assez de place pour le panneau QR et la liste en même temps sans compromis. Bascule sur deux onglets (« File d'attente » / « QR code ») ; l'onglet actif remplit l'espace disponible, la liste défile en interne dans son onglet.
- **`md:` à `< lg:` (768–1023px, tablette portrait)** — assez de hauteur pour empiler le panneau QR (compact, en haut) et la liste (en dessous, remplissant le reste), sans scroll de page.
- **`lg:` et plus (≥ 1024px, tablette paysage + desktop)** — disposition à deux colonnes existante (file à gauche, QR à droite), inchangée dans son principe.

## Périmètre

**Dans le périmètre :**
- La page principale du dashboard (file d'attente + panneau QR) — `app/(dashboard)/layout.tsx`, `QueueSection.tsx`, `QueueList.tsx`.
- Comportement actif à **toutes** les tailles d'écran : plus aucun scroll de la page entière, uniquement la liste des tickets défile en interne.

**Hors périmètre (décision explicite) :**
- Réglages (`dashboard/settings`) — page de formulaire longue, le scroll y est normal et attendu.
- Analytiques — graphiques de hauteur variable, pas un écran à garder ouvert toute la journée de la même façon.
- L'affichage QR plein écran (`qr-display`, `/qr`) — déjà construit correctement pour ce besoin : contenu compact et centré dans un conteneur `fixed inset-0 min-h-dvh flex items-center justify-center`. Aucun changement nécessaire.

## Architecture

Motif « coquille d'app », désormais actif à toute taille d'écran (plus de gating `lg:` sur la coquille elle-même) : le chrome (en-tête, panneau QR) garde sa hauteur naturelle et ne bouge jamais ; seule la liste des tickets devient une zone qui défile en interne si son contenu dépasse l'espace disponible.

**`app/(dashboard)/layout.tsx`** — le conteneur racine (`#dashboard-root`) est en permanence une colonne flex de hauteur `100dvh` (`dvh` plutôt que `vh` : s'ajuste correctement à la barre d'interface de Safari sur iPad/iPhone, qui peut apparaître/disparaître), avec `overflow-hidden`. L'en-tête (`shrink-0`) garde sa taille naturelle ; `<main>` prend le reste de l'espace disponible (`flex-1 min-h-0 overflow-y-auto`). Ce `overflow-y-auto` sur `<main>` sert de filet générique : il garde Réglages et Analytiques (hors périmètre) parfaitement identiques à avant — ils défilent toujours, juste dans cette boîte plutôt que sur toute la page — pendant que sur la page de file, rien ne déborde jamais de `<main>` puisque `QueueList` absorbe le débordement plus bas dans la chaîne.

**`QueueSection.tsx`** — refonte de la disposition, trois variantes selon la largeur :
- **`< md:`** — un sélecteur d'onglets (composant `Tabs` existant, `components/ui/Tabs.tsx`) au-dessus, visible uniquement sous `md:`. Seul le panneau de l'onglet actif (file ou QR) est affiché, rempli à toute la hauteur disponible.
- **`md:` à `< lg:`** — grille à une colonne, deux lignes (`grid-rows-[auto_1fr]`) : panneau QR compact en haut (hauteur naturelle), liste en dessous remplissant le reste.
- **`lg:` et plus** — grille à deux colonnes (`grid-cols-[1fr_auto]`), comportement déjà existant, inchangé.

La taille du QR code (`QRCodeDisplay`, prop `size` en pixels, non redimensionnable par CSS) s'adapte via le hook `useMediaQuery` déjà présent dans le code (`lib/hooks/use-media-query.ts`, jusqu'ici inutilisé) : compact en dessous de `lg:` (onglet mobile et bandeau tablette portrait), taille pleine à `lg:` et plus — le desktop garde exactement son rendu d'avant.

**`QueueList.tsx`** — le conteneur de la liste (`role="list"`) est **en permanence** `overflow-y-auto` avec une hauteur héritée (`min-h-0 flex-1`), à toute taille d'écran désormais (plus de gating `lg:`). L'écusson de compteur, la bannière de connexion et l'état vide restent hors de la zone scrollable, toujours visibles.

## Comportement attendu

- **Téléphone (`< md:`)** — deux onglets « File d'attente » / « QR code ». Changer d'onglet ne recharge rien, juste une bascule d'affichage. L'onglet actif occupe tout l'espace ; si la liste est longue, elle défile en interne dans son onglet.
- **Tablette portrait (`md:`–`lg:`)** — QR compact toujours visible en haut, liste en dessous qui défile en interne si nécessaire.
- **Tablette paysage / desktop (`lg:`+)** — comportement déjà en place : deux colonnes côte à côte, liste à gauche qui défile en interne, panneau QR à droite toujours visible.
- **Aucune taille d'écran** ne doit plus jamais faire défiler la page entière sur cette page.
- **Redimensionnement / rotation d'écran** : purement CSS pour la mise en page (media queries Tailwind) ; seule la taille du QR dépend d'un hook JS (`useMediaQuery`), qui se met à jour automatiquement au redimensionnement.

## Composants et fichiers touchés

**Modifiés :**
- `app/(dashboard)/layout.tsx`
- `app/(dashboard)/dashboard/QueueSection.tsx`
- `components/sections/QueueList.tsx`

**Non modifiés (vérifiés conformes) :**
- `app/(dashboard)/dashboard/qr-display/page.tsx`
- `components/composed/QrFullscreenDisplay.tsx`

**Réutilisés (déjà existants, jusqu'ici inutilisés dans ce contexte) :**
- `components/ui/Tabs.tsx`
- `lib/hooks/use-media-query.ts`

## Tests

Comportement essentiellement CSS, piloté par des seuils de largeur — pas de logique testable unitairement au sens de ce projet (pas de `@testing-library/react`, convention déjà établie). Vérification manuelle sur le Preview de `dev`, à au moins quatre tailles, avec suffisamment de tickets pour dépasser l'espace disponible à chacune :
- **≤ 767px** (téléphone) — onglets fonctionnels, aucun scroll de page, liste défile dans son onglet.
- **768–1023px** (tablette portrait) — QR compact en haut + liste en dessous, aucun scroll de page.
- **1024×768** (tablette paysage, le seuil le plus serré) — deux colonnes, aucun scroll de page.
- **Desktop large** — rendu identique à avant ce chantier.
- **Réglages et Analytiques**, à une taille intermédiaire (ex. 1024×768) — défilement normal inchangé, non cassé par le `overflow-y-auto` générique sur `<main>`.

## Hors périmètre (explicitement exclu)

- Réglages, Analytiques, toute page hors du dashboard principal.
- Mesure de hauteur par JavaScript (ResizeObserver ou équivalent) — seule la taille du QR utilise un hook JS, jamais la mise en page elle-même.
