"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { useGameChannel } from "@/components/games/shared/useGameChannel"
import { GameResultModal } from "@/components/games/shared/GameResultModal"
import { cn } from "@/lib/utils/cn"
import { createClient } from "@/lib/supabase/client"

// Each player may have at most 3 pieces — placing a 4th removes the oldest.
const MAX_PIECES = 3

type Board = (0 | 1 | 2)[]  // 9 cells

const WIN_LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],  // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8],  // cols
    [0, 4, 8], [2, 4, 6],              // diags
]

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

interface HelloMsg  { type: "hello"; name: string; player: 1 | 2 }
interface MoveMsg   { type: "move";  cell: number; player: 1 | 2 }
interface ResetMsg  { type: "reset" }
interface RematchRequestMsg { type: "rematch_request"; player: 1 | 2 }
interface RematchAcceptMsg { type: "rematch_accept"; player: 1 | 2 }
interface RematchDeclineMsg { type: "rematch_decline"; player: 1 | 2 }
type GameMsg = HelloMsg | MoveMsg | ResetMsg | RematchRequestMsg | RematchAcceptMsg | RematchDeclineMsg

// ---------------------------------------------------------------------------
// Game logic
// ---------------------------------------------------------------------------

interface GameState {
    board: Board
    p1Queue: number[]   // oldest first — order of player 1's pieces
    p2Queue: number[]   // oldest first — order of player 2's pieces
    turn: 1 | 2
    winner: 0 | 1 | 2
    winLine: number[] | null
}

function initialState(): GameState {
    return { board: Array(9).fill(0), p1Queue: [], p2Queue: [], turn: 1, winner: 0, winLine: null }
}

function checkWin(board: Board): { winner: 1 | 2; line: number[] } | null {
    for (const line of WIN_LINES) {
        const [a, b, c] = line
        if (board[a] !== 0 && board[a] === board[b] && board[b] === board[c]) {
            return { winner: board[a] as 1 | 2, line }
        }
    }
    return null
}

