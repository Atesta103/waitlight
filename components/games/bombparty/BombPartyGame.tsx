"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { useGameChannel } from "@/components/games/shared/useGameChannel"
import { GameResultModal } from "@/components/games/shared/GameResultModal"
import { getRandomSyllable, isValidWord, preloadWords } from "./words"
import { cn } from "@/lib/utils/cn"

const MAX_LIVES = 3
const TURN_DURATION = 10 // seconds

interface AnswerMsg  { type: "answer";    word: string; valid: boolean; player: 1 | 2 }
interface NextTurnMsg{ type: "next_turn"; syllable: string; activePlayer: 1 | 2 }
interface LifeLostMsg{ type: "life_lost"; player: 1 | 2 }
interface GameOverMsg{ type: "game_over"; winner: 1 | 2 }
interface StartMsg   { type: "start";     syllable: string }
interface HelloMsg   { type: "hello";     name: string; player: 1 | 2 }
type GameMsg = HelloMsg | AnswerMsg | NextTurnMsg | LifeLostMsg | GameOverMsg | StartMsg

interface BombPartyGameProps {
    merchantId: string
    roomCode: string
    playerNum: 1 | 2
    myName: string
    onExit: () => void
}

export function BombPartyGame({ merchantId, roomCode, playerNum, myName, onExit }: BombPartyGameProps) {
    const isHost = playerNum === 1
    const channelName = `bombparty:${merchantId}:${roomCode}`

    const [syllable, setSyllable] = useState<string>("")
    const [opponentName, setOpponentName] = useState("Adversaire")
    const [activePlayer, setActivePlayer] = useState<1 | 2>(1)
    const [lives, setLives] = useState<{ p1: number; p2: number }>({ p1: MAX_LIVES, p2: MAX_LIVES })
    const [input, setInput] = useState("")
    const [feedback, setFeedback] = useState<"" | "valid" | "invalid">("")
    const [timeLeft, setTimeLeft] = useState(TURN_DURATION)
    const [gameOver, setGameOver] = useState<0 | 1 | 2>(0)
    const [started, setStarted] = useState(false)
    const [lastWord, setLastWord] = useState<{ word: string; valid: boolean } | null>(null)
    // flashPlayer: which player's hearts row shakes after a life loss
    const [flashPlayer, setFlashPlayer] = useState<0 | 1 | 2>(0)
    const prefersReduced = useReducedMotion()

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const activePlayerRef = useRef<1 | 2>(1)
    const livesRef = useRef({ p1: MAX_LIVES, p2: MAX_LIVES })
    const timeLeftRef = useRef(TURN_DURATION)

    const clearTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current)
    }

    const triggerFlash = (player: 1 | 2) => {
        setFlashPlayer(player)
        setTimeout(() => setFlashPlayer(0), 600)
    }

    const p1Name = playerNum === 1 ? myName : opponentName
    const p2Name = playerNum === 2 ? myName : opponentName

    const onMessage = useCallback(
        (payload: Record<string, unknown>) => {
            const msg = payload as unknown as GameMsg

            if (msg.type === "hello") {
                if (msg.player !== playerNum) setOpponentName(msg.name)
            } else if (msg.type === "start") {
                setSyllable(msg.syllable)
                setActivePlayer(1)
                activePlayerRef.current = 1
                setStarted(true)
                setTimeLeft(TURN_DURATION)
            } else if (msg.type === "next_turn") {
                setSyllable(msg.syllable)
                setActivePlayer(msg.activePlayer)
                activePlayerRef.current = msg.activePlayer
                setTimeLeft(TURN_DURATION)
                setInput("")
                setFeedback("")
                setLastWord(null)
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
                triggerFlash(msg.player)
            } else if (msg.type === "game_over") {
                setGameOver(msg.winner)
                clearTimer()
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [playerNum],
    )

    const { broadcast } = useGameChannel({ channelName, onMessage })

    useEffect(() => { preloadWords() }, [])

    useEffect(() => {
        const timer = setTimeout(() => {
            broadcast({ type: "hello", name: myName, player: playerNum } satisfies HelloMsg)
        }, 300)
        return () => clearTimeout(timer)
    }, [broadcast, myName, playerNum])

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

    // Countdown timer — all side effects outside the setTimeLeft updater (React 18 Strict Mode safety)
    useEffect(() => {
        if (!started || gameOver !== 0) return
        timeLeftRef.current = TURN_DURATION
        setTimeLeft(TURN_DURATION)
        clearTimer()
        timerRef.current = setInterval(() => {
            const next = timeLeftRef.current - 1
            timeLeftRef.current = next <= 0 ? TURN_DURATION : next
            setTimeLeft(timeLeftRef.current)

            if (next <= 0 && isHost) {
                const ap = activePlayerRef.current
                const newLives = {
                    p1: ap === 1 ? livesRef.current.p1 - 1 : livesRef.current.p1,
                    p2: ap === 2 ? livesRef.current.p2 - 1 : livesRef.current.p2,
                }
                livesRef.current = newLives
                setLives(newLives)
                broadcast({ type: "life_lost", player: ap } satisfies LifeLostMsg)
                triggerFlash(ap)

                const loser = newLives.p1 <= 0 ? 1 : newLives.p2 <= 0 ? 2 : 0
                if (loser !== 0) {
                    const w: 1 | 2 = loser === 1 ? 2 : 1
                    broadcast({ type: "game_over", winner: w } satisfies GameOverMsg)
                    setGameOver(w)
                    clearTimer()
                    return
                }

                const nextPlayer: 1 | 2 = ap === 1 ? 2 : 1
                const newSyl = getRandomSyllable()
                activePlayerRef.current = nextPlayer
                setActivePlayer(nextPlayer)
                setInput("")
                setFeedback("")
                setLastWord(null)
                broadcast({ type: "next_turn", syllable: newSyl, activePlayer: nextPlayer } satisfies NextTurnMsg)
                setSyllable(newSyl)
            }
        }, 1000)
        return () => clearTimer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [started, gameOver, broadcast, isHost, activePlayer])

    const submitWord = useCallback(() => {
        if (activePlayer !== playerNum || gameOver !== 0) return
        const word = input.trim()
        if (word.length <= 3) {
            setFeedback("invalid")
            setTimeout(() => setFeedback(""), 600)
            return
        }
        const valid = isValidWord(word, syllable)
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

    // Urgency level 0–1 based on time remaining (0 = start of turn, 1 = expired)
    const urgency = Math.max(0, Math.min(1, (TURN_DURATION - timeLeft) / TURN_DURATION))

    const renderHearts = (count: number, player: 1 | 2) => (
        <motion.div
            className="flex gap-0.5 text-xl"
            animate={!prefersReduced && flashPlayer === player
                ? { x: [0, -6, 6, -5, 5, -3, 0], scale: [1, 1.15, 1] }
                : {}
            }
            transition={{ duration: 0.35, ease: "easeOut" }}
        >
            {Array.from({ length: MAX_LIVES }).map((_, i) => (
                <motion.span
                    key={i}
                    className={i < count ? "text-red-500" : "text-text-disabled"}
                    animate={!prefersReduced && flashPlayer === player && i === count
                        ? { scale: [1.6, 0], opacity: [1, 0] }
                        : {}
                    }
                    transition={{ duration: 0.3, ease: "easeIn" }}
                >
                    ♥
                </motion.span>
            ))}
        </motion.div>
    )

    return (
        <div className="flex flex-col items-center gap-5 w-full max-w-sm">
            {/* Lives */}
            <div className="flex justify-between w-full bg-surface-card border border-border-default rounded-xl px-4 py-3">
                <div className="flex flex-col items-center gap-1">
                    <span className="text-xs text-text-secondary font-medium truncate max-w-20">
                        {p1Name}{playerNum === 1 ? " ✦" : ""}
                    </span>
                    {renderHearts(lives.p1, 1)}
                </div>
                <div className="flex flex-col items-center justify-center">
                    <span className="text-xs text-text-secondary">
                        {activePlayer === playerNum ? "Ton tour !" : `Tour de ${activePlayer === 1 ? p1Name : p2Name}`}
                    </span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <span className="text-xs text-text-secondary font-medium truncate max-w-20">
                        {p2Name}{playerNum === 2 ? " ✦" : ""}
                    </span>
                    {renderHearts(lives.p2, 2)}
                </div>
            </div>

            {/* Bomb + syllable — no timer number, urgency shown through bomb animation */}
            <div className="relative flex flex-col items-center gap-4">
                <div
                    className="rounded-full transition-all duration-300"
                    style={{
                        filter: prefersReduced ? "none"
                            : timeLeft <= 3
                              ? "drop-shadow(0 0 16px rgba(239,68,68,0.85))"
                              : timeLeft <= 6
                                ? "drop-shadow(0 0 8px rgba(251,146,60,0.55))"
                                : "none",
                    }}
                >
                    <motion.div
                        className="text-7xl select-none"
                        animate={prefersReduced ? {} : {
                            scale: [1, 1 + urgency * 0.12, 1],
                            rotate: timeLeft <= 3 ? [-3, 3, -3, 3, 0] : 0,
                        }}
                        transition={{
                            duration: timeLeft <= 3 ? 0.22 : timeLeft <= 6 ? 0.38 : 0.55,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    >
                        💣
                    </motion.div>
                </div>

                {/* Syllable display */}
                {started && syllable ? (
                    <motion.div
                        key={syllable}
                        initial={prefersReduced ? {} : { opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 22 }}
                        className="bg-surface-card border-2 border-brand-primary rounded-2xl px-8 py-4"
                    >
                        <span className="text-4xl font-black tracking-widest text-brand-primary">
                            {syllable}
                        </span>
                    </motion.div>
                ) : (
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-brand-primary rounded-full animate-pulse" />
                        <span className="text-text-secondary text-sm">En attente du démarrage…</span>
                    </div>
                )}
            </div>

            {/* Last word feedback */}
            <AnimatePresence mode="wait">
                {lastWord && (
                    <motion.div
                        key={lastWord.word}
                        initial={{ opacity: 0, y: -10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.15 }}
                        className={cn(
                            "text-sm font-medium px-4 py-1.5 rounded-full",
                            lastWord.valid
                                ? "bg-feedback-success-bg text-feedback-success"
                                : "bg-feedback-error-bg text-feedback-error",
                        )}
                    >
                        {lastWord.valid ? `✓ "${lastWord.word}"` : `✗ "${lastWord.word}" — invalide`}
                    </motion.div>
                )}
            </AnimatePresence>

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

            {/* Game over modal */}
            {gameOver !== 0 && (
                <GameResultModal
                    outcome={gameOver === playerNum ? "win" : "lose"}
                    title={gameOver === playerNum ? "Tu as gagné !" : "Tu as perdu…"}
                    subtitle={
                        gameOver === playerNum
                            ? "La bombe a explosé pour l'adversaire !"
                            : "La bombe t'a explosé à la figure !"
                    }
                    onExit={onExit}
                    exitLabel="Retour au lobby"
                />
            )}
        </div>
    )
}
