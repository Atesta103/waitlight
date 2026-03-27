"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { useGameChannel } from "@/components/games/shared/useGameChannel"
import { getRandomSyllable, containsSyllable } from "./words"
import { cn } from "@/lib/utils/cn"

const MAX_LIVES = 3
const TURN_DURATION = 10 // seconds

interface AnswerMsg {
    type: "answer"
    word: string
    valid: boolean
    player: 1 | 2
}

interface NextTurnMsg {
    type: "next_turn"
    syllable: string
    activePlayer: 1 | 2
}

interface LifeLostMsg {
    type: "life_lost"
    player: 1 | 2
}

interface GameOverMsg {
    type: "game_over"
    winner: 1 | 2
}

interface StartMsg {
    type: "start"
    syllable: string
}

type GameMsg = AnswerMsg | NextTurnMsg | LifeLostMsg | GameOverMsg | StartMsg

interface BombPartyGameProps {
    merchantId: string
    roomCode: string
    playerNum: 1 | 2
    onExit: () => void
}

export function BombPartyGame({ merchantId, roomCode, playerNum, onExit }: BombPartyGameProps) {
    const isHost = playerNum === 1
    const channelName = `bombparty:${merchantId}:${roomCode}`

    const [syllable, setSyllable] = useState<string>("")
    const [activePlayer, setActivePlayer] = useState<1 | 2>(1)
    const [lives, setLives] = useState<{ p1: number; p2: number }>({ p1: MAX_LIVES, p2: MAX_LIVES })
    const [input, setInput] = useState("")
    const [feedback, setFeedback] = useState<"" | "valid" | "invalid">("")
    const [timeLeft, setTimeLeft] = useState(TURN_DURATION)
    const [gameOver, setGameOver] = useState<0 | 1 | 2>(0)
    const [started, setStarted] = useState(false)
    const [lastWord, setLastWord] = useState<{ word: string; valid: boolean } | null>(null)
    const prefersReduced = useReducedMotion()

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const activePlayerRef = useRef<1 | 2>(1)
    const livesRef = useRef({ p1: MAX_LIVES, p2: MAX_LIVES })

    const clearTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current)
    }

    const onMessage = useCallback(
        (payload: Record<string, unknown>) => {
            const msg = payload as unknown as GameMsg

            if (msg.type === "start") {
                setSyllable(msg.syllable)
                setActivePlayer(1)
                activePlayerRef.current = 1
                setStarted(true)
                setTimeLeft(TURN_DURATION)
                // timer effect re-runs when started flips to true
            } else if (msg.type === "next_turn") {
                setSyllable(msg.syllable)
                setActivePlayer(msg.activePlayer)
                activePlayerRef.current = msg.activePlayer
                setTimeLeft(TURN_DURATION)
                setInput("")
                setFeedback("")
                setLastWord(null)
                // don't clearTimer — let running interval pick up the reset timeLeft
            } else if (msg.type === "answer") {
                setLastWord({ word: msg.word, valid: msg.valid })
            } else if (msg.type === "life_lost") {
                setLives((prev) => {
                    const next = {
                        p1: msg.player === 1 ? prev.p1 - 1 : prev.p1,
                        p2: msg.player === 2 ? prev.p2 - 1 : prev.p2,
                    }
                    livesRef.current = next
                    return next
                })
            } else if (msg.type === "game_over") {
                setGameOver(msg.winner)
                clearTimer()
            }
        },
        [],
    )

    const { broadcast } = useGameChannel({ channelName, onMessage })

    // Host starts the game when both join
    useEffect(() => {
        if (!isHost) return
        const timer = setTimeout(() => {
            const s = getRandomSyllable()
            broadcast({ type: "start", syllable: s } satisfies StartMsg)
            setSyllable(s)
            setActivePlayer(1)
            activePlayerRef.current = 1
            setStarted(true)
            setTimeLeft(TURN_DURATION)
        }, 1500)
        return () => clearTimeout(timer)
    }, [isHost, broadcast])

    // Countdown timer — both players tick visually; only host drives state changes
    useEffect(() => {
        if (!started || gameOver !== 0) return
        clearTimer()
        timerRef.current = setInterval(() => {
            setTimeLeft((t) => {
                if (t <= 1) {
                    if (isHost) {
                        // Host decides timeout consequences
                        const ap = activePlayerRef.current
                        const newLives = {
                            p1: ap === 1 ? livesRef.current.p1 - 1 : livesRef.current.p1,
                            p2: ap === 2 ? livesRef.current.p2 - 1 : livesRef.current.p2,
                        }
                        livesRef.current = newLives
                        setLives(newLives)
                        broadcast({ type: "life_lost", player: ap } satisfies LifeLostMsg)

                        const loser = newLives.p1 <= 0 ? 1 : newLives.p2 <= 0 ? 2 : 0
                        if (loser !== 0) {
                            const w: 1 | 2 = loser === 1 ? 2 : 1
                            broadcast({ type: "game_over", winner: w } satisfies GameOverMsg)
                            setGameOver(w)
                            clearTimer()
                            return 0
                        }

                        const next: 1 | 2 = ap === 1 ? 2 : 1
                        const newSyl = getRandomSyllable()
                        activePlayerRef.current = next
                        setActivePlayer(next)
                        setInput("")
                        setFeedback("")
                        setLastWord(null)
                        broadcast({ type: "next_turn", syllable: newSyl, activePlayer: next } satisfies NextTurnMsg)
                        setSyllable(newSyl)
                    }
                    return TURN_DURATION
                }
                return t - 1
            })
        }, 1000)
        return () => clearTimer()
    }, [started, gameOver, broadcast, isHost])

    const submitWord = useCallback(() => {
        if (activePlayer !== playerNum || gameOver !== 0) return
        const word = input.trim()
        if (word.length <= 3) {
            setFeedback("invalid")
            setTimeout(() => setFeedback(""), 600)
            return
        }
        const valid = containsSyllable(word, syllable)
        setLastWord({ word, valid })
        broadcast({ type: "answer", word, valid, player: playerNum } satisfies AnswerMsg)
        setFeedback(valid ? "valid" : "invalid")

        if (valid) {
            setTimeout(() => {
                const next: 1 | 2 = playerNum === 1 ? 2 : 1
                const newSyl = getRandomSyllable()
                activePlayerRef.current = next
                setActivePlayer(next)
                setInput("")
                setFeedback("")
                setLastWord(null)
                broadcast({ type: "next_turn", syllable: newSyl, activePlayer: next } satisfies NextTurnMsg)
                setSyllable(newSyl)
            }, 600)
        } else {
            setTimeout(() => setFeedback(""), 600)
            setInput("")
        }
    }, [activePlayer, playerNum, gameOver, input, syllable, broadcast])

    const isMyTurn = activePlayer === playerNum && gameOver === 0 && started

    const renderHearts = (count: number) =>
        Array.from({ length: MAX_LIVES }).map((_, i) => (
            <span key={i} className={i < count ? "text-red-500" : "text-text-disabled"}>
                ♥
            </span>
        ))

    return (
        <div className="flex flex-col items-center gap-5 w-full max-w-sm">
            {/* Lives */}
            <div className="flex justify-between w-full bg-surface-card border border-border-default rounded-xl px-4 py-3">
                <div className="flex flex-col items-center gap-1">
                    <span className="text-xs text-text-secondary">J1{playerNum === 1 ? " (Toi)" : ""}</span>
                    <div className="flex gap-0.5 text-lg">{renderHearts(lives.p1)}</div>
                </div>
                <div className="flex flex-col items-center justify-center">
                    <span className="text-xs text-text-secondary">
                        {activePlayer === playerNum ? "Ton tour !" : `Tour J${activePlayer}`}
                    </span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <span className="text-xs text-text-secondary">J2{playerNum === 2 ? " (Toi)" : ""}</span>
                    <div className="flex gap-0.5 text-lg">{renderHearts(lives.p2)}</div>
                </div>
            </div>

            {/* Bomb + syllable */}
            <div className="relative flex flex-col items-center gap-3">
                <motion.div
                    className="text-6xl"
                    animate={
                        prefersReduced
                            ? {}
                            : { scale: timeLeft <= 3 ? [1, 1.1, 1] : 1 }
                    }
                    transition={{ duration: 0.3, repeat: timeLeft <= 3 ? Infinity : 0 }}
                >
                    💣
                </motion.div>

                {/* Timer ring */}
                <div className="flex items-center justify-center">
                    <div
                        className={cn(
                            "w-12 h-12 rounded-full border-4 flex items-center justify-center font-bold text-lg",
                            timeLeft <= 3
                                ? "border-red-500 text-red-500"
                                : timeLeft <= 5
                                  ? "border-yellow-500 text-yellow-500"
                                  : "border-brand-primary text-brand-primary",
                        )}
                    >
                        {timeLeft}
                    </div>
                </div>

                {/* Syllable display */}
                {started && syllable ? (
                    <div className="bg-surface-card border-2 border-brand-primary rounded-2xl px-8 py-4">
                        <span className="text-4xl font-black tracking-widest text-brand-primary">
                            {syllable}
                        </span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-brand-primary rounded-full animate-pulse" />
                        <span className="text-text-secondary text-sm">En attente du démarrage…</span>
                    </div>
                )}
            </div>

            {/* Last word feedback */}
            {lastWord && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                        "text-sm font-medium px-3 py-1 rounded-full",
                        lastWord.valid
                            ? "bg-feedback-success-bg text-feedback-success"
                            : "bg-feedback-error-bg text-feedback-error",
                    )}
                >
                    {lastWord.valid ? `✓ "${lastWord.word}"` : `✗ "${lastWord.word}" — invalide`}
                </motion.div>
            )}

            {/* Input */}
            {gameOver === 0 && started && (
                <div className="flex gap-2 w-full sticky bottom-0 pb-1">
                    <input
                        type="text"
                        inputMode="text"
                        enterKeyHint="send"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && submitWord()}
                        disabled={!isMyTurn}
                        placeholder={isMyTurn ? `Un mot avec "${syllable}"…` : "En attente…"}
                        className={cn(
                            "flex-1 py-3 px-4 bg-surface-card border rounded-xl text-text-primary text-sm",
                            "focus:outline-none transition-colors",
                            feedback === "valid"
                                ? "border-feedback-success"
                                : feedback === "invalid"
                                  ? "border-feedback-error"
                                  : "border-border-default focus:border-brand-primary",
                            !isMyTurn && "opacity-50 cursor-not-allowed",
                        )}
                        autoComplete="off"
                        autoCapitalize="none"
                    />
                    <button
                        onClick={submitWord}
                        disabled={!isMyTurn}
                        className={cn(
                            "px-4 py-3 rounded-xl font-semibold text-sm transition-opacity",
                            isMyTurn
                                ? "bg-brand-primary text-white"
                                : "bg-surface-card border border-border-default text-text-disabled cursor-not-allowed",
                        )}
                    >
                        OK
                    </button>
                </div>
            )}

            {/* Game over */}
            {gameOver !== 0 && (
                <div className="flex flex-col items-center gap-4 bg-surface-card border border-border-default rounded-2xl p-6 w-full">
                    <p className="text-xl font-bold text-text-primary">
                        {gameOver === playerNum ? "Tu as gagné ! 🎉" : "Tu as perdu… 💥"}
                    </p>
                    <p className="text-sm text-text-secondary">
                        Joueur {gameOver} remporte la partie
                    </p>
                    <div className="flex flex-col gap-2 w-full">
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
    )
}
