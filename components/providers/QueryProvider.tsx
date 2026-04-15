"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, type ReactNode } from "react"

type QueryProviderProps = {
    children: ReactNode
}

/**
 * Client-side providers for the app.
 * Creates a QueryClient per session to avoid shared state between users.
 */
export function QueryProvider({ children }: QueryProviderProps) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 10_000, // 10s — Realtime handles live updates
                        retry: 2,
                    },
                },
            }),
    )

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}
