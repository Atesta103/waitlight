"use client"

import { useRef, useEffect, useCallback, useState } from "react"
import { useGameChannel } from "@/components/games/shared/useGameChannel"
import { useAnimationFrame } from "@/components/games/shared/useAnimationFrame"

const W = 320
const H = 480
const PADDLE_W = 80
const PADDLE_H = 12
const BALL_R = 8
const PADDLE_Y_OFFSET = 20
const WIN_SCORE = 7
const BALL_SPEED = 3.5

interface BallMsg {
    type: "ball"
    x: number
    y: number
    vx: number
    vy: number
}

interface CountdownMsg {
    type: "countdown"
    n: number
}

interface PaddleMsg {
    type: "paddle"
    x: number
    player: 1 | 2
}

interface ScoreMsg {
    type: "score"
    p1: number
    p2: number
}

type GameMsg = BallMsg | PaddleMsg | ScoreMsg | CountdownMsg

interface PongState {
    ballX: number
    ballY: number
    ballVX: number
    ballVY: number
    p1X: number // bottom paddle (player1)
    p2X: number // top paddle (player2)
    score1: number
    score2: number
    running: boolean
    winner: 0 | 1 | 2
    countdown: number       // 3,2,1,0 — pauses physics
    countdownElapsed: number // ms elapsed in current countdown second
}

function clampPaddleX(x: number) {
    return Math.max(PADDLE_W / 2, Math.min(W - PADDLE_W / 2, x))
}

function makeInitialState(): PongState {
    return {
        ballX: W / 2,
        ballY: H / 2,
        ballVX: 0,
        ballVY: 0,
        p1X: W / 2,
        p2X: W / 2,
        score1: 0,
        score2: 0,
        running: true,
        winner: 0,
        countdown: 3,
        countdownElapsed: 0,
    }
}

interface PongGameProps {
    merchantId: string
    roomCode: string
    playerNum: 1 | 2
    onExit: () => void
}

