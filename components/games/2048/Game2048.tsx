"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { GameOverlay } from "@/components/games/shared/GameOverlay"
import { cn } from "@/lib/utils/cn"

type Board = (number | null)[][]

interface TileState {
    id: number
    value: number
    row: number
    col: number
    merged?: boolean
    isNew?: boolean
}

let tileIdCounter = 0
function nextId() {
    return ++tileIdCounter
}

function emptyBoard(): Board {
    return Array.from({ length: 4 }, () => Array(4).fill(null))
}

function addRandom(board: Board): Board {
    const empties: { r: number; c: number }[] = []
    for (let r = 0; r < 4; r++)
        for (let c = 0; c < 4; c++)
            if (!board[r][c]) empties.push({ r, c })
    if (empties.length === 0) return board
    const { r, c } = empties[Math.floor(Math.random() * empties.length)]
    const newBoard = board.map((row) => [...row])
    newBoard[r][c] = Math.random() < 0.9 ? 2 : 4
    return newBoard
}

function getInitialBoard(): Board {
    let board = emptyBoard()
    board = addRandom(board)
    board = addRandom(board)
    return board
}

function slideRow(row: (number | null)[]): { result: (number | null)[]; score: number } {
    const nums = row.filter((v) => v !== null) as number[]
    let score = 0
    const merged: (number | null)[] = []
    let i = 0
    while (i < nums.length) {
        if (i + 1 < nums.length && nums[i] === nums[i + 1]) {
            const val = nums[i] * 2
            merged.push(val)
            score += val
            i += 2
        } else {
            merged.push(nums[i])
            i++
        }
    }
    while (merged.length < 4) merged.push(null)
    return { result: merged, score }
}

type MoveDir = "left" | "right" | "up" | "down"

function move(board: Board, dir: MoveDir): { board: Board; score: number; moved: boolean } {
    let totalScore = 0
    let moved = false
    const newBoard = emptyBoard()

    const getRow = (r: number): (number | null)[] => {
        if (dir === "left" || dir === "right") return [...board[r]]
        return board.map((row) => row[r])
    }

    const setRow = (r: number, arr: (number | null)[]) => {
        if (dir === "left" || dir === "right") {
            newBoard[r] = arr
        } else {
            arr.forEach((v, i) => {
                newBoard[i][r] = v
            })
        }
    }

    for (let i = 0; i < 4; i++) {
        let row = getRow(i)
        if (dir === "right" || dir === "down") row = row.reverse()
        const { result, score } = slideRow(row)
        let finalRow = result
        if (dir === "right" || dir === "down") finalRow = finalRow.reverse()
        setRow(i, finalRow)
        totalScore += score

        // Check if moved
        const original = getRow(i)
        const orig = (dir === "right" || dir === "down") ? [...original].reverse() : original
        const res = (dir === "right" || dir === "down") ? [...result].reverse() : result
        if (orig.some((v, j) => v !== res[j])) moved = true
    }

    return { board: newBoard, score: totalScore, moved }
}

function hasWon(board: Board): boolean {
    return board.some((row) => row.some((v) => v === 2048))
}

function canMove(board: Board): boolean {
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (!board[r][c]) return true
            if (c + 1 < 4 && board[r][c] === board[r][c + 1]) return true
            if (r + 1 < 4 && board[r][c] === board[r + 1][c]) return true
        }
    }
    return false
}

function tileColor(value: number): string {
    const map: Record<number, string> = {
        2: "bg-slate-100 text-slate-800",
        4: "bg-indigo-50 text-indigo-900",
        8: "bg-orange-300 text-white",
        16: "bg-orange-400 text-white",
        32: "bg-rose-400 text-white",
        64: "bg-rose-500 text-white",
        128: "bg-yellow-400 text-white",
        256: "bg-yellow-500 text-white",
        512: "bg-amber-500 text-white",
        1024: "bg-amber-600 text-white",
        2048: "bg-brand-primary text-white",
    }
    return map[value] ?? "bg-purple-700 text-white"
}

function boardToTiles(board: Board): TileState[] {
    const tiles: TileState[] = []
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (board[r][c] !== null) {
                tiles.push({ id: nextId(), value: board[r][c]!, row: r, col: c })
            }
        }
    }
    return tiles
}

