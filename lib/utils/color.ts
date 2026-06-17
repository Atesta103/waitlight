export function getContrastYIQ(hexcolor: string): "black" | "white" {
    hexcolor = hexcolor.replace("#", "")
    if (hexcolor.length === 3) {
        hexcolor = hexcolor.split("").map((c) => c + c).join("")
    }
    const r = parseInt(hexcolor.slice(0, 2), 16)
    const g = parseInt(hexcolor.slice(2, 4), 16)
    const b = parseInt(hexcolor.slice(4, 6), 16)
    const yiq = (r * 299 + g * 587 + b * 114) / 1000
    // >= 128 is typically "light", meaning it needs dark text.
    return yiq >= 128 ? "black" : "white"
}

export function isValidHexCode(hex: string): boolean {
    return /^#([0-9A-F]{3}){1,2}$/i.test(hex)
}
