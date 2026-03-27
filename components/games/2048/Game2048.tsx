"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { GameOverlay } from "@/components/games/shared/GameOverlay"
import { cn } from "@/lib/utils/cn"

type MoveDir = "left" | "right" | "up" | "down"

interface TileState {
    id: number
    value: number
    row: number
    col: number
    isMerged?: boolean   // plays a pop animation this frame
    isNew?: boolean      // pops in from scale 0
    isAbsorbed?: boolean // sliding to merge target, then exits
}

let tileIdCounter = 0
function nextId() { return ++tileIdCounter }

// ---------------------------------------------------------------------------
// Board helpers (operate on tile arrays, not raw 2D arrays)
// ---------------------------------------------------------------------------

function tilesToGrid(tiles: TileState[]): (number | null)[][] {
    const grid: (number | null)[][] = Array.from({ length: 4 }, () => Array(4).fill(null))
    for (const t of tiles) {
        if (!t.isAbsorbed) grid[t.row][t.col] = t.value
    }
    return grid
}

function hasWon(tiles: TileState[]): boolean {
    return tiles.some((t) => !t.isAbsorbed && t.value === 2048)
}

function canMove(tiles: TileState[]): boolean {
    const grid = tilesToGrid(tiles)
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (!grid[r][c]) return true
            if (c + 1 < 4 && grid[r][c] === grid[r][c + 1]) return true
            if (r + 1 < 4 && grid[r][c] === grid[r + 1][c]) return true
        }
    }
    return false
}

function addRandomTile(tiles: TileState[]): TileState | null {
    const grid = tilesToGrid(tiles)
    const empties: { r: number; c: number }[] = []
    for (let r = 0; r < 4; r++)
        for (let c = 0; c < 4; c++)
            if (!grid[r][c]) empties.push({ r, c })
    if (empties.length === 0) return null
    const { r, c } = empties[Math.floor(Math.random() * empties.length)]
    return { id: nextId(), value: Math.random() < 0.9 ? 2 : 4, row: r, col: c, isNew: true }
}

function getInitialTiles(): TileState[] {
    const tiles: TileState[] = []
    for (let n = 0; n < 2; n++) {
        const t = addRandomTile(tiles)
        if (t) tiles.push(t)
    }
    return tiles
}

// ---------------------------------------------------------------------------
// Core move logic — keeps stable tile IDs so framer-motion can animate slides
// ---------------------------------------------------------------------------

interface MoveResult {
    survivingTiles: TileState[]   // tiles after the move (merged tiles have isMerged=true)
    absorbedTiles: TileState[]    // absorbed half of each merge, repositioned to merge target
    score: number
    moved: boolean
}

function moveWithTiles(currentTiles: TileState[], dir: MoveDir): MoveResult {
    // Build grid from active (non-absorbed) tiles
    const grid: (TileState | null)[][] = Array.from({ length: 4 }, () => Array(4).fill(null))
    for (const t of currentTiles) {
        if (!t.isAbsorbed) grid[t.row][t.col] = { ...t, isMerged: false, isNew: false }
    }

    let totalScore = 0
    let moved = false
    const survivingTiles: TileState[] = []
    const pendingAbsorbed: { removed: TileState; targetRow: number; targetCol: number }[] = []

    for (let i = 0; i < 4; i++) {
        // Extract the line for this row/column, reversing for right/down so we always process
        // tiles toward position 0 (left/up side) and reverse positions afterward.
        let line: (TileState | null)[]
        if (dir === "left" || dir === "right") {
            line = dir === "right" ? [...grid[i]].reverse() : [...grid[i]]
        } else {
            const col = grid.map((row) => row[i])
            line = dir === "down" ? [...col].reverse() : col
        }

        const nonNull = line.filter((t): t is TileState => t !== null)
        const merged: { tile: TileState; absorbed?: TileState }[] = []

        let j = 0
        while (j < nonNull.length) {
            if (j + 1 < nonNull.length && nonNull[j].value === nonNull[j + 1].value) {
                const newVal = nonNull[j].value * 2
                totalScore += newVal
                merged.push({
                    tile: { ...nonNull[j], value: newVal, isMerged: true },
                    absorbed: nonNull[j + 1],
                })
                j += 2
            } else {
                merged.push({ tile: { ...nonNull[j] } })
                j++
            }
        }

        // Assign final grid positions
        for (let k = 0; k < merged.length; k++) {
            // For right/down, position 0 → grid index 3, 1 → 2, etc.
            const pos = (dir === "right" || dir === "down") ? (3 - k) : k
            const newRow = (dir === "left" || dir === "right") ? i : pos
            const newCol = (dir === "left" || dir === "right") ? pos : i
            const { tile, absorbed } = merged[k]

            if (newRow !== tile.row || newCol !== tile.col || tile.isMerged) moved = true

            const updatedTile = { ...tile, row: newRow, col: newCol }
            survivingTiles.push(updatedTile)

            if (absorbed) {
                // Absorbed tile will animate to the merge position, then exit
                pendingAbsorbed.push({ removed: absorbed, targetRow: newRow, targetCol: newCol })
            }
        }
    }

    const absorbedTiles = pendingAbsorbed.map(({ removed, targetRow, targetCol }) => ({
        ...removed,
        row: targetRow,
        col: targetCol,
        isAbsorbed: true,
        isMerged: false,
        isNew: false,
    }))

    return { survivingTiles, absorbedTiles, score: totalScore, moved }
}

