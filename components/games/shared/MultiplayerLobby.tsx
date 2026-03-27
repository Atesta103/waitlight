"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"
import { Users, Plus, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils/cn"

interface Room {
    roomCode: string
    hostTicketId: string
}

interface MultiplayerLobbyProps {
    gameType: string
    gameEmoji: string
    gameTitle: string
    gameDescription: string
    merchantId: string
    ticketId: string
    onGameStart: (roomCode: string, playerNum: 1 | 2) => void
}

function makeRoomCode(): string {
    return Math.random().toString(36).substring(2, 6).toUpperCase()
}

export function MultiplayerLobby({
    gameType,
    gameEmoji,
    gameTitle,
    gameDescription,
    merchantId,
    ticketId,
    onGameStart,
}: MultiplayerLobbyProps) {
    const [view, setView] = useState<"list" | "waiting">("list")
    const [rooms, setRooms] = useState<Room[]>([])
    const [myRoomCode, setMyRoomCode] = useState("")
    const [joiningCode, setJoiningCode] = useState<string | null>(null)

    const discoveryRef = useRef<RealtimeChannel | null>(null)
    const gameRef = useRef<RealtimeChannel | null>(null)
    const supabaseRef = useRef(createClient())

    // ── Discovery channel — lists all open rooms ──────────────────────────────
    useEffect(() => {
        const supabase = supabaseRef.current
        const channel = supabase.channel(`lobby:${merchantId}:${gameType}`, {
            config: { presence: { key: ticketId } },
        })

        const syncRooms = () => {
            const state = channel.presenceState<{ roomCode: string }>()
            const list: Room[] = Object.entries(state)
                .filter(([key]) => key !== ticketId)
                .map(([key, presences]) => ({
                    roomCode: presences[0]?.roomCode ?? "",
                    hostTicketId: key,
                }))
                .filter((r) => r.roomCode !== "")
            setRooms(list)
        }

        channel
            .on("presence", { event: "sync" }, syncRooms)
            .on("presence", { event: "join" }, syncRooms)
            .on("presence", { event: "leave" }, syncRooms)
            .subscribe()

        discoveryRef.current = channel

        return () => {
            supabase.removeChannel(channel)
        }
    }, [merchantId, gameType, ticketId])

    // ── Create a room ─────────────────────────────────────────────────────────
    const createGame = useCallback(async () => {
        const code = makeRoomCode()
        setMyRoomCode(code)
        setView("waiting")

        const supabase = supabaseRef.current

        // Announce on discovery channel
        await discoveryRef.current?.track({ roomCode: code })

        // Open the game channel and wait for a second player via broadcast
        const gameChannel = supabase.channel(`${gameType}:${merchantId}:${code}`)

        gameChannel
            .on("broadcast", { event: "player_joined" }, () => {
                discoveryRef.current?.untrack()
                onGameStart(code, 1)
            })
            .subscribe()

        gameRef.current = gameChannel
    }, [gameType, merchantId, ticketId, onGameStart])

    // ── Join an existing room ─────────────────────────────────────────────────
    const joinGame = useCallback(
        async (code: string) => {
            setJoiningCode(code)

            const supabase = supabaseRef.current
            const gameChannel = supabase.channel(`${gameType}:${merchantId}:${code}`)

            gameChannel.subscribe(async (status) => {
                if (status === "SUBSCRIBED") {
                    // Notify host via broadcast — more reliable than presence events
                    await gameChannel.send({
                        type: "broadcast",
                        event: "player_joined",
                        payload: { ticketId },
                    })
                    setJoiningCode(null)
                    onGameStart(code, 2)
                }
            })

            gameRef.current = gameChannel
        },
        [gameType, merchantId, ticketId, onGameStart],
    )

    // ── Cancel waiting ────────────────────────────────────────────────────────
    const cancelWaiting = useCallback(() => {
        discoveryRef.current?.untrack()
        if (gameRef.current) {
            supabaseRef.current.removeChannel(gameRef.current)
            gameRef.current = null
        }
        setMyRoomCode("")
        setView("list")
    }, [])

    // ── Cleanup on unmount ────────────────────────────────────────────────────
    useEffect(() => {
        return () => {
            const supabase = supabaseRef.current
            if (discoveryRef.current) supabase.removeChannel(discoveryRef.current)
            if (gameRef.current) supabase.removeChannel(gameRef.current)
        }
    }, [])

    return (
        <div className="flex flex-col items-center gap-6 w-full max-w-sm">
            <div className="text-4xl">{gameEmoji}</div>
            <div className="text-center">
                <h2 className="text-xl font-bold text-text-primary">{gameTitle}</h2>
                <p className="text-sm text-text-secondary mt-1">{gameDescription}</p>
            </div>

            {/* ── Waiting for opponent ───────────────────────────────────────── */}
            {view === "waiting" && (
                <div className="flex flex-col items-center gap-5 w-full">
                    <div className="flex flex-col items-center gap-3 bg-surface-card border border-border-default rounded-2xl px-8 py-6 w-full">
                        <p className="text-xs text-text-secondary uppercase tracking-wider">
                            Votre partie est ouverte
                        </p>
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-brand-primary animate-pulse" />
                            <span className="text-sm text-text-secondary">
                                En attente d&apos;un adversaire…
                            </span>
                        </div>
                        <p className="text-xs text-text-disabled text-center">
                            Les autres joueurs de la file peuvent voir votre partie et la rejoindre.
                        </p>
                    </div>
                    <button
                        onClick={cancelWaiting}
                        className="w-full py-3 bg-surface-card border border-border-default text-text-secondary rounded-xl font-semibold text-sm"
                    >
                        Annuler
                    </button>
                </div>
            )}

            {/* ── Room list ─────────────────────────────────────────────────── */}
            {view === "list" && (
                <div className="flex flex-col gap-3 w-full">
                    <button
                        onClick={createGame}
                        className="flex items-center justify-center gap-2 w-full py-3 bg-brand-primary text-text-inverse rounded-xl font-semibold"
                    >
                        <Plus size={16} />
                        Créer une partie
                    </button>

                    <div className="flex items-center gap-2 text-xs text-text-disabled">
                        <div className="flex-1 h-px bg-border-default" />
                        <span>Parties ouvertes</span>
                        <div className="flex-1 h-px bg-border-default" />
                    </div>

                    {rooms.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-8 text-center">
                            <Users size={28} className="text-text-disabled" />
                            <p className="text-sm text-text-secondary">
                                Aucune partie ouverte pour l&apos;instant.
                            </p>
                            <p className="text-xs text-text-disabled">
                                Crée une partie, les autres joueurs de la file pourront te rejoindre.
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {rooms.map((room) => (
                                <div
                                    key={room.roomCode}
                                    className="flex items-center justify-between bg-surface-card border border-border-default rounded-xl px-4 py-3"
                                >
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-sm font-semibold text-text-primary">
                                            {gameTitle}
                                        </span>
                                        <span className="text-xs text-text-secondary flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-feedback-success inline-block" />
                                            1 joueur attend
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => joinGame(room.roomCode)}
                                        disabled={joiningCode === room.roomCode}
                                        className={cn(
                                            "px-4 py-2 rounded-lg text-sm font-semibold transition-opacity",
                                            "bg-brand-primary text-text-inverse",
                                            joiningCode === room.roomCode && "opacity-50",
                                        )}
                                    >
                                        {joiningCode === room.roomCode ? (
                                            <RefreshCw size={14} className="animate-spin" />
                                        ) : (
                                            "Rejoindre"
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
