export type SoundChoice =
    | "arpeggio"
    | "double-ping"
    | "doorbell"
    | "alert"
    | "soft-chime"
    | "none"

export const SOUND_LABELS: Record<SoundChoice, string> = {
    arpeggio: "Arpège C-E-G",
    "double-ping": "Double ping",
    doorbell: "Sonnette",
    alert: "Alerte",
    "soft-chime": "Carillon doux",
    none: "Aucun son",
}

let sharedCtx: AudioContext | null = null

function makeCtx() {
    if (typeof window === "undefined") return null
    if (sharedCtx) return sharedCtx

    try {
        const Ctx = window.AudioContext || (window as any).webkitAudioContext
        if (!Ctx) return null
        sharedCtx = new Ctx()
        return sharedCtx
    } catch {
        return null
    }
}

/**
 * Resumes the AudioContext to "unlock" sound playback.
 * Must be called inside a user gesture (click/tap).
 */
export async function unlockAudio() {
    const ctx = makeCtx()
    if (ctx && ctx.state === "suspended") {
        await ctx.resume()
    }
    return ctx?.state === "running"
}

export function playSound(choice: SoundChoice | string) {
    if (choice === "none" || !choice) return
    const ctx = makeCtx()
    if (!ctx) return
    if (ctx.state === "suspended") {
        void ctx.resume().catch(() => undefined)
    }
    const now = ctx.currentTime

    type Note = {
        freq: number
        t: number
        dur: number
        vol: number
        type: OscillatorType
    }

    const schedules: Record<string, Note[]> = {
        arpeggio: [
            { freq: 523.25, t: 0, dur: 0.55, vol: 0.28, type: "sine" },
            { freq: 659.25, t: 0.16, dur: 0.55, vol: 0.28, type: "sine" },
            { freq: 783.99, t: 0.32, dur: 0.55, vol: 0.28, type: "sine" },
        ],
        "double-ping": [
            { freq: 1046.5, t: 0, dur: 0.35, vol: 0.3, type: "sine" },
            { freq: 1046.5, t: 0.22, dur: 0.35, vol: 0.3, type: "sine" },
        ],
        doorbell: [
            { freq: 587.33, t: 0, dur: 0.45, vol: 0.3, type: "triangle" },
            { freq: 493.88, t: 0.28, dur: 0.55, vol: 0.25, type: "triangle" },
        ],
        alert: [
            { freq: 880, t: 0, dur: 0.12, vol: 0.35, type: "square" },
            { freq: 880, t: 0.16, dur: 0.12, vol: 0.35, type: "square" },
            { freq: 1108.7, t: 0.32, dur: 0.25, vol: 0.35, type: "square" },
        ],
        "soft-chime": [
            { freq: 523.25, t: 0, dur: 0.8, vol: 0.22, type: "sine" },
            { freq: 659.25, t: 0.2, dur: 0.8, vol: 0.2, type: "sine" },
            { freq: 987.77, t: 0.4, dur: 0.9, vol: 0.18, type: "sine" },
            { freq: 1318.5, t: 0.6, dur: 0.7, vol: 0.15, type: "sine" },
        ],
        chime: [ // Added a fallback for chime if missing
            { freq: 523.25, t: 0, dur: 0.8, vol: 0.22, type: "sine" },
            { freq: 659.25, t: 0.2, dur: 0.8, vol: 0.2, type: "sine" },
            { freq: 987.77, t: 0.4, dur: 0.9, vol: 0.18, type: "sine" },
            { freq: 1318.5, t: 0.6, dur: 0.7, vol: 0.15, type: "sine" },
        ],
        bell: [ // Added a fallback for bell if missing
            { freq: 587.33, t: 0, dur: 0.45, vol: 0.3, type: "triangle" },
            { freq: 493.88, t: 0.28, dur: 0.55, vol: 0.25, type: "triangle" },
        ],
        ping: [ // Added a fallback for ping if missing
            { freq: 1046.5, t: 0, dur: 0.35, vol: 0.3, type: "sine" },
            { freq: 1046.5, t: 0.22, dur: 0.35, vol: 0.3, type: "sine" },
        ]
    }
    
    const schedule = schedules[choice as string] || schedules["arpeggio"]

    // All sounds pass through a compressor to avoid clipping
    const compressor = ctx.createDynamicsCompressor()
    compressor.threshold.value = -12
    compressor.ratio.value = 6
    compressor.connect(ctx.destination)

    schedule.forEach(({ freq, t, dur, vol, type }) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(compressor)
        osc.type = type
        osc.frequency.value = freq
        const start = now + t
        gain.gain.setValueAtTime(0, start)
        gain.gain.linearRampToValueAtTime(vol, start + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur)
        osc.start(start)
        osc.stop(start + dur)
    })
}

export function playHapticBuzz() {
    if (typeof window === "undefined" || !window.navigator) return

    // Standard Vibration API for Android
    if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200])
        return
    }

    // iOS fallback via WebAudio
    const ctx = makeCtx()
    if (!ctx) return
    const compressor = ctx.createDynamicsCompressor()
    compressor.threshold.value = -6
    compressor.ratio.value = 20
    compressor.connect(ctx.destination)

    const bursts = [0, 0.14, 0.28]
    bursts.forEach((offset) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(compressor)
        osc.type = "sawtooth"
        osc.frequency.value = 55
        const t = ctx.currentTime + offset
        gain.gain.setValueAtTime(0, t)
        gain.gain.linearRampToValueAtTime(1.0, t + 0.005)
        gain.gain.setValueAtTime(1.0, t + 0.07)
        gain.gain.linearRampToValueAtTime(0, t + 0.1)
        osc.start(t)
        osc.stop(t + 0.11)
    })
}
