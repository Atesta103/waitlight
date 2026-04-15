"use client"

import { useEffect, useRef } from "react"

type FrameCallback = (delta: number) => void

/** Target frame duration in ms — locks game logic to 60 fps regardless of display Hz */
const FRAME_MS = 1000 / 60 // ~16.667ms

/**
 * Runs a requestAnimationFrame loop locked to 60 fps.
 *
 * On high-refresh-rate displays (120/144 Hz) the rAF fires more often but the
 * game callback is only called when a full 16.67 ms budget has accumulated.
 * On low-refresh-rate displays (30 Hz) the callback is called twice per rAF
 * frame so the game still advances at full speed.
 *
 * The callback always receives exactly FRAME_MS (16.67 ms) as `delta` so
 * physics code using per-frame constants works identically on all hardware.
 */
export function useAnimationFrame(callback: FrameCallback, running: boolean) {
    const rafRef = useRef<number | null>(null)
    const lastTimeRef = useRef<number | null>(null)
    const accumRef = useRef(0)
    const callbackRef = useRef<FrameCallback>(callback)

    // Keep callback ref up-to-date without restarting the loop
    useEffect(() => {
        callbackRef.current = callback
    }, [callback])

    useEffect(() => {
        if (!running) {
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current)
                rafRef.current = null
                lastTimeRef.current = null
                accumRef.current = 0
            }
            return
        }

        lastTimeRef.current = null
        accumRef.current = 0

        // Define loop inside the effect so refs are only accessed outside render
        const loop = (time: number) => {
            if (lastTimeRef.current === null) {
                lastTimeRef.current = time
            }
            const raw = time - lastTimeRef.current
            lastTimeRef.current = time

            // Cap accumulator to max 4 frames to avoid "spiral of death" after tab focus loss
            accumRef.current = Math.min(accumRef.current + raw, FRAME_MS * 4)

            while (accumRef.current >= FRAME_MS) {
                callbackRef.current(FRAME_MS)
                accumRef.current -= FRAME_MS
            }

            rafRef.current = requestAnimationFrame(loop)
        }

        rafRef.current = requestAnimationFrame(loop)

        return () => {
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current)
                rafRef.current = null
                lastTimeRef.current = null
                accumRef.current = 0
            }
        }
    }, [running])
}
