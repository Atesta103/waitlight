"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Tracks a DOM element's content-box height via ResizeObserver. Attach the
 * returned ref to the element to measure. Height is 0 until the first
 * observation, and 0 whenever the element is display:none (e.g. an inactive
 * tab panel) — callers should treat 0 as "unmeasured".
 */
export function useMeasuredHeight<T extends HTMLElement>(): [
    React.RefObject<T | null>,
    number,
] {
    const ref = useRef<T | null>(null)
    const [height, setHeight] = useState(0)

    useEffect(() => {
        const el = ref.current
        if (!el || typeof ResizeObserver === "undefined") return

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setHeight(entry.contentRect.height)
            }
        })
        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    return [ref, height]
}
