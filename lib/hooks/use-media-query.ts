"use client"

import { useState, useEffect } from "react"

export function useMediaQuery(query: string) {
    const [matches, setMatches] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const media = window.matchMedia(query)
        setMatches(media.matches)
        
        const listener = (e: MediaQueryListEvent) => setMatches(e.matches)
        media.addEventListener("change", listener)
        
        return () => media.removeEventListener("change", listener)
    }, [query])

    // Always return false on server and first client render to avoid hydration mismatch.
    // The true state will pop in immediately after hydration.
    return mounted ? matches : false
}
