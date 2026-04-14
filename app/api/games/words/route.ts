import { NextResponse } from "next/server"

const WORD_LIST_URL =
    "https://raw.githubusercontent.com/lorenbrichter/Words/master/Words/fr.txt"

// Module-level cache — survives across requests in the same serverless instance
let cachedWords: string[] | null = null

// Suffixes that strongly indicate obscure verb conjugations — exclude these
const CONJUGATION_SUFFIXES = [
    "âmes", "âtes", "issions", "issiez", "assions", "assiez",
    "erions", "eriez", "arions", "ariez", "irions", "iriez",
    "asses", "isse", "usses", "assent", "ussent",
    "erait", "eriez", "eraient",
]

function isLikelyCommon(word: string): boolean {
    // Reject words shorter than 4 or longer than 10 characters
    if (word.length < 4 || word.length > 10) return false
    // Only allow French-friendly characters (no digits, hyphens, etc.)
    if (!/^[a-záàâäéèêëîïôùûüçœæ]+$/.test(word)) return false
    // Reject uncommon conjugation endings
    for (const suffix of CONJUGATION_SUFFIXES) {
        if (word.endsWith(suffix)) return false
    }
    return true
}

async function loadWords(): Promise<string[]> {
    if (cachedWords) return cachedWords

    const res = await fetch(WORD_LIST_URL, { next: { revalidate: 86400 } })
    if (!res.ok) throw new Error(`Failed to fetch word list: ${res.status}`)

    const text = await res.text()
    const lines = text.split("\n").map((l) => l.trim().toLowerCase())

    // Filter to likely-common words
    const filtered = lines.filter(isLikelyCommon)

    // Deterministic shuffle via simple sort with seeded compare
    // (Math.random would differ per request — use stable sort instead)
    const seeded = filtered.sort((a, b) => {
        const ha = [...a].reduce((acc, c) => acc * 31 + c.charCodeAt(0), 0)
        const hb = [...b].reduce((acc, c) => acc * 31 + c.charCodeAt(0), 0)
        return ha - hb
    })

    // Cap at 8000 words — enough coverage, small enough to cache easily
    cachedWords = seeded.slice(0, 8000)
    return cachedWords
}

export async function GET() {
    try {
        const words = await loadWords()
        return NextResponse.json({ words }, {
            headers: {
                "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
            },
        })
    } catch (err) {
        console.error("[api/games/words]", err)
        return NextResponse.json({ words: [] }, { status: 500 })
    }
}