// ---------------------------------------------------------------------------
// Tile colors
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const GRID_SIZE = 320
const PADDING = 8  // p-2 = 8px each side
const GAP = 8      // gap-2 = 8px
const INNER = GRID_SIZE - PADDING * 2         // 304px
const CELL_SIZE = (INNER - 3 * GAP) / 4      // 70px

export function Game2048() {
    const [tiles, setTiles] = useState<TileState[]>(getInitialTiles)
    const [score, setScore] = useState(0)
    const [bestScore, setBestScore] = useState(0)
    const [status, setStatus] = useState<"playing" | "won" | "lost">("playing")

    // tilesRef mirrors state for synchronous reads in handleMove + setTimeout
    const tilesRef = useRef<TileState[]>([])
    const isAnimating = useRef(false)
    const touchStartRef = useRef<{ x: number; y: number } | null>(null)
    const prefersReduced = useReducedMotion()

    useEffect(() => { tilesRef.current = tiles }, [tiles])

    const handleMove = useCallback(
        (dir: MoveDir) => {
            if (status !== "playing" || isAnimating.current) return

            const active = tilesRef.current.filter((t) => !t.isAbsorbed)
            const { survivingTiles, absorbedTiles, score: earned, moved } = moveWithTiles(active, dir)
            if (!moved) return

            isAnimating.current = true

            // Phase 1 — slide tiles to new positions; absorbed tiles slide to merge target
            const phase1 = [...survivingTiles, ...absorbedTiles]
            tilesRef.current = phase1
            setTiles(phase1)

            // Phase 2 — remove absorbed tiles, clear merge flags, spawn new tile
            setTimeout(() => {
                const base = tilesRef.current
                    .filter((t) => !t.isAbsorbed)
                    .map((t) => ({ ...t, isMerged: false, isNew: false }))
                const newTile = addRandomTile(base)
                const final = newTile ? [...base, newTile] : base

                tilesRef.current = final
                setTiles(final)
                setScore((s) => {
                    const ns = s + earned
                    setBestScore((b) => Math.max(b, ns))
                    return ns
                })

                if (hasWon(final)) setStatus("won")
                else if (!canMove(final)) setStatus("lost")

                isAnimating.current = false
            }, prefersReduced ? 0 : 150)
        },
        [status, prefersReduced],
    )

    const resetGame = useCallback(() => {
        const t = getInitialTiles()
        tilesRef.current = t
        setTiles(t)
        setScore(0)
        setStatus("playing")
        isAnimating.current = false
    }, [])

    // Keyboard navigation
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            switch (e.key) {
                case "ArrowLeft":  e.preventDefault(); handleMove("left");  break
                case "ArrowRight": e.preventDefault(); handleMove("right"); break
                case "ArrowUp":    e.preventDefault(); handleMove("up");    break
                case "ArrowDown":  e.preventDefault(); handleMove("down");  break
            }
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [handleMove])

    // Touch / swipe
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
                style={{ width: GRID_SIZE, height: GRID_SIZE }}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
            >
                {/* Empty cell background */}
                <div className="grid grid-cols-4 gap-2 h-full">
                    {Array.from({ length: 16 }).map((_, i) => (
                        <div key={i} className="bg-slate-200 rounded-lg" />
                    ))}
                </div>

                {/* Animated tiles — positioned via x/y transforms (GPU composited) */}
                <div className="absolute inset-2">
                    <AnimatePresence>
                        {tiles.map((tile) => {
                            const tx = tile.col * (CELL_SIZE + GAP)
                            const ty = tile.row * (CELL_SIZE + GAP)
                            return (
                                <motion.div
                                    key={tile.id}
                                    className={cn(
                                        "absolute flex items-center justify-center rounded-lg font-bold select-none",
                                        tileColor(tile.value),
                                    )}
                                    style={{
                                        width: CELL_SIZE,
                                        height: CELL_SIZE,
                                        // Absorbed tiles render behind the surviving merged tile
                                        zIndex: tile.isAbsorbed ? 1 : 2,
                                        fontSize: tile.value >= 1024 ? "18px" : tile.value >= 128 ? "22px" : "26px",
                                    }}
                                    // New tiles pop in from scale 0 at the correct position
                                    initial={prefersReduced ? false : {
                                        x: tx,
                                        y: ty,
                                        scale: tile.isNew ? 0 : 1,
                                    }}
                                    // Slide via transform (GPU); merged tiles do a quick pop
                                    animate={prefersReduced ? { x: tx, y: ty } : {
                                        x: tx,
                                        y: ty,
                                        scale: tile.isMerged ? [1, 1.2, 1] : 1,
                                    }}
                                    exit={
                                        tile.isAbsorbed
                                            // Already behind the merged tile — just vanish
                                            ? { opacity: 0, transition: { duration: 0.05 } }
                                            : prefersReduced
                                              ? {}
                                              : { scale: 0, opacity: 0, transition: { duration: 0.08 } }
                                    }
                                    transition={{
                                        x: { duration: 0.12, ease: "easeOut" },
                                        y: { duration: 0.12, ease: "easeOut" },
                                        scale: { duration: 0.15, ease: "easeOut" },
                                    }}
                                >
                                    {tile.value}
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </div>

                {/* Game-over overlays */}
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