export function Game2048() {
    const [board, setBoard] = useState<Board>(getInitialBoard)
    const [score, setScore] = useState(0)
    const [bestScore, setBestScore] = useState(0)
    const [status, setStatus] = useState<"playing" | "won" | "lost">("playing")
    const [tiles, setTiles] = useState<TileState[]>(() => boardToTiles(getInitialBoard()))
    const touchStartRef = useRef<{ x: number; y: number } | null>(null)
    const prefersReduced = useReducedMotion()

    const handleMove = useCallback(
        (dir: MoveDir) => {
            if (status !== "playing") return
            setBoard((prev) => {
                const { board: next, score: earned, moved } = move(prev, dir)
                if (!moved) return prev

                let finalBoard = next
                let newBoard = addRandom(next)
                // Find the new tile
                const newTiles: TileState[] = []
                for (let r = 0; r < 4; r++) {
                    for (let c = 0; c < 4; c++) {
                        if (newBoard[r][c] !== null) {
                            newTiles.push({ id: nextId(), value: newBoard[r][c]!, row: r, col: c })
                        }
                    }
                }
                finalBoard = newBoard

                setTiles(newTiles)
                setScore((s) => {
                    const ns = s + earned
                    setBestScore((b) => Math.max(b, ns))
                    return ns
                })

                if (hasWon(finalBoard)) setStatus("won")
                else if (!canMove(finalBoard)) setStatus("lost")

                return finalBoard
            })
        },
        [status],
    )

    const resetGame = useCallback(() => {
        const b = getInitialBoard()
        setBoard(b)
        setTiles(boardToTiles(b))
        setScore(0)
        setStatus("playing")
    }, [])

    // Keyboard
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            switch (e.key) {
                case "ArrowLeft": e.preventDefault(); handleMove("left"); break
                case "ArrowRight": e.preventDefault(); handleMove("right"); break
                case "ArrowUp": e.preventDefault(); handleMove("up"); break
                case "ArrowDown": e.preventDefault(); handleMove("down"); break
            }
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [handleMove])

    const onTouchStart = (e: React.TouchEvent) => {
        const t = e.touches[0]
        touchStartRef.current = { x: t.clientX, y: t.clientY }
    }

    const onTouchEnd = (e: React.TouchEvent) => {
        if (!touchStartRef.current) return
        const t = e.changedTouches[0]
        const dx = t.clientX - touchStartRef.current.x
        const dy = t.clientY - touchStartRef.current.y
        touchStartRef.current = null
        if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return
        if (Math.abs(dx) > Math.abs(dy)) handleMove(dx > 0 ? "right" : "left")
        else handleMove(dy > 0 ? "down" : "up")
    }

    return (
        <div className="flex flex-col items-center gap-4 w-full max-w-sm">
            {/* Score bar */}
            <div className="flex w-full justify-between items-center">
                <div className="flex gap-2">
                    <div className="bg-surface-card rounded-lg px-4 py-2 text-center border border-border-default">
                        <div className="text-xs text-text-secondary">Score</div>
                        <div className="text-lg font-bold text-text-primary">{score}</div>
                    </div>
                    <div className="bg-surface-card rounded-lg px-4 py-2 text-center border border-border-default">
                        <div className="text-xs text-text-secondary">Meilleur</div>
                        <div className="text-lg font-bold text-text-primary">{bestScore}</div>
                    </div>
                </div>
                <button
                    onClick={resetGame}
                    className="px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-semibold"
                >
                    Nouveau
                </button>
            </div>

            {/* Grid */}
            <div
                className="relative bg-slate-300 rounded-xl p-2 touch-none"
                style={{ width: 320, height: 320 }}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
            >
                {/* Empty cells */}
                <div className="grid grid-cols-4 gap-2 h-full">
                    {Array.from({ length: 16 }).map((_, i) => (
                        <div key={i} className="bg-slate-200 rounded-lg" />
                    ))}
                </div>

                {/* Tiles */}
                <div className="absolute inset-2">
                    <AnimatePresence>
                        {tiles.map((tile) => {
                            const cellSize = (320 - 16) / 4 // 76px
                            const gap = 8
                            const left = tile.col * (cellSize + gap)
                            const top = tile.row * (cellSize + gap)
                            return (
                                <motion.div
                                    key={tile.id}
                                    className={cn(
                                        "absolute flex items-center justify-center rounded-lg font-bold select-none",
                                        tileColor(tile.value),
                                    )}
                                    style={{
                                        width: cellSize,
                                        height: cellSize,
                                        left,
                                        top,
                                        fontSize: tile.value >= 1024 ? "18px" : tile.value >= 128 ? "22px" : "26px",
                                    }}
                                    initial={
                                        prefersReduced
                                            ? {}
                                            : tile.isNew
                                              ? { scale: 0 }
                                              : { scale: 0.9 }
                                    }
                                    animate={{ scale: 1, left, top }}
                                    exit={prefersReduced ? {} : { scale: 0, opacity: 0 }}
                                    transition={{ duration: 0.1 }}
                                    layout={!prefersReduced}
                                >
                                    {tile.value}
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </div>

                {/* Overlays */}
                {status === "won" && (
                    <GameOverlay
                        title="Tu as gagné ! 🎉"
                        subtitle="Tu as atteint 2048 !"
                        score={score}
                        scoreLabel="Score"
                        onRestart={resetGame}
                    />
                )}
                {status === "lost" && (
                    <GameOverlay
                        title="Game Over"
                        subtitle="Plus de mouvements possibles"
                        score={score}
                        scoreLabel="Score"
                        onRestart={resetGame}
                    />
                )}
            </div>

            <p className="text-text-secondary text-sm">
                Flèches ou swipe pour fusionner les tuiles
            </p>
        </div>
    )
}