function applyMove(state: GameState, cell: number, player: 1 | 2): GameState | null {
    // Only valid if the cell is empty and it's the player's turn
    if (state.board[cell] !== 0) return null
    if (state.winner !== 0) return null
    if (state.turn !== player) return null

    const newBoard = [...state.board] as Board
    const newP1Queue = [...state.p1Queue]
    const newP2Queue = [...state.p2Queue]

    // Step 1 — evaporate oldest piece if the player already has MAX_PIECES
    if (player === 1 && newP1Queue.length >= MAX_PIECES) {
        newBoard[newP1Queue.shift()!] = 0
    } else if (player === 2 && newP2Queue.length >= MAX_PIECES) {
        newBoard[newP2Queue.shift()!] = 0
    }

    // Step 2 — place new piece
    newBoard[cell] = player
    if (player === 1) newP1Queue.push(cell)
    else newP2Queue.push(cell)

    // Step 3 — check win
    const result = checkWin(newBoard)

    return {
        board: newBoard,
        p1Queue: newP1Queue,
        p2Queue: newP2Queue,
        turn: player === 1 ? 2 : 1,
        winner: result?.winner ?? 0,
        winLine: result?.line ?? null,
    }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface TicTacToeGameProps {
    merchantId: string
    roomCode: string
    playerNum: 1 | 2
    ticketId: string
    myName: string
    onExit: () => void
}

export function TicTacToeGame({ merchantId, roomCode, playerNum, ticketId, myName, onExit }: TicTacToeGameProps) {
    const [state, setState] = useState<GameState>(initialState)
    const [opponentName, setOpponentName] = useState("Adversaire")
    const [incomingRematchRequest, setIncomingRematchRequest] = useState(false)
    const [waitingRematchResponse, setWaitingRematchResponse] = useState(false)
    const [rematchNotice, setRematchNotice] = useState<string | null>(null)
    const prefersReduced = useReducedMotion()
    const channelName = `tictactoe:${merchantId}:${roomCode}`
    const hasExitedRef = useRef(false)

    const safeExit = useCallback(() => {
        if (hasExitedRef.current) return
        hasExitedRef.current = true
        onExit()
    }, [onExit])

    const resetGame = useCallback(() => {
        setState(initialState())
        setIncomingRematchRequest(false)
        setWaitingRematchResponse(false)
        setRematchNotice(null)
    }, [])

    const p1Name = playerNum === 1 ? myName : opponentName
    const p2Name = playerNum === 2 ? myName : opponentName

    const onMessage = useCallback(
        (payload: Record<string, unknown>) => {
            const msg = payload as unknown as GameMsg
            if (msg.type === "hello") {
                if (msg.player !== playerNum) setOpponentName(msg.name)
            } else if (msg.type === "move") {
                if (msg.player === playerNum) return  // own move already applied locally
                setState((prev) => applyMove(prev, msg.cell, msg.player) ?? prev)
            } else if (msg.type === "reset") {
                resetGame()
            } else if (msg.type === "rematch_request") {
                if (msg.player === playerNum) return
                setIncomingRematchRequest(true)
                setWaitingRematchResponse(false)
                setRematchNotice(`${opponentName} veut sa revanche.`)
            } else if (msg.type === "rematch_accept") {
                if (msg.player === playerNum) return
                resetGame()
            } else if (msg.type === "rematch_decline") {
                if (msg.player === playerNum) return
                setIncomingRematchRequest(false)
                setWaitingRematchResponse(false)
                setRematchNotice(`${opponentName} a refusé la revanche.`)
            }
        },
        [playerNum, resetGame, opponentName],
    )

    const { broadcast } = useGameChannel({ channelName, onMessage })

    useEffect(() => {
        const t = setTimeout(() => {
            broadcast({ type: "hello", name: myName, player: playerNum } satisfies HelloMsg)
        }, 300)
        return () => clearTimeout(t)
    }, [broadcast, myName, playerNum])

    useEffect(() => {
        const supabase = createClient()
        const presenceChannel = supabase.channel(`${channelName}:presence`, {
            config: { presence: { key: ticketId } },
        })

        presenceChannel
            .on("presence", { event: "leave" }, ({ key }) => {
                if (key !== ticketId) safeExit()
            })
            .subscribe((status) => {
                if (status === "SUBSCRIBED") {
                    void presenceChannel.track({ roomCode, playerNum })
                }
            })

        return () => {
            void presenceChannel.untrack()
            void supabase.removeChannel(presenceChannel)
        }
    }, [channelName, roomCode, playerNum, ticketId, safeExit])

    const handleCellClick = useCallback(
        (cell: number) => {
            const next = applyMove(state, cell, playerNum)
            if (!next) return
            setState(next)
            broadcast({ type: "move", cell, player: playerNum } satisfies MoveMsg)
        },
        [state, playerNum, broadcast],
    )

    const requestRematch = useCallback(() => {
        if (waitingRematchResponse || incomingRematchRequest) return
        setWaitingRematchResponse(true)
        setRematchNotice("Demande envoyée. En attente de réponse…")
        broadcast({ type: "rematch_request", player: playerNum } satisfies RematchRequestMsg)
    }, [waitingRematchResponse, incomingRematchRequest, broadcast, playerNum])

    const acceptRematch = useCallback(() => {
        resetGame()
        broadcast({ type: "rematch_accept", player: playerNum } satisfies RematchAcceptMsg)
    }, [resetGame, broadcast, playerNum])

    const declineRematch = useCallback(() => {
        setIncomingRematchRequest(false)
        setWaitingRematchResponse(false)
        setRematchNotice("Revanche refusée.")
        broadcast({ type: "rematch_decline", player: playerNum } satisfies RematchDeclineMsg)
    }, [broadcast, playerNum])

    const isMyTurn = state.turn === playerNum && state.winner === 0

    // The oldest piece of the active player — it will vanish on their next move
    const vanishingCell = (() => {
        if (state.winner !== 0) return -1
        const queue = state.turn === 1 ? state.p1Queue : state.p2Queue
        return queue.length >= MAX_PIECES ? queue[0] : -1
    })()

    return (
        <div className="flex flex-col items-center gap-4 w-full max-w-sm">
            {/* Status */}
            {state.winner === 0 && (
                <div className="flex items-center gap-3 bg-surface-card border border-border-default rounded-xl px-4 py-2.5 w-full justify-center">
                    <div className={cn(
                        "w-3.5 h-3.5 rounded-full shrink-0",
                        state.turn === 1 ? "bg-indigo-500" : "bg-rose-500",
                    )} />
                    <span className="text-sm font-medium text-text-primary">
                        {isMyTurn ? "C'est ton tour !" : `Tour de ${state.turn === 1 ? p1Name : p2Name}`}
                    </span>
                </div>
            )}

            {/* Evaporation hint */}
            {state.winner === 0 && (
                <p className={cn(
                    "text-xs text-center px-2",
                    vanishingCell >= 0 ? "text-orange-500 font-medium" : "text-text-secondary",
                )}>
                    {vanishingCell >= 0
                        ? "⚠️ La pièce qui clignote va disparaître !"
                        : "Max 3 pièces chacun — les plus anciennes s'évaporent"}
                </p>
            )}

            {/* Grid */}
            <div
                className="grid gap-2"
                style={{ gridTemplateColumns: "repeat(3, 96px)" }}
            >
                {state.board.map((cell, idx) => {
                    const isWinCell = state.winLine?.includes(idx) ?? false
                    const isVanishing = vanishingCell === idx
                    const canClick = isMyTurn && cell === 0

                    return (
                        <button
                            key={idx}
                            onClick={() => handleCellClick(idx)}
                            disabled={!canClick}
                            className={cn(
                                "w-24 h-24 rounded-2xl flex items-center justify-center relative",
                                "border-2 transition-colors",
                                isWinCell
                                    ? "border-brand-primary bg-brand-primary/10"
                                    : canClick
                                      ? "border-border-default bg-surface-card hover:border-brand-primary hover:bg-surface-base"
                                      : "border-border-default bg-surface-card cursor-default",
                            )}
                            aria-label={`Case ${idx + 1}`}
                        >
                            <AnimatePresence>
                                {cell !== 0 && (
                                    <motion.div
                                        key={`${idx}-${cell}`}
                                        className={cn(
                                            "w-14 h-14 rounded-full relative",
                                            cell === 1 ? "bg-indigo-500" : "bg-rose-500",
                                            isWinCell && "ring-4 ring-brand-primary ring-offset-2",
                                        )}
                                        initial={prefersReduced ? {} : { scale: 0, opacity: 0 }}
                                        animate={prefersReduced ? {} : {
                                            scale: 1,
                                            opacity: isVanishing ? [1, 0.3, 1] : 1,
                                        }}
                                        exit={prefersReduced ? {} : { scale: 0, opacity: 0, transition: { duration: 0.15 } }}
                                        transition={{
                                            scale: { type: "spring", stiffness: 400, damping: 20 },
                                            opacity: isVanishing
                                                ? { duration: 0.7, repeat: Infinity, ease: "easeInOut" }
                                                : { duration: 0.1 },
                                        }}
                                    >
                                        {/* "About to vanish" badge */}
                                        {isVanishing && (
                                            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-orange-400 rounded-full text-white text-[9px] font-bold flex items-center justify-center leading-none">
                                                !
                                            </span>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>
                    )
                })}
            </div>

            {/* Legend */}
            <div className="flex gap-6 text-sm text-text-secondary">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-500" />
                    <span>{p1Name}{playerNum === 1 ? " (Toi)" : ""}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <span>{p2Name}{playerNum === 2 ? " (Toi)" : ""}</span>
                </div>
            </div>

            {state.winner !== 0 && rematchNotice && (
                <p className="text-xs text-text-secondary text-center">{rematchNotice}</p>
            )}

            {state.winner !== 0 && (
                <GameResultModal
                    outcome={incomingRematchRequest ? "draw" : state.winner === playerNum ? "win" : "lose"}
                    title={incomingRematchRequest ? "Demande de revanche" : state.winner === playerNum ? "Tu as gagné !" : "Tu as perdu…"}
                    subtitle={
                        incomingRematchRequest
                            ? `${opponentName} veut rejouer cette partie.`
                            : state.winner !== playerNum
                            ? `${state.winner === 1 ? p1Name : p2Name} remporte la partie`
                            : undefined
                    }
                    onRestart={incomingRematchRequest ? acceptRematch : requestRematch}
                    restartLabel={
                        incomingRematchRequest
                            ? "Accepter"
                            : waitingRematchResponse
                              ? "En attente…"
                              : "Demander une revanche"
                    }
                    restartDisabled={waitingRematchResponse}
                    onExit={incomingRematchRequest ? declineRematch : safeExit}
                    exitLabel={incomingRematchRequest ? "Refuser" : "Retour au lobby"}
                />
            )}
        </div>
    )
}
