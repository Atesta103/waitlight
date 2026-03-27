"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { useGameChannel } from "@/components/games/shared/useGameChannel"
import { GameResultModal } from "@/components/games/shared/GameResultModal"
import { cn } from "@/lib/utils/cn"
import { createClient } from "@/lib/supabase/client"

const COLS = 7
const ROWS = 6

type Cell = 0 | 1 | 2
type Board = Cell[][]

interface HelloMsg {
    type: "hello"
    name: string
    player: 1 | 2
}

interface MoveMsg {
    type: "move"
    col: number
    player: 1 | 2
}

interface ResetMsg {
    type: "reset"
}

type GameMsg = HelloMsg | MoveMsg | ResetMsg

function emptyBoard(): Board {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(0) as Cell[])
}

function dropPiece(board: Board, col: number, player: 1 | 2): { board: Board; row: number } | null {
    for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r][col] === 0) {
            const newBoard = board.map((row) => [...row]) as Board
            newBoard[r][col] = player
            return { board: newBoard, row: r }
        }
    }
    return null // column full
}

function checkWin(board: Board, row: number, col: number, player: 1 | 2): boolean {
    const dirs = [
        [0, 1], [1, 0], [1, 1], [1, -1],
    ]
    for (const [dr, dc] of dirs) {
        let count = 1
        for (let i = 1; i <= 3; i++) {
            const r = row + dr * i
            const c = col + dc * i
            if (r < 0 || r >= ROWS || c < 0 || c >= COLS) break
            if (board[r][c] !== player) break
            count++
        }
        for (let i = 1; i <= 3; i++) {
            const r = row - dr * i
            const c = col - dc * i
            if (r < 0 || r >= ROWS || c < 0 || c >= COLS) break
            if (board[r][c] !== player) break
            count++
        }
        if (count >= 4) return true
    }
    return false
}

function isDraw(board: Board): boolean {
    return board[0].every((cell) => cell !== 0)
}

interface Connect4GameProps {
    merchantId: string
    roomCode: string
    playerNum: 1 | 2
    ticketId: string
    myName: string
    onExit: () => void
}

