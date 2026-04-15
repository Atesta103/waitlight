export const SYLLABLES: string[] = [
    // 2-letter (common in French)
    "RA", "OU", "AN", "IS", "EN", "ON", "AL", "ER", "MA", "IN",
    "PA", "RI", "CA", "RE", "DE", "LA", "SA", "MI", "LU", "SO",
    "ME", "BO", "VI", "TO", "CO", "NO", "FI", "GA", "PO", "TI",
    "LI", "RO", "DI", "SI", "NE", "TE", "BE", "MO", "VE",
    // Closed syllables
    "AR", "EC", "IL", "UR", "OL", "EM", "AC", "OC",
    // 3-letter
    "ENT", "OUR", "AIR", "EUR", "AIN", "ORE", "ARE", "ERE",
    "ART", "ORT", "ERT", "ANC", "ONC", "ENC",
    "ANT", "INT", "ONT", "ASS", "ESS", "OSS",
    "BLE", "CLE", "DRE", "PRE", "TRE", "GRE",
    "QUE", "GUE", "CHE", "CHI", "CHA",
    "TER", "PER", "MER", "VER", "SER",
    "TUR", "PUR", "MUR", "SUR", "CUR",
    "TON", "SON", "MON", "BON", "RON",
    "RAN", "PAN", "BAN", "MAN", "VAN",
    "TIN", "PIN", "BIN", "FIN", "LIN",
    "COT", "ROT", "BOT", "LOT", "POT",
    "LET", "NET", "SET", "BET", "JET",
    // 4-letter
    "TION", "SION", "MENT", "ANCE", "ENCE",
    "ELLE", "ILLE", "ETTE",
    "VERT", "CERT", "PORT", "MORT", "SORT", "FORT",
    "PART", "CART", "TOUR", "JOUR", "POUR", "COUR",
    "MAIN", "SAIN", "PAIN", "VAIN",
    "BOND", "FOND", "ROND",
    "RANG", "SANG",
    "TRES", "BRAS", "GROS", "PLAN", "GRAN",
    "TROP", "DROP", "PROP",
    "BOUL", "SOUL", "FOUL",
]

// Module-level word set — loaded once per game session
let wordSet: Set<string> | null = null
let loadPromise: Promise<void> | null = null

/**
 * Fetch the French word list from the API route.
 * Calling this multiple times is safe — returns the same cached promise.
 */
export function preloadWords(): Promise<void> {
    if (wordSet) return Promise.resolve()
    if (loadPromise) return loadPromise

    loadPromise = fetch("/api/games/words")
        .then((r) => r.json())
        .then((data: { words: string[] }) => {
            wordSet = new Set(data.words)
        })
        .catch(() => {
            // Fail open — no validation if the API is unreachable
            wordSet = null
        })
    return loadPromise
}

export function getRandomSyllable(): string {
    return SYLLABLES[Math.floor(Math.random() * SYLLABLES.length)]
}

/** True if the word contains the syllable (case-insensitive). */
export function containsSyllable(word: string, syllable: string): boolean {
    return word.toUpperCase().includes(syllable.toUpperCase())
}

/**
 * True if the word is considered valid:
 * - Contains the syllable
 * - Is a known French word (if the word list has loaded); fail-open if not loaded
 */
export function isValidWord(word: string, syllable: string): boolean {
    if (!containsSyllable(word, syllable)) return false
    if (wordSet === null) return true // list not loaded yet — accept any
    return wordSet.has(word.toLowerCase())
}
