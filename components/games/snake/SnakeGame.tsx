"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { GameOverlay } from "@/components/games/shared/GameOverlay"

const GRID = 20
const CELL = 16
const CANVAS_SIZE = GRID * CELL // 320

type Point = { x: number; y: number }
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT"

function randomFood(snake: Point[]): Point {
    let food: Point
    do {
        food = {
            x: Math.floor(Math.random() * GRID),
            y: Math.floor(Math.random() * GRID),
        }
    } while (snake.some((s) => s.x === food.x && s.y === food.y))
    return food
}

function getInitialState() {
    const snake: Point[] = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 },
    ]
    return {
        snake,
        food: randomFood(snake),
        dir: "RIGHT" as Direction,
        nextDir: "RIGHT" as Direction,
        score: 0,
        applesEaten: 0,
    }
}

interface SnakeGameProps {
    onBack?: () => void
}

export function SnakeGame({ onBack: _onBack }: SnakeGameProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const stateRef = useRef(getInitialState())
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const [gameOver, setGameOver] = useState(false)
    const [score, setScore] = useState(0)
    const [started, setStarted] = useState(false)

    // Touch tracking
    const touchStartRef = useRef<{ x: number; y: number } | null>(null)

    const draw = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const state = stateRef.current

        // Background
        ctx.fillStyle = "#0f172a"
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

        // Grid dots (subtle)
        ctx.fillStyle = "rgba(255,255,255,0.03)"
        for (let x = 0; x < GRID; x++) {
            for (let y = 0; y < GRID; y++) {
                ctx.fillRect(x * CELL + CELL / 2 - 1, y * CELL + CELL / 2 - 1, 2, 2)
            }
        }

        // Food
        const fx = state.food.x * CELL + CELL / 2
        const fy = state.food.y * CELL + CELL / 2
        ctx.fillStyle = "var(--color-feedback-success, #10b981)"
        ctx.beginPath()
        ctx.arc(fx, fy, CELL / 2 - 2, 0, Math.PI * 2)
        ctx.fill()

        // Snake body
        state.snake.forEach((seg, i) => {
            const isHead = i === 0
            const alpha = isHead ? 1 : 0.75 - (i / state.snake.length) * 0.3
            ctx.fillStyle = isHead
                ? "var(--color-brand-primary, #6366f1)"
                : `rgba(99, 102, 241, ${alpha})`
            const pad = isHead ? 1 : 2
            ctx.beginPath()
            ctx.roundRect(
                seg.x * CELL + pad,
                seg.y * CELL + pad,
                CELL - pad * 2,
                CELL - pad * 2,
                isHead ? 4 : 3,
            )
            ctx.fill()
        })

        // Score overlay
        ctx.fillStyle = "rgba(255,255,255,0.7)"
        ctx.font = "bold 13px system-ui"
        ctx.textAlign = "left"
        ctx.fillText(`Score: ${state.score}`, 8, 20)
    }, [])

    const getSpeed = (applesEaten: number) => {
        return Math.max(80, 150 - Math.floor(applesEaten / 5) * 10)
    }

    const step = useCallback(() => {
        const state = stateRef.current
        state.dir = state.nextDir

        const head = state.snake[0]
        let newHead: Point

        switch (state.dir) {
            case "UP":
                newHead = { x: head.x, y: (head.y - 1 + GRID) % GRID }
                break
            case "DOWN":
                newHead = { x: head.x, y: (head.y + 1) % GRID }
                break
            case "LEFT":
                newHead = { x: (head.x - 1 + GRID) % GRID, y: head.y }
                break
            case "RIGHT":
                newHead = { x: (head.x + 1) % GRID, y: head.y }
                break
        }

        // Self collision
        if (state.snake.some((s) => s.x === newHead.x && s.y === newHead.y)) {
            if (intervalRef.current) clearInterval(intervalRef.current)
            setGameOver(true)
            setScore(state.score)
            return
        }

        const ateFood = newHead.x === state.food.x && newHead.y === state.food.y
        const newSnake = [newHead, ...state.snake]
        if (!ateFood) newSnake.pop()

        state.snake = newSnake
        if (ateFood) {
            state.score += 10
            state.applesEaten += 1
            state.food = randomFood(newSnake)
            setScore(state.score)
            // Restart with new speed
            if (intervalRef.current) clearInterval(intervalRef.current)
            intervalRef.current = setInterval(step, getSpeed(state.applesEaten))
        }

        draw()
    }, [draw])

    const startGame = useCallback(() => {
        stateRef.current = getInitialState()
        setGameOver(false)
        setScore(0)
        setStarted(true)
        if (intervalRef.current) clearInterval(intervalRef.current)
        intervalRef.current = setInterval(step, getSpeed(0))
    }, [step])

    const handleRestart = useCallback(() => {
        startGame()
    }, [startGame])

    // Direction change helper
    const changeDir = useCallback((newDir: Direction) => {
        const state = stateRef.current
        const opposite: Record<Direction, Direction> = {
            UP: "DOWN",
            DOWN: "UP",
            LEFT: "RIGHT",
            RIGHT: "LEFT",
        }
        if (opposite[newDir] !== state.dir) {
            state.nextDir = newDir
        }
    }, [])

    // Keyboard controls
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            switch (e.key) {
                case "ArrowUp":
                case "w":
                    e.preventDefault()
                    changeDir("UP")
                    break
                case "ArrowDown":
                case "s":
                    e.preventDefault()
                    changeDir("DOWN")
                    break
                case "ArrowLeft":
                case "a":
                    e.preventDefault()
                    changeDir("LEFT")
                    break
                case "ArrowRight":
                case "d":
                    e.preventDefault()
                    changeDir("RIGHT")
                    break
                case " ":
                    if (!started || gameOver) startGame()
                    break
            }
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [changeDir, startGame, started, gameOver])

    // Draw initial frame
    useEffect(() => {
        draw()
    }, [draw])

    // Cleanup
    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [])

    const handleTouchStart = (e: React.TouchEvent) => {
        const t = e.touches[0]
        touchStartRef.current = { x: t.clientX, y: t.clientY }
    }

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!touchStartRef.current) return
        const t = e.changedTouches[0]
        const dx = t.clientX - touchStartRef.current.x
        const dy = t.clientY - touchStartRef.current.y
        touchStartRef.current = null

        if (Math.abs(dx) < 30 && Math.abs(dy) < 30) {
            if (!started || gameOver) startGame()
            return
        }

        if (Math.abs(dx) > Math.abs(dy)) {
            changeDir(dx > 0 ? "RIGHT" : "LEFT")
        } else {
            changeDir(dy > 0 ? "DOWN" : "UP")
        }
    }

    return (
        <div className="relative flex flex-col items-center gap-4">
            <div className="relative">
                <canvas
                    ref={canvasRef}
                    width={CANVAS_SIZE}
                    height={CANVAS_SIZE}
                    className="rounded-xl border border-slate-700 touch-none"
                    style={{ imageRendering: "pixelated" }}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                />

                {!started && !gameOver && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-xl">
                        <p className="text-white text-lg font-bold mb-2">Snake</p>
                        <p className="text-white/70 text-sm mb-4 text-center px-4">
                            Utilise les flèches ou swipe pour jouer
                        </p>
                        <button
                            onClick={startGame}
                            className="px-6 py-2 bg-brand-primary text-white rounded-lg font-semibold"
                        >
                            Jouer
                        </button>
                    </div>
                )}

                {gameOver && (
                    <GameOverlay
                        title="Game Over"
                        score={score}
                        scoreLabel="Points"
                        onRestart={handleRestart}
                    />
                )}
            </div>

            <p className="text-text-secondary text-sm">
                Swipe ou flèches directionnelles pour changer de direction
            </p>
        </div>
    )
}
