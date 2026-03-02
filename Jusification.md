# Technical Justification Document - Wait-Light

This document details the technological and architectural choices made for the Wait-Light project, as well as the measures taken to ensure the security and performance of the product.

## Technology Stack Choices

### Frontend: Next.js (App Router)

- Justification: We chose Next.js for its hybrid architecture. Server-Side Rendering (SSR) is used for the merchant dashboard to ensure increased data security, while Client-Side Rendering (CSR) is preferred for the customer interface for its responsiveness.

- Performance: Native image optimization and automatic code-splitting allow us to achieve a Lighthouse score > 90, which is crucial for customers using 4G/5G outside stores.

### Styling: Tailwind CSS & Framer Motion

- Justification: Tailwind allows rapid iteration on the design while ensuring a minimal CSS bundle.

- User Experience (UX): Using Framer Motion allows animating position changes in the queue smoothly. This reduces the user's perception of wait time (psychology of waiting).

### Backend & Realtime: Supabase (PostgreSQL)

- Justification: Rather than setting up a complex WebSocket server, we use Supabase Realtime. This allows synchronizing the queue state instantly between the merchant (who calls a customer) and the customer (who sees their rank decrease) directly via database events.

- **Filtered channels (security and performance imperative)**: Each Realtime client subscribes to a channel **filtered by `merchant_id`**, not to the entire table:
    ```ts
    supabase
        .channel(`queue:merchant_id=eq.${merchantId}`)
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
    ```
    Without this filter, each client would receive the changes for **all** businesses → data leak + unacceptable network overload.

### Coexistence TanStack Query + Supabase Realtime

- **Potential problem**: TanStack Query manages the cache on the client side, but Realtime updates arrive via a Supabase WebSocket channel — the two mechanisms are not natively aware of each other.

- **Adopted strategy**: when a Realtime event is received, the handler calls `queryClient.invalidateQueries({ queryKey: ['queue', merchantId] })`. This simple approach guarantees consistency without complex merge logic.

    For very frequent updates (highly active queue), an **optimistic cache update** (`queryClient.setQueryData`) can be preferred to avoid an unnecessary network round-trip.

## Security & Robustness

Since the jury is strict on vulnerabilities, we implemented the following protection layers:

### Data Security (RLS)

We do not use an "open" API. Every access to the database is filtered by Row Level Security (RLS) policies at the SQL level:

- A customer can create a ticket but cannot modify someone else's.
- A merchant can only act on their own queue.
- Sensitive information (names of other customers) is masked: the customer only receives the number of people ahead of them, not their identity.

### Abuse Protection (Anti-Spam)

To prevent a malicious user from filling a queue remotely:

- Rate Limiting: Implementation of a request limit per IP via Edge Functions.
- Schema validation: Use of Zod to strictly validate every user input on the server side, preventing script injections (XSS) or corrupted data.

### Deployment Integrity

- **Environment Variables**: No secret keys are committed. Use of environment variables managed by Vercel (encrypted at rest). Supabase `anon` (public) and `service_role` (secret, server-side only) keys are strictly separated.

- **Security Headers**: Configuration in `next.config.ts`:
    - `Content-Security-Policy`: restricts script/style sources to prevent XSS.
    - `X-Frame-Options: DENY`: prevents embedding in iframes (clickjacking).
    - `Strict-Transport-Security`: forces HTTPS.
    - `X-Content-Type-Options: nosniff`: prevents MIME sniffing.

### GDPR — User Consent

The spec mentions GDPR compliance, but it requires a concrete implementation in the user flow:

- **Consent banner** on the `/[slug]/join` form: *"By joining this queue, you agree that your first name will be used to call you. It will be automatically deleted at the end of the session."* with a link to the privacy policy.

- **Right to be forgotten**: `done` and `cancelled` tickets are **purged automatically after 24h** via a Supabase Cron Job (`DELETE FROM queue_items WHERE status IN ('done','cancelled') AND done_at < NOW() - INTERVAL '24 hours'`).

- **Data minimization**: only the first name (or nickname) is collected. No email, no phone number, no mandatory account.

## Business Justification & Commercialization

Wait-Light stands out for its simplicity of implementation:

- Low Barrier to Entry: No app to download for the customer (PWA/Mobile Web).
- Scalability: The Serverless architecture allows supporting a sudden increase in load (e.g., special event, peak hour) without manual server maintenance.
- GDPR: We only collect the strict minimum (Last Name/First Name). Queue data is automatically purged after each session to respect privacy.

## Deployment Strategy

- **Vercel**: Chosen for its native management of "Preview" branches (essential for group tests of 3) and its global CDN ensuring minimal latency.
- **CI/CD Pipeline**: Every push to `main` triggers via GitHub Actions:
    1. `pnpm lint` — ESLint check.
    2. `pnpm test` — Unit tests (Vitest).
    3. `pnpm build` — Next.js build check.
    4. If everything passes → automatic deployment on Vercel.
    - In case of failure at any step, the deployment is cancelled and an alert is sent.

## Testing Strategy

In accordance with the project's quality requirement, three testing levels are planned:

### Unit Tests (Vitest)

- Zod schema validation (malformed inputs, XSS, SQL injection).
- Position and average wait time calculation logic.
- Utility functions (time formatting, slug generation).

### Integration Tests (Vitest + local Supabase)

- RLS policies check: ensure a customer cannot read another merchant's tickets.
- `check_queue_capacity` trigger test: behavior at max capacity.
- Edge Functions test with valid and invalid payloads.

### E2E Tests (Playwright)

- Full **customer** flow: scan URL → join queue → see position decrease → receive alert.
- Full **merchant** flow: login → call next → see queue update in real-time.
- Resilience test: simulate connection loss and verify automatic reconnection.

> E2E tests run in the CI against a staging Supabase environment (project separate from the production project).

### Gestion du multilangue

- **Gestion du multilangue** : L'application gère le multilangue via l'utilisation de fichiers de traduction. Ces fichiers sont stockés dans le dossier `locales` et contiennent les traductions pour chaque langue. Les traductions sont chargées dynamiquement en fonction de la langue sélectionnée par l'utilisateur.

