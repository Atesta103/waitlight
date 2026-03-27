"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import { useAnimationFrame } from "@/components/games/shared/useAnimationFrame"
import { GameOverlay } from "@/components/games/shared/GameOverlay"

const W = 320
const H = 480
const BIRD_X = 60
const BIRD_R = 14
const GRAVITY = 0.30
const FLAP_VEL = -5.5
const PIPE_W = 52
const PIPE_GAP = 150
const PIPE_SPEED = 3
const PIPE_INTERVAL = 120 // frames

interface Pipe {
    x: number
    topH: number
    passed: boolean
}

interface GameState {
    birdY: number
    birdVY: number
    pipes: Pipe[]
    score: number
    frame: number
    running: boolean
    dead: boolean
}

function makeInitialState(): GameState {
    return {
        birdY: H / 2,
        birdVY: 0,
        pipes: [],
        score: 0,
        frame: 0,
        running: false,
        dead: false,
    }
}

function makePipe(): Pipe {
    const minTop = 60
    const maxTop = H - PIPE_GAP - 60
    const topH = Math.floor(Math.random() * (maxTop - minTop) + minTop)
    return { x: W + PIPE_W, topH, passed: false }
}

export function FlappyGame() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const stateRef = useRef<GameState>(makeInitialState())
    const [dead, setDead] = useState(false)
    const [score, setScore] = useState(0)
    const [started, setStarted] = useState(false)
    const [running, setRunning] = useState(false)

    const touchStartRef = useRef<{ x: number; y: number } | null>(null)

    const flap = useCallback(() => {
        const s = stateRef.current
        if (s.dead) return
        if (!s.running) {
            s.running = true
            setRunning(true)
            setStarted(true)
        }
        s.birdVY = FLAP_VEL
    }, [])

    const restart = useCallback(() => {
        stateRef.current = makeInitialState()
        setDead(false)
        setScore(0)
        setStarted(false)
        setRunning(false)
    }, [])

    const draw = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return
        const s = stateRef.current

        // Sky background gradient
        const grad = ctx.createLinearGradient(0, 0, 0, H)
        grad.addColorStop(0, "#0f172a")
        grad.addColorStop(1, "#1e293b")
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, W, H)

        // Ground
        ctx.fillStyle = "#334155"
        ctx.fillRect(0, H - 30, W, 30)
        ctx.fillStyle = "#475569"
        ctx.fillRect(0, H - 30, W, 4)

        // Pipes
        ctx.fillStyle = "#22c55e"
        for (const pipe of s.pipes) {
            // Top pipe
            ctx.beginPath()
            ctx.roundRect(pipe.x, 0, PIPE_W, pipe.topH - 4, [0, 0, 6, 6])
            ctx.fill()
            // Top pipe cap
            ctx.fillRect(pipe.x - 4, pipe.topH - 24, PIPE_W + 8, 24)

            // Bottom pipe
            const botY = pipe.topH + PIPE_GAP
            ctx.beginPath()
            ctx.roundRect(pipe.x, botY + 24, PIPE_W, H - 30 - botY - 24, [6, 6, 0, 0])
            ctx.fill()
            // Bottom pipe cap
            ctx.fillRect(pipe.x - 4, botY, PIPE_W + 8, 24)
        }

        // Bird
        const birdX = BIRD_X
        const birdY = s.birdY
        const tilt = Math.min(Math.max(s.birdVY * 3, -30), 70)

        ctx.save()
        ctx.translate(birdX, birdY)
        ctx.rotate((tilt * Math.PI) / 180)

        // Body
        ctx.fillStyle = "#fbbf24"
        ctx.beginPath()
        ctx.arc(0, 0, BIRD_R, 0, Math.PI * 2)
        ctx.fill()

        // Eye
        ctx.fillStyle = "white"
        ctx.beginPath()
        ctx.arc(5, -4, 5, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = "#1e293b"
        ctx.beginPath()
        ctx.arc(7, -4, 3, 0, Math.PI * 2)
        ctx.fill()

        // Beak
        ctx.fillStyle = "#f97316"
        ctx.beginPath()
        ctx.moveTo(BIRD_R - 2, -2)
        ctx.lineTo(BIRD_R + 8, 0)
        ctx.lineTo(BIRD_R - 2, 4)
        ctx.closePath()
        ctx.fill()

        ctx.restore()

        // Score
        ctx.fillStyle = "white"
        ctx.font = "bold 28px system-ui"
        ctx.textAlign = "center"
        ctx.shadowColor = "rgba(0,0,0,0.5)"
        ctx.shadowBlur = 4
        ctx.fillText(String(s.score), W / 2, 50)
        ctx.shadowBlur = 0
    }, [])

    const gameLoop = useCallback((_delta: number) => {
        const s = stateRef.current
        if (!s.running || s.dead) return

        s.frame++
        s.birdVY += GRAVITY
        s.birdY += s.birdVY

        // Spawn pipes
        if (s.frame % PIPE_INTERVAL === 0) {
            s.pipes.push(makePipe())
        }

        // Move pipes
        s.pipes = s.pipes.filter((p) => p.x > -PIPE_W - 10)
        for (const pipe of s.pipes) {
            pipe.x -= PIPE_SPEED

            if (!pipe.passed && pipe.x + PIPE_W < BIRD_X - BIRD_R) {
                pipe.passed = true
                s.score++
                setScore(s.score)
            }
        }

        // Collision: ground / ceiling
        if (s.birdY + BIRD_R > H - 30 || s.birdY - BIRD_R < 0) {
            s.dead = true
            s.running = false
            setDead(true)
            setRunning(false)
            draw()
            return
        }

        // Collision: pipes
        for (const pipe of s.pipes) {
            const inX = BIRD_X + BIRD_R > pipe.x && BIRD_X - BIRD_R < pipe.x + PIPE_W
            const inTopPipe = s.birdY - BIRD_R < pipe.topH
            const inBotPipe = s.birdY + BIRD_R > pipe.topH + PIPE_GAP
            if (inX && (inTopPipe || inBotPipe)) {
                s.dead = true
                s.running = false
                setDead(true)
                setRunning(false)
                draw()
                return
            }
        }

        draw()
    }, [draw])

    useAnimationFrame(gameLoop, running)

    // Draw initial idle frame
    useEffect(() => {
        draw()
    }, [draw])

    // Keyboard
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.code === "Space" || e.key === " ") {
                e.preventDefault()
                flap()
            }
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [flap])

    const handleTouchStart = (e: React.TouchEvent) => {
        const t = e.touches[0]
        touchStartRef.current = { x: t.clientX, y: t.clientY }
    }

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!touchStartRef.current) return
        const t = e.changedTouches[0]
        const dx = Math.abs(t.clientX - touchStartRef.current.x)
        const dy = Math.abs(t.clientY - touchStartRef.current.y)
        touchStartRef.current = null
        if (dx < 20 && dy < 20) flap()
    }

    return (
        <div className="relative flex flex-col items-center gap-4">
            <div className="relative">
                <canvas
                    ref={canvasRef}
                    width={W}
                    height={H}
                    className="rounded-xl border border-slate-700 touch-none cursor-pointer"
                    onClick={flap}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                />

                {!started && !dead && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-xl">
                        <p className="text-white text-xl font-bold mb-2">Flappy Bird</p>
                        <p className="text-white/70 text-sm mb-4 text-center px-4">
                            Tape ou espace pour voler
                        </p>
                        <button
                            onClick={flap}
                            className="px-6 py-2 bg-brand-primary text-white rounded-lg font-semibold"
                        >
                            Jouer
                        </button>
                    </div>
                )}

                {dead && (
                    <GameOverlay
                        title="Game Over"
                        score={score}
                        scoreLabel="Tuyaux passés"
                        onRestart={restart}
                    />
                )}
            </div>

            <p className="text-text-secondary text-sm">Tape l'écran ou espace pour voler</p>
        </div>
    )
}
