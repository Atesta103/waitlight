# Dashboard sans scroll sur tablette paysage — design

**Date :** 2026-07-24
**Statut :** Validé, prêt pour implémentation

## Contexte

Le dashboard marchand (file d'attente + panneau QR) est appelé à rester ouvert toute la journée sur une tablette posée au comptoir, le plus souvent en orientation paysage. Aujourd'hui, la mise en page suit le flux naturel du document : dès que la liste de tickets dépasse la hauteur de l'écran, toute la page défile — un petit scroll gênant sur un poste censé fonctionner comme un écran de contrôle fixe.

Le seuil de largeur `lg:` (1024px, valeur par défaut de Tailwind v4, non surchargée dans ce projet) est déjà celui qui fait passer `QueueSection` d'un empilement vertical à deux colonnes (file à gauche, QR à droite) — c'est la largeur d'une tablette en paysage, la plus petite incluse (iPad classique : 1024×768). Ce seuil existant sert de base au reste de ce design plutôt que d'en introduire un nouveau.

## Périmètre

**Dans le périmètre :**
- La page principale du dashboard (file d'attente + panneau QR) — `app/(dashboard)/layout.tsx`, `QueueSection.tsx`, `QueueList.tsx`.
- Comportement activé uniquement à partir de `lg:` (1024px) — mobile et tablette portrait restent inchangés, scroll de page normal comme aujourd'hui.

**Hors périmètre (décision explicite) :**
- Réglages (`dashboard/settings`) — page de formulaire longue, le scroll y est normal et attendu.
- Analytiques — graphiques de hauteur variable, pas un écran à garder ouvert toute la journée de la même façon.
- L'affichage QR plein écran (`qr-display`, `/qr`) — déjà construit correctement pour ce besoin : contenu compact et centré dans un conteneur `fixed inset-0 min-h-dvh flex items-center justify-center`. Aucun changement nécessaire.
- Mobile/tablette portrait (< `lg:`) — aucun changement de comportement.

## Architecture

Motif « coquille d'app » : le chrome (en-tête, panneau QR) garde sa hauteur naturelle et ne bouge jamais ; seule la liste des tickets devient une zone qui défile en interne si son contenu dépasse l'espace disponible. Activé exclusivement à partir de `lg:`, via les préfixes responsive de Tailwind — aucune media query JS, aucune mesure de hauteur par script.

**`app/(dashboard)/layout.tsx`** — à partir de `lg:`, le conteneur racine (`#dashboard-root`) passe en colonne flex de hauteur `100dvh` (`dvh` plutôt que `vh` : s'ajuste correctement à la barre d'interface de Safari sur iPad, qui peut apparaître/disparaître). L'en-tête (`shrink-0`) garde sa taille naturelle ; `<main>` prend le reste de l'espace disponible (`flex-1 min-h-0` — le `min-h-0` est nécessaire pour qu'un enfant flex accepte de rétrécir sous sa taille de contenu naturelle, sinon le débordement ne serait jamais transmis au conteneur scrollable interne).

**`QueueSection.tsx`** — la grille à deux colonnes (`lg:grid-cols-[1fr_auto]`) devient elle-même une colonne flex de hauteur pleine à partir de `lg:` (`lg:h-full lg:min-h-0`), pour que la hauteur imposée par `layout.tsx` se propage jusqu'à `QueueList`. Le panneau QR (colonne de droite) garde sa hauteur naturelle, non concerné par le scroll interne.

**`QueueList.tsx`** — à partir de `lg:`, le conteneur de la liste (`role="list"`) devient `overflow-y-auto` avec une hauteur héritée (`min-h-0 flex-1`). L'écusson de compteur, la bannière de connexion et l'état vide restent hors de la zone scrollable, toujours visibles.

**Densité verticale à `lg:`** — resserrement mineur des espacements (`gap-6` → `gap-4` entre sections, `py-8` → `py-4` sur le padding de `<main>`) pour redonner de la place utile à la liste sans changer son apparence en dessous de `lg:`.

## Comportement attendu

- **Peu de tickets** (la liste tient dans l'espace disponible) : aucun changement visuel, pas de barre de défilement visible, la liste occupe sa hauteur naturelle en haut de la zone.
- **Beaucoup de tickets** (la liste dépasse l'espace disponible) : seule la liste défile ; en-tête, compteur, panneau QR et boutons restent visibles et figés en permanence.
- **Redimensionnement / rotation d'écran** : purement CSS, s'adapte immédiatement sans réaction JS ni flash.

## Composants et fichiers touchés

**Modifiés :**
- `app/(dashboard)/layout.tsx`
- `app/(dashboard)/dashboard/QueueSection.tsx`
- `components/sections/QueueList.tsx`

**Non modifiés (vérifiés conformes) :**
- `app/(dashboard)/dashboard/qr-display/page.tsx`
- `components/composed/QrFullscreenDisplay.tsx`

## Tests

Comportement CSS pur, piloté par des seuils de largeur (`lg:`) — pas de logique testable unitairement au sens de ce projet (pas de `@testing-library/react`, cf. convention déjà établie pour `TicketDownloadCard`). Vérification manuelle sur le Preview de `dev`, à au moins deux tailles :
- Fenêtre redimensionnée à 1024×768 (iPad paysage classique, le seuil le plus serré) avec suffisamment de tickets pour dépasser l'espace disponible — la page ne doit pas défiler, seule la liste.
- Fenêtre sous 1024px de large (ou DevTools en mode tablette portrait / mobile) — comportement strictement identique à aujourd'hui, scroll de page normal.

## Hors périmètre (explicitement exclu)

- Réglages, Analytiques, toute page hors du dashboard principal.
- Tout changement de comportement en dessous de `lg:`.
- Mesure de hauteur par JavaScript (ResizeObserver ou équivalent).
