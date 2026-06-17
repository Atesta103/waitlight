# Module Jeux — Logique

## Jeux solo (Snake, Flappy, 2048)

Entièrement autonomes, aucune connexion réseau. La boucle de rendu tourne à 60 fps via `useAnimationFrame`. Quand la partie se termine, `GameResultModal` s'affiche.

---

## Jeux multijoueur (Connect4, TicTacToe, BombParty)

### 1. Trouver un adversaire — `MultiplayerLobby.tsx`

- **Créer** : génère un code de salon interne (ex: `X3KP`), s'annonce sur un canal Supabase **Presence** (`lobby:{merchantId}:{gameType}`), puis attend l'événement `player_joined` → démarre en Joueur 1.
- **Rejoindre** : voit les parties ouvertes en temps réel via ce même canal Presence, clique sur une partie → envoie `player_joined` en broadcast → démarre en Joueur 2.

> Les codes de salon ne sont jamais affichés à l'utilisateur, ils servent uniquement à nommer les canaux Supabase de façon unique.

### 2. Pendant la partie — `useGameChannel.ts`

Les coups passent par un canal Supabase **Broadcast** (`{gameType}:{merchantId}:{roomCode}`).

```ts
const { broadcast } = useGameChannel({
    channelName: `connect4:${merchantId}:${roomCode}`,
    onMessage: (payload) => { /* traiter le coup adverse */ },
})

broadcast({ type: "move", col: 3 }) // envoyer un coup
```

- `self: false` : un joueur ne reçoit pas ses propres messages.
- Le canal se désinscrit automatiquement au démontage du composant.

### Flux résumé

```
MultiplayerLobby
    ↓ Supabase Presence (discovery)
Partie démarrée
    ↓ Supabase Broadcast (coups en temps réel)
GameResultModal
```
