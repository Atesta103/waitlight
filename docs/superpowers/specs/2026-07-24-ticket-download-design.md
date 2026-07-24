# Ticket téléchargeable — design

**Date :** 2026-07-24
**Statut :** Validé, prêt pour implémentation

## Contexte

Un client qui rejoint une file d'attente n'a aujourd'hui aucun moyen fiable de retrouver son ticket s'il perd l'accès à son navigateur d'origine (nouveau téléphone, cache vidé). Le seul filet de sécurité durable est le couple prénom + code de récupération à 4 caractères affiché sur `/wait`, qu'il faut retenir ou noter à la main.

Cette fonctionnalité ajoute un ticket téléchargeable — une image type carte d'embarquement, enregistrable dans la pellicule photo — qui porte toutes les infos nécessaires pour retrouver sa place depuis n'importe quel appareil, sans dépendre du navigateur d'origine.

Hors périmètre explicite : aucune information de prix (l'app ne gère pas la facturation côté client final).

## Architecture

Un nouveau composant autonome `TicketCard` dans `components/composed/TicketCard.tsx`, qui prend en props les données du ticket et du commerce et rend un visuel fixe (pas de state interne, pas d'appel réseau). Il est monté à l'intérieur d'une `Dialog` (composant déjà présent dans `components/ui/Dialog.tsx`, déjà utilisé ailleurs dans `WaitClient.tsx`), ouverte par un bouton **« Enregistrer mon ticket »** ajouté à `WaitClient.tsx`.

Le bouton est visible tant que `ticket.status` vaut `waiting` ou `called` — pas après `done`/`cancelled`, où le ticket n'a plus d'utilité à conserver.

Le téléchargement utilise `html-to-image` (nouvelle dépendance, légère, activement maintenue) pour capturer le nœud DOM de `TicketCard` et déclencher un export `.png`.

## Contenu du ticket

| Champ | Source | Notes |
|---|---|---|
| Nom du commerce | `merchant.name` | déjà disponible |
| Logo | `merchant.logo_url` | **à ajouter** au select de `page.tsx` et au type `Merchant` de `WaitClient.tsx` |
| Couleur de marque | `merchant.brand_color` | **à ajouter**, idem. Repli sur la couleur de marque par défaut de l'app si absente |
| Prénom du client | `ticket.customer_name` | déjà disponible |
| Numéro / position | state React existant (position en file) | **instantané figé** au moment du clic sur « Enregistrer » — jamais recalculé après coup, l'image ne ment pas sur une position qui aurait bougé |
| Heure d'arrivée | `ticket.joined_at` | déjà disponible, formatée en heure locale lisible |
| Code de récupération | `ticket.recovery_code` | déjà disponible, affiché en texte, gros, lisible |
| QR code | généré côté client avec `qrcode.react` (déjà une dépendance du projet, utilisée pour le QR de rejoindre la file) | voir section dédiée |

Repli logo absent : initiale du nom du commerce dans un badge, cohérent avec le motif déjà utilisé sur les pins de `/carte`.

## QR code et pré-remplissage de /retrouver

Le QR encode `/{slug}/retrouver?name={prénom}&code={code}` (valeurs encodées en URL). Un scan ouvre directement le formulaire de récupération existant, **pré-rempli** mais **pas auto-soumis** — le client garde la main, confirme, et clique lui-même sur « Retrouver ma place ». Pas de soumission automatique pour éviter tout comportement surprenant si le QR est scanné par erreur ou par un tiers.

Modification requise dans `RecoverClient.tsx` : lecture de `useSearchParams()` pour initialiser `customerName` et `code` avec les valeurs de la query string, si présentes. Aucun changement nécessaire côté `page.tsx` (server component), le parsing reste client-side.

Le code de récupération reste imprimé en texte clair sur le ticket, gros et lisible, comme repli si le client ne peut pas scanner (appel téléphonique au commerce, autre appareil sans caméra).

## Gestion d'erreur

Si l'export `html-to-image` échoue (navigateur ancien, restriction canvas, `toPng()` qui rejette) :
- Le bouton de téléchargement affiche un message d'erreur inline dans la `Dialog` (« Impossible de générer l'image, réessayez ou notez le code ci-dessous »).
- Le contenu de `TicketCard` reste visible à l'écran dans tous les cas — le client peut toujours lire son code et le noter à la main même si l'export échoue.
- Aucune tentative de repli automatique vers un autre format (pas de PDF, pas de partage natif) — hors périmètre pour cette itération.

## Composants et fichiers touchés

**Nouveau :**
- `components/composed/TicketCard.tsx` — le visuel du ticket
- `stories/composed/TicketCard.stories.tsx` — story Storybook, cas avec/sans logo, nom long/court

**Modifiés :**
- `app/[slug]/wait/[ticketId]/WaitClient.tsx` — bouton « Enregistrer mon ticket », état d'ouverture de la Dialog, logique d'export
- `app/[slug]/wait/[ticketId]/page.tsx` — ajout de `logo_url`, `brand_color` au select des merchants
- `app/[slug]/retrouver/RecoverClient.tsx` — pré-remplissage depuis `useSearchParams()`
- `package.json` — ajout de `html-to-image`

## Tests

- Rendu de `TicketCard` avec logo présent / absent (repli initiale)
- Formatage de l'heure d'arrivée
- `RecoverClient` : pré-remplissage correct depuis les query params, absence de soumission automatique, comportement inchangé quand les params sont absents
- Pas de test automatisé sur l'export PNG lui-même (dépendant du DOM réel / canvas, hors de portée raisonnable pour la suite de tests actuelle) — vérification manuelle en navigateur

## Hors périmètre (explicitement exclu)

- Apple/Google Wallet
- Envoi par email/SMS du ticket
- Génération côté serveur de l'image
- Toute information de prix ou de facturation
- Auto-soumission du formulaire de récupération au scan du QR
