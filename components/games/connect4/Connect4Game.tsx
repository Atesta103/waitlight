"use client"

import { useState, useCallback, useEffect } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { useGameChannel } from "@/components/games/shared/useGameChannel"
import { cn } from "@/lib/utils/cn"

const COLS = 7
const ROWS = 6

type Cell = 0 | 1 | 2
type Board = Cell[][]

interface MoveMsg {
    type: "move"
    col: number
    player: 1 | 2
}

interface ResetMsg {
    type: "reset"
}

type GameMsg = MoveMsg | ResetMsg

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
    onExit: () => void
}

export function Connect4Game({ merchantId, roomCode, playerNum, onExit }: Connect4GameProps) {
    const [board, setBoard] = useState<Board>(emptyBoard)
    const [currentTurn, setCurrentTurn] = useState<1 | 2>(1)
    const [winner, setWinner] = useState<0 | 1 | 2 | "draw">(0)
    const [hoverCol, setHoverCol] = useState<number | null>(null)
    const [lastDrop, setLastDrop] = useState<{ row: number; col: number } | null>(null)
    const prefersReduced = useReducedMotion()
    const channelName = `connect4:${merchantId}:${roomCode}`

    const onMessage = useCallback(
        (payload: Record<string, unknown>) => {
            const msg = payload as unknown as GameMsg
            if (msg.type === "move") {
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
        [],
    )

    const { broadcast } = useGameChannel({ channelName, onMessage })

    const handleColumnClick = useCallback(
        (col: number) => {
            if (winner !== 0) return
            if (currentTurn !== playerNum) return

            setBoard((prev) => {
                const result = dropPiece(prev, col, playerNum)
                if (!result) return prev

                broadcast({ type: "move", col, player: playerNum } satisfies MoveMsg)
                setLastDrop({ row: result.row, col })

                if (checkWin(result.board, result.row, col, playerNum)) {
                    setWinner(playerNum)
                } else if (isDraw(result.board)) {
                    setWinner("draw")
                } else {
                    setCurrentTurn(playerNum === 1 ? 2 : 1)
                }

                return result.board
            })
        },
        [winner, currentTurn, playerNum, broadcast],
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
            <div className="flex items-center gap-3 bg-surface-card border border-border-default rounded-xl px-4 py-2">
                {winner === 0 ? (
                    <>
                        <div
                            className="w-4 h-4 rounded-full"
                            style={{ background: currentTurn === 1 ? "#ef4444" : "#eab308" }}
                        />
                        <span className="text-sm font-medium text-text-primary">
                            {isMyTurn ? "C'est ton tour !" : `Tour du Joueur ${currentTurn}`}
                        </span>
                    </>
                ) : winner === "draw" ? (
                    <span className="text-sm font-medium text-text-secondary">Match nul !</span>
                ) : (
                    <span className="text-sm font-bold text-text-primary">
                        {winner === playerNum ? "Tu as gagné ! 🎉" : `Joueur ${winner} gagne !`}
                    </span>
                )}
            </div>

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
                    <span>J1{playerNum === 1 ? " (Toi)" : ""}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <span>J2{playerNum === 2 ? " (Toi)" : ""}</span>
                </div>
            </div>

            {/* Actions */}
            {winner !== 0 && (
                <div className="flex flex-col gap-2 w-full max-w-xs">
                    <button
                        onClick={handleReset}
                        className="w-full py-3 bg-brand-primary text-white rounded-xl font-semibold"
                    >
                        Rejouer
                    </button>
                    <button
                        onClick={onExit}
                        className="w-full py-3 bg-surface-card border border-border-default text-text-secondary rounded-xl font-semibold"
                    >
                        Retour au lobby
                    </button>
                </div>
            )}
        </div>
    )
}
