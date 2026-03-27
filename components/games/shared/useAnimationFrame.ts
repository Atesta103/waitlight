"use client"

import { useEffect, useRef, useCallback } from "react"

type FrameCallback = (delta: number) => void

/**
 * Runs a requestAnimationFrame loop.
 * `callback` receives the delta time in milliseconds since the last frame.
 * The loop only runs when `running` is true.
 */
export function useAnimationFrame(callback: FrameCallback, running: boolean) {
    const rafRef = useRef<number | null>(null)
    const lastTimeRef = useRef<number | null>(null)
    const callbackRef = useRef<FrameCallback>(callback)

    // Keep callback ref up-to-date without restarting the loop
    useEffect(() => {
        callbackRef.current = callback
    }, [callback])

    const loop = useCallback((time: number) => {
        if (lastTimeRef.current === null) {
            lastTimeRef.current = time
        }
        const delta = time - lastTimeRef.current
        lastTimeRef.current = time
        callbackRef.current(delta)
        rafRef.current = requestAnimationFrame(loop)
    }, [])

    useEffect(() => {
        if (!running) {
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current)
                rafRef.current = null
                lastTimeRef.current = null
            }
            return
        }

        lastTimeRef.current = null
        rafRef.current = requestAnimationFrame(loop)

        return () => {
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current)
                rafRef.current = null
                lastTimeRef.current = null
            }
        }
    }, [running, loop])
}
