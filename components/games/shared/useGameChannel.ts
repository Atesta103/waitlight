"use client"

import { useEffect, useRef, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

type BroadcastPayload = Record<string, unknown>

interface UseGameChannelOptions {
    channelName: string
    onMessage: (payload: BroadcastPayload) => void
    onReady?: () => void
    enabled?: boolean
}

interface UseGameChannelReturn {
    broadcast: (payload: BroadcastPayload) => void
    channel: RealtimeChannel | null
}

/**
 * Subscribes to a Supabase Realtime broadcast channel.
 * Cleans up on unmount or when channelName changes.
 */
export function useGameChannel({
    channelName,
    onMessage,
    onReady,
    enabled = true,
}: UseGameChannelOptions): UseGameChannelReturn {
    const channelRef = useRef<RealtimeChannel | null>(null)
    const onMessageRef = useRef<(payload: BroadcastPayload) => void>(onMessage)
    const onReadyRef = useRef<(() => void) | undefined>(onReady)

    useEffect(() => { onMessageRef.current = onMessage }, [onMessage])
    useEffect(() => { onReadyRef.current = onReady }, [onReady])

    useEffect(() => {
        if (!enabled || !channelName) return

        const supabase = createClient()
        const channel = supabase.channel(channelName, {
            config: { broadcast: { self: false } },
        })

        channel.on("broadcast", { event: "game" }, ({ payload }) => {
            onMessageRef.current(payload as BroadcastPayload)
        })

        channel.subscribe((status) => {
            if (status === "SUBSCRIBED") onReadyRef.current?.()
        })
        channelRef.current = channel

        return () => {
            supabase.removeChannel(channel)
            channelRef.current = null
        }
    }, [channelName, enabled])

    const broadcast = useCallback((payload: BroadcastPayload) => {
        channelRef.current?.send({
            type: "broadcast",
            event: "game",
            payload,
        })
    }, [])

    return { broadcast, channel: channelRef.current }
}