export function PongGame({ merchantId, roomCode, playerNum, onExit }: PongGameProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const stateRef = useRef<PongState>(makeInitialState())
    const [scores, setScores] = useState({ p1: 0, p2: 0 })
    const [winner, setWinner] = useState<0 | 1 | 2>(0)
    const broadcastIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const isHost = playerNum === 1
    const channelName = `pong:${merchantId}:${roomCode}`

    const onMessage = useCallback((payload: Record<string, unknown>) => {
        const msg = payload as unknown as GameMsg
        const s = stateRef.current

        if (msg.type === "countdown") {
            s.countdown = msg.n
            s.countdownElapsed = 0
            if (msg.n === 0) {
                s.ballVX = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1)
                s.ballVY = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1)
            }
        } else if (msg.type === "ball" && !isHost) {
            s.ballX = msg.x
            s.ballY = msg.y
            s.ballVX = msg.vx
            s.ballVY = msg.vy
        } else if (msg.type === "paddle") {
            if (msg.player === 1) s.p1X = msg.x
            else s.p2X = msg.x
        } else if (msg.type === "score") {
            s.score1 = msg.p1
            s.score2 = msg.p2
            setScores({ p1: msg.p1, p2: msg.p2 })
            if (msg.p1 >= WIN_SCORE) { s.winner = 1; s.running = false; setWinner(1) }
            else if (msg.p2 >= WIN_SCORE) { s.winner = 2; s.running = false; setWinner(2) }
        }
    }, [isHost])

    const { broadcast } = useGameChannel({ channelName, onMessage })

    const draw = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return
        const s = stateRef.current

        // Background
        ctx.fillStyle = "#0f172a"
        ctx.fillRect(0, 0, W, H)

        // Center line
        ctx.setLineDash([8, 8])
        ctx.strokeStyle = "rgba(255,255,255,0.15)"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(0, H / 2)
        ctx.lineTo(W, H / 2)
        ctx.stroke()
        ctx.setLineDash([])

        // Scores
        ctx.fillStyle = "rgba(255,255,255,0.5)"
        ctx.font = "bold 32px system-ui"
        ctx.textAlign = "center"
        ctx.fillText(String(s.score2), W / 2, H / 2 - 20)
        ctx.fillText(String(s.score1), W / 2, H / 2 + 50)

        // Player labels
        ctx.font = "11px system-ui"
        ctx.fillStyle = "rgba(255,255,255,0.3)"
        ctx.fillText(`J2${playerNum === 2 ? " (Toi)" : ""}`, W / 2, 30)
        ctx.fillText(`J1${playerNum === 1 ? " (Toi)" : ""}`, W / 2, H - 30)

        // Paddles
        const p1Left = s.p1X - PADDLE_W / 2
        const p2Left = s.p2X - PADDLE_W / 2
        const p1Top = H - PADDLE_Y_OFFSET - PADDLE_H
        const p2Top = PADDLE_Y_OFFSET

        // Player 1 paddle (bottom) - brand color
        ctx.fillStyle = playerNum === 1 ? "var(--color-brand-primary, #6366f1)" : "#94a3b8"
        ctx.beginPath()
        ctx.roundRect(p1Left, p1Top, PADDLE_W, PADDLE_H, 6)
        ctx.fill()

        // Player 2 paddle (top) - accent color
        ctx.fillStyle = playerNum === 2 ? "var(--color-brand-primary, #6366f1)" : "#94a3b8"
        ctx.beginPath()
        ctx.roundRect(p2Left, p2Top, PADDLE_W, PADDLE_H, 6)
        ctx.fill()

        // Ball
        ctx.fillStyle = "#fbbf24"
        ctx.beginPath()
        ctx.arc(s.ballX, s.ballY, BALL_R, 0, Math.PI * 2)
        ctx.fill()

        // Countdown overlay
        if (s.countdown > 0) {
            ctx.fillStyle = "rgba(0,0,0,0.45)"
            ctx.fillRect(0, 0, W, H)
            ctx.fillStyle = "white"
            ctx.font = "bold 72px system-ui"
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"
            ctx.fillText(String(s.countdown), W / 2, H / 2)
            ctx.textBaseline = "alphabetic"
        }
    }, [playerNum])

    // Host runs physics
    const gameLoop = useCallback((delta: number) => {
        const s = stateRef.current
        if (!isHost) {
            draw()
            return
        }
        if (!s.running) return

        // Countdown phase
        if (s.countdown > 0) {
            s.countdownElapsed += delta
            if (s.countdownElapsed >= 1000) {
                s.countdown--
                s.countdownElapsed = 0
                broadcast({ type: "countdown", n: s.countdown } satisfies CountdownMsg)
                if (s.countdown === 0) {
                    s.ballVX = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1)
                    s.ballVY = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1)
                }
            }
            draw()
            return
        }

        s.ballX += s.ballVX
        s.ballY += s.ballVY

        // Wall bounce (left/right)
        if (s.ballX - BALL_R <= 0) { s.ballX = BALL_R; s.ballVX = Math.abs(s.ballVX) }
        if (s.ballX + BALL_R >= W) { s.ballX = W - BALL_R; s.ballVX = -Math.abs(s.ballVX) }

        // Paddle collision — player 1 (bottom)
        const p1Top = H - PADDLE_Y_OFFSET - PADDLE_H
        if (
            s.ballY + BALL_R >= p1Top &&
            s.ballY + BALL_R <= p1Top + PADDLE_H + 4 &&
            s.ballX >= s.p1X - PADDLE_W / 2 - BALL_R &&
            s.ballX <= s.p1X + PADDLE_W / 2 + BALL_R &&
            s.ballVY > 0
        ) {
            s.ballVY = -Math.abs(s.ballVY)
            const hitPos = (s.ballX - s.p1X) / (PADDLE_W / 2)
            s.ballVX = hitPos * BALL_SPEED * 1.2
            s.ballY = p1Top - BALL_R - 1
        }

        // Paddle collision — player 2 (top)
        const p2Bot = PADDLE_Y_OFFSET + PADDLE_H
        if (
            s.ballY - BALL_R <= p2Bot &&
            s.ballY - BALL_R >= PADDLE_Y_OFFSET - 4 &&
            s.ballX >= s.p2X - PADDLE_W / 2 - BALL_R &&
            s.ballX <= s.p2X + PADDLE_W / 2 + BALL_R &&
            s.ballVY < 0
        ) {
            s.ballVY = Math.abs(s.ballVY)
            const hitPos = (s.ballX - s.p2X) / (PADDLE_W / 2)
            s.ballVX = hitPos * BALL_SPEED * 1.2
            s.ballY = p2Bot + BALL_R + 1
        }

        // Score: ball out of top (p1 scores) or bottom (p2 scores)
        if (s.ballY - BALL_R < 0) {
            s.score1++
            broadcast({ type: "score", p1: s.score1, p2: s.score2 } satisfies ScoreMsg)
            setScores({ p1: s.score1, p2: s.score2 })
            if (s.score1 >= WIN_SCORE) { s.running = false; s.winner = 1; setWinner(1) }
            else resetBall(s)
        }
        if (s.ballY + BALL_R > H) {
            s.score2++
            broadcast({ type: "score", p1: s.score1, p2: s.score2 } satisfies ScoreMsg)
            setScores({ p1: s.score1, p2: s.score2 })
            if (s.score2 >= WIN_SCORE) { s.running = false; s.winner = 2; setWinner(2) }
            else resetBall(s)
        }

        draw()
    }, [isHost, draw, broadcast])

    function resetBall(s: PongState) {
        s.ballX = W / 2
        s.ballY = H / 2
        s.ballVX = 0
        s.ballVY = 0
        s.countdown = 3
        s.countdownElapsed = 0
        broadcast({ type: "countdown", n: 3 } satisfies CountdownMsg)
    }

    useAnimationFrame(gameLoop, winner === 0)

    // Host broadcasts ball position at ~20fps
    useEffect(() => {
        if (!isHost) return
        broadcastIntervalRef.current = setInterval(() => {
            const s = stateRef.current
            if (!s.running || s.countdown > 0) return
            broadcast({
                type: "ball",
                x: s.ballX,
                y: s.ballY,
                vx: s.ballVX,
                vy: s.ballVY,
            } satisfies BallMsg)
        }, 33)
        return () => {
            if (broadcastIntervalRef.current) clearInterval(broadcastIntervalRef.current)
        }
    }, [isHost, broadcast])

    // Paddle control via touch and mouse
    const handlePointerMove = useCallback(
        (clientX: number) => {
            const canvas = canvasRef.current
            if (!canvas) return
            const rect = canvas.getBoundingClientRect()
            const x = clampPaddleX(clientX - rect.left)
            const s = stateRef.current
            if (playerNum === 1) s.p1X = x
            else s.p2X = x
            broadcast({ type: "paddle", x, player: playerNum } satisfies PaddleMsg)
        },
        [broadcast, playerNum],
    )

    const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => handlePointerMove(e.clientX)

    const onTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
        e.preventDefault()
        handlePointerMove(e.touches[0].clientX)
    }

    // Initial draw
    useEffect(() => { draw() }, [draw])

    return (
        <div className="flex flex-col items-center gap-3">
            {/* Score header */}
            <div className="flex items-center gap-6 bg-surface-card rounded-xl px-6 py-2 border border-border-default">
                <div className="text-center">
                    <div className="text-xs text-text-secondary">J1{playerNum === 1 ? " (Toi)" : ""}</div>
                    <div className="text-2xl font-bold text-brand-primary">{scores.p1}</div>
                </div>
                <div className="text-text-secondary text-sm">vs</div>
                <div className="text-center">
                    <div className="text-xs text-text-secondary">J2{playerNum === 2 ? " (Toi)" : ""}</div>
                    <div className="text-2xl font-bold text-brand-primary">{scores.p2}</div>
                </div>
            </div>

            <div className="relative">
                <canvas
                    ref={canvasRef}
                    width={W}
                    height={H}
                    className="rounded-xl border border-slate-700 touch-none"
                    onMouseMove={onMouseMove}
                    onTouchMove={onTouchMove}
                />
                {winner !== 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-xl gap-4">
                        <div className="bg-surface-card rounded-2xl p-8 flex flex-col items-center gap-4">
                            <p className="text-2xl font-bold text-text-primary">
                                {winner === playerNum ? "Tu as gagné ! 🎉" : "Tu as perdu…"}
                            </p>
                            <p className="text-text-secondary text-sm">
                                Joueur {winner} remporte la partie
                            </p>
                            <div className="text-lg font-bold text-brand-primary">
                                {scores.p1} – {scores.p2}
                            </div>
                            <button
                                onClick={onExit}
                                className="w-full py-3 bg-brand-primary text-white rounded-xl font-semibold"
                            >
                                Retour au lobby
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <p className="text-text-secondary text-sm">
                Déplace ton doigt / la souris pour bouger ta raquette
            </p>
        </div>
    )
}
