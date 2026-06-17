"use client"

import { useSyncExternalStore } from "react"

export function useMediaQuery(query: string) {
    return useSyncExternalStore(
        (onStoreChange) => {
            const media = window.matchMedia(query)
            media.addEventListener("change", onStoreChange)

            return () => media.removeEventListener("change", onStoreChange)
        },
        () => (typeof window !== "undefined" ? window.matchMedia(query).matches : false),
        () => false,
    )
}
