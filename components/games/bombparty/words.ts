export const SYLLABLES: string[] = [
    "RA", "OU", "TER", "AN", "IS", "LE", "EN", "ON", "AL", "ER",
    "MA", "IN", "PA", "RI", "CA", "RE", "DE", "LA", "SA", "MI",
    "LU", "SO", "ME", "BO", "VI", "TO", "CO", "NO", "FI", "GA",
    "PO", "TI", "LI", "BU", "RO", "DI", "SI", "NE", "TE", "BE",
    "MO", "PU", "VE", "ZO", "WA", "KI", "BI", "JO", "PI", "FU",
    "AR", "EC", "IL", "UR", "OL", "EM", "AC", "OC", "UL", "IM",
    "ENT", "OUR", "AIR", "EUR", "AIN", "OIN", "UIL", "AUX", "EAU",
    "ORE", "ARE", "ERE", "OTE", "ATE", "UTE", "ITE", "OLE", "ALE",
    "ART", "ORT", "ERT", "URT", "ANC", "ONC", "ENC", "UNC",
    "ING", "ANG", "ONG", "UNG", "ENG",
    "ASS", "ESS", "ISS", "OSS", "USS",
    "ANT", "INT", "ONT", "UNT",
    "TION", "SION", "MENT", "ANCE", "ENCE",
    "BLE", "CLE", "DRE", "FRE", "GLE", "PRE", "TRE",
    "ELLE", "ILLE", "AILLE", "EILLE",
    "QUE", "GUE",
    "PHO", "THE", "CHE", "CHI", "CHA",
    "CRAN", "BRAS", "TRES", "GROS", "FRAI",
    "PLAN", "CLAN", "GRAN", "TRAN", "BRAN",
    "FLOT", "BLOT", "SLOT", "PLOT",
    "VERT", "CERT", "PERT",
    "TROP", "PROP", "DROP",
    "MENT", "SENT", "RENT", "VENT",
    "PORT", "MORT", "SORT", "FORT",
    "PART", "CART", "TART", "MART",
    "BOUL", "SOUL", "FOUL", "MOUL",
    "TOUR", "JOUR", "POUR", "COUR",
    "MAIN", "SAIN", "PAIN", "VAIN",
    "BOND", "FOND", "ROND", "SOND",
    "RANG", "SANG", "GANG", "HANG",
]

export function getRandomSyllable(): string {
    return SYLLABLES[Math.floor(Math.random() * SYLLABLES.length)]
}

export function containsSyllable(word: string, syllable: string): boolean {
    return word.toUpperCase().includes(syllable.toUpperCase())
}
