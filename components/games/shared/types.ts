export type GameId = "snake" | "flappy" | "2048" | "connect4" | "bombparty"

export type GameMode = "solo" | "multiplayer"

export interface GameMeta {
    id: GameId
    title: string
    description: string
    emoji: string
    mode: GameMode
    avgDuration: string
}

export const GAMES: GameMeta[] = [
    {
        id: "snake",
        title: "Snake",
        description: "Mange les pommes sans te mordre la queue !",
        emoji: "🐍",
        mode: "solo",
        avgDuration: "2-5 min",
    },
    {
        id: "flappy",
        title: "Flappy Bird",
        description: "Passe entre les tuyaux sans te crasher.",
        emoji: "🐦",
        mode: "solo",
        avgDuration: "1-3 min",
    },
    {
        id: "2048",
        title: "2048",
        description: "Combine les tuiles pour atteindre 2048.",
        emoji: "🔢",
        mode: "solo",
        avgDuration: "5-10 min",
    },
    {
        id: "connect4",
        title: "Puissance 4",
        description: "Aligne 4 jetons avant ton adversaire.",
        emoji: "🟡",
        mode: "multiplayer",
        avgDuration: "3-7 min",
    },
    {
        id: "bombparty",
        title: "Bomb Party",
        description: "Trouve un mot contenant la syllabe avant l'explosion !",
        emoji: "💣",
        mode: "multiplayer",
        avgDuration: "5-10 min",
    },
]
