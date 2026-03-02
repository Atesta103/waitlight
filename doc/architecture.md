# Architecture Rules — Wait-Light

> Part of the Wait-Light engineering rules. See [`AGENTS.md`](../AGENTS.md) for the full context.

---

## Next.js App Router

### Server vs Client Components

| Scenario                                          | Use                                |
| ------------------------------------------------- | ---------------------------------- |
| Initial page render, SEO, auth-gated redirects    | Server Component (default)         |
| Realtime subscriptions, browser APIs, user events | Client Component (`"use client"`)  |
| Form mutations (create ticket, call next, etc.)   | Server Action in `lib/actions/`    |
| Complex read queries shared across components     | TanStack Query hook in an Organism |

**Decision rule:** start as Server Component. Add `"use client"` only when the browser needs it.

### Data Fetching Hierarchy

```
Server Component (initial load, SSR)
    └── passes data as props to ↓
        Client Organism (subscribes to Realtime, manages cache)
            └── TanStack Query hook (manages cache + invalidation)
                └── Supabase client call
```

Never break this hierarchy. A molecule must not call `supabase` directly.

### Route Groups & Middleware

- `(auth)/` group: unauthenticated pages. Middleware redirects logged-in merchants away.
- `(dashboard)/` group: protected pages. Middleware redirects unauthenticated users to `/login`.
- Middleware lives in `middleware.ts` at the root. It reads the Supabase session cookie to determine auth state — **no client-side auth check on protected pages**.

### Server Actions

- File location: `lib/actions/[domain].ts` (e.g. `lib/actions/queue.ts`, `lib/actions/merchant.ts`).
- Every action must:
    1. Validate input with the corresponding Zod schema.
    2. Create a **server-side** Supabase client (with `createServerClient`).
    3. Return a typed result: `{ data: T } | { error: string }` — never throw.
- Never pass the Supabase `service_role` key to a Server Action accessible from the client boundary.

---

## Supabase Patterns

### Client Initialization

Three distinct clients — never mix them:

| Client         | File                                  | Usage                                             |
| -------------- | ------------------------------------- | ------------------------------------------------- |
| Browser client | `lib/supabase/client.ts`              | Client Components, TanStack Query hooks           |
| Server client  | `lib/supabase/server.ts`              | Server Actions, Route Handlers, Server Components |
| Admin client   | `lib/supabase/admin.ts` (server-only) | Edge Functions, cron jobs — uses `service_role`   |

### Realtime — Always Filter Channels

```ts
// ✅ CORRECT — filtered by merchant_id
supabase
    .channel(`queue:${merchantId}`)
    .on(
        "postgres_changes",
        {
            event: "*",
            schema: "public",
            table: "queue_items",
            filter: `merchant_id=eq.${merchantId}`,
        },
        handler,
    )
    .subscribe()

// ❌ WRONG — listens to ALL rows in the table
supabase
    .channel("queue")
    .on("postgres_changes", { event: "*", table: "queue_items" }, handler)
```

Every Realtime subscription must be cleaned up in the component's unmount:

```ts
useEffect(() => {
  const channel = supabase.channel(...).subscribe();
  return () => { supabase.removeChannel(channel); };
}, [merchantId]);
```

### TanStack Query + Realtime Coexistence

When a Realtime event arrives, **invalidate the relevant query** — do not merge manually:

```ts
const queryClient = useQueryClient()

// In the Realtime handler:
queryClient.invalidateQueries({ queryKey: ["queue", merchantId] })
```

For high-frequency updates (> 1 per second), prefer `setQueryData` optimistic update instead of `invalidateQueries` to avoid refetch storms.

Query key conventions:

```ts
;["queue", merchantId][("ticket", ticketId)][("merchant", slug)][ // queue list for a merchant // single ticket status // merchant public info
    ("stats", merchantId)
] // dashboard statistics
```

### RPC Calls

Always use RPC for:

- Calculating a customer's position (`get_position`)
- Any computation involving `COUNT(*)` on `queue_items`
- Any cross-table read that would require multiple round-trips

```ts
const { data } = await supabase.rpc("get_position", { ticket_id: ticketId })
```

Never expose the raw `queue_items` SELECT to compute position client-side.

---

## State Management

| State type                                | Solution                                        |
| ----------------------------------------- | ----------------------------------------------- |
| Server data (DB)                          | TanStack Query (cache + invalidation)           |
| Realtime updates                          | Supabase Realtime → invalidates TanStack Query  |
| UI-only local state                       | `useState` in the relevant component            |
| Cross-component UI state (modals, toasts) | Zustand store or React Context (light use only) |
| Auth state                                | Supabase Auth + middleware cookie               |
| Customer ticket ID                        | `localStorage` key: `waitlight_ticket_{slug}`   |

No global state for data that belongs in TanStack Query cache.

---

## Zod Schema Conventions

Schema files live in `lib/validators/`. One file per domain:

```
lib/validators/
  queue.ts       # JoinQueueSchema, TicketStatusSchema
  merchant.ts    # CreateMerchantSchema, UpdateSettingsSchema
  auth.ts        # LoginSchema
```

Every schema must export both the Zod schema and its inferred TypeScript type:

```ts
export const JoinQueueSchema = z.object({
    customer_name: z.string().min(2).max(50).trim(),
    merchant_id: z.string().uuid(),
    consent: z.literal(true), // RGPD — must be explicitly true
})

export type JoinQueueInput = z.infer<typeof JoinQueueSchema>
```

---

## Error Handling

Never expose raw errors to the UI. The pattern:

```ts
// Server Action
try {
    const parsed = JoinQueueSchema.safeParse(input)
    if (!parsed.success) return { error: "Données invalides." }

    const { data, error } = await supabase
        .from("queue_items")
        .insert(parsed.data)
    if (error) {
        Sentry.captureException(error) // log internally
        return { error: "Impossible de rejoindre la file. Réessayez." } // generic to user
    }
    return { data }
} catch (e) {
    Sentry.captureException(e)
    return { error: "Une erreur inattendue s'est produite." }
}
```

- All Sentry captures happen server-side — never send raw DB errors to the browser.
- User-facing error messages are always in French, friendly, and actionable.