export function Connect4Game({ merchantId, roomCode, playerNum, ticketId, myName, onExit }: Connect4GameProps) {
    const [board, setBoard] = useState<Board>(emptyBoard)
    const [currentTurn, setCurrentTurn] = useState<1 | 2>(1)
    const [winner, setWinner] = useState<0 | 1 | 2 | "draw">(0)
    const [hoverCol, setHoverCol] = useState<number | null>(null)
    const [lastDrop, setLastDrop] = useState<{ row: number; col: number } | null>(null)
    const [opponentName, setOpponentName] = useState("Adversaire")
    const prefersReduced = useReducedMotion()
    const channelName = `connect4:${merchantId}:${roomCode}`
    const hasExitedRef = useRef(false)

    const safeExit = useCallback(() => {
        if (hasExitedRef.current) return
        hasExitedRef.current = true
        onExit()
    }, [onExit])

    const p1Name = playerNum === 1 ? myName : opponentName
    const p2Name = playerNum === 2 ? myName : opponentName

    const onMessage = useCallback(
        (payload: Record<string, unknown>) => {
            const msg = payload as unknown as GameMsg
            if (msg.type === "hello") {
                if (msg.player !== playerNum) setOpponentName(msg.name)
            } else if (msg.type === "move") {
                if (msg.player === playerNum) return // own move already applied locally
                setBoard((prev) => {
                    const result = dropPiece(prev, msg.col, msg.player)
                    if (!result) return prev
                    setLastDrop({ row: result.row, col: msg.col })
                    if (checkWin(result.board, result.row, msg.col, msg.player)) {
                        setWinner(msg.player)
                    } else if (isDraw(result.board)) {
                        setWinner("draw")
                    } else {
                        setCurrentTurn(msg.player === 1 ? 2 : 1)
                    }
                    return result.board
                })
            } else if (msg.type === "reset") {
                setBoard(emptyBoard())
                setCurrentTurn(1)
                setWinner(0)
                setLastDrop(null)
            }
        },
        [playerNum],
    )

    const { broadcast } = useGameChannel({
        channelName,
        onMessage,
        onReady: useCallback(() => {
            // broadcast is not available here — handled via separate effect
        }, []),
    })

    // Send hello when channel is ready (via broadcast ref, after mount)
    useEffect(() => {
        const timer = setTimeout(() => {
            broadcast({ type: "hello", name: myName, player: playerNum } satisfies HelloMsg)
        }, 300)
        return () => clearTimeout(timer)
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

    const handleColumnClick = useCallback(
        (col: number) => {
            if (winner !== 0) return
            if (currentTurn !== playerNum) return

            // Compute move using current board (in deps) — outside state updater to avoid Strict Mode double-call
            const result = dropPiece(board, col, playerNum)
            if (!result) return

            setBoard(result.board)
            setLastDrop({ row: result.row, col })

            if (checkWin(result.board, result.row, col, playerNum)) {
                setWinner(playerNum)
            } else if (isDraw(result.board)) {
                setWinner("draw")
            } else {
                setCurrentTurn(playerNum === 1 ? 2 : 1)
            }

            // Broadcast outside state updater — fires exactly once
            broadcast({ type: "move", col, player: playerNum } satisfies MoveMsg)
        },
        [winner, currentTurn, playerNum, board, broadcast],
    )

    const handleReset = useCallback(() => {
        setBoard(emptyBoard())
        setCurrentTurn(1)
        setWinner(0)
        setLastDrop(null)
        broadcast({ type: "reset" } satisfies ResetMsg)
    }, [broadcast])

    const isMyTurn = currentTurn === playerNum && winner === 0

    return (
        <div className="flex flex-col items-center gap-4 w-full">
            {/* Status */}
            {winner === 0 && (
                <div className="flex items-center gap-3 bg-surface-card border border-border-default rounded-xl px-4 py-2">
                    <div
                        className="w-4 h-4 rounded-full"
                        style={{ background: currentTurn === 1 ? "#ef4444" : "#eab308" }}
                    />
                    <span className="text-sm font-medium text-text-primary">
                        {isMyTurn ? "C'est ton tour !" : `Tour de ${currentTurn === 1 ? p1Name : p2Name}`}
                    </span>
                </div>
            )}

            {/* Board */}
            <div
                className="bg-blue-600 rounded-xl p-2 select-none"
                onMouseLeave={() => setHoverCol(null)}
            >
                {/* Column hover indicators */}
                <div className="flex mb-1">
                    {Array.from({ length: COLS }).map((_, col) => (
                        <div
                            key={col}
                            className="flex-1 flex justify-center"
                            style={{ width: 40 }}
                        >
                            {hoverCol === col && isMyTurn && (
                                <div
                                    className="w-4 h-4 rounded-full"
                                    style={{ background: playerNum === 1 ? "#ef4444" : "#eab308" }}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Grid */}
                <div
                    className="grid gap-1"
                    style={{ gridTemplateColumns: `repeat(${COLS}, 40px)` }}
                >
                    {Array.from({ length: ROWS }).map((_, row) =>
                        Array.from({ length: COLS }).map((_, col) => {
                            const cell = board[row][col]
                            const isLastDrop = lastDrop?.row === row && lastDrop?.col === col

                            return (
                                <button
                                    key={`${row}-${col}`}
                                    onClick={() => handleColumnClick(col)}
                                    onMouseEnter={() => setHoverCol(col)}
                                    className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center",
                                        "transition-colors",
                                        isMyTurn && cell === 0 ? "cursor-pointer" : "cursor-default",
                                        hoverCol === col && isMyTurn && cell === 0
                                            ? "bg-blue-400"
                                            : "bg-blue-700",
                                    )}
                                    aria-label={`Colonne ${col + 1}`}
                                >
                                    {cell !== 0 && (
                                        <motion.div
                                            className="w-9 h-9 rounded-full"
                                            style={{
                                                background: cell === 1 ? "#ef4444" : "#eab308",
                                                boxShadow: isLastDrop
                                                    ? `0 0 8px ${cell === 1 ? "#ef4444" : "#eab308"}`
                                                    : "none",
                                            }}
                                            initial={
                                                prefersReduced || !isLastDrop
                                                    ? { scale: 1 }
                                                    : { scale: 0, opacity: 0 }
                                            }
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                        />
                                    )}
                                </button>
                            )
                        }),
                    )}
                </div>
            </div>

            {/* Player legend */}
            <div className="flex gap-4 text-sm text-text-secondary">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span>{p1Name}{playerNum === 1 ? " (Toi)" : ""}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <span>{p2Name}{playerNum === 2 ? " (Toi)" : ""}</span>
                </div>
            </div>

            {winner !== 0 && (
                <GameResultModal
                    outcome={winner === "draw" ? "draw" : winner === playerNum ? "win" : "lose"}
                    title={winner === "draw" ? "Match nul !" : winner === playerNum ? "Tu as gagné !" : "Tu as perdu…"}
                    subtitle={
                        winner !== "draw" && winner !== playerNum
                            ? `${winner === 1 ? p1Name : p2Name} remporte la partie`
                            : undefined
                    }
                    onRestart={handleReset}
                    onExit={safeExit}
                    exitLabel="Retour au lobby"
                />
            )}
        </div>
    )
}
