# Security Rules — Wait-Light

> Part of the Wait-Light engineering rules. See [`AGENTS.md`](../AGENTS.md) for the full context.
> The jury is **strict on security.** Apply every rule here without exception.

---

## Checklist — Apply Before Any PR

- [ ] No secret key committed (grep for `service_role`, `SUPABASE_SECRET`, `PRIVATE_KEY`).
- [ ] Every external input validated with Zod **before** any DB call.
- [ ] New DB table or column has a corresponding RLS policy.
- [ ] Any new Realtime channel is filtered by a scoped ID (never table-wide).
- [ ] New Route Handler or Server Action returns generic error messages to the client.
- [ ] New page under `(dashboard)/` is covered by the auth middleware.

---

## Authentication

- Auth is handled exclusively by **Supabase Auth** (email/password for merchants).
- The session is stored in a **HttpOnly, Secure, SameSite=Strict cookie** — never in localStorage.
- Middleware (`middleware.ts`) validates the session cookie on every request to `(dashboard)/` routes. There is no client-side auth guard — it is always middleware-first.
- After sign-out, call `supabase.auth.signOut()` and immediately redirect to `/login` — never leave a stale session.
- Anonymous customers are NOT authenticated. Their identity is the UUID ticket `id` stored in `localStorage`. This is deliberately minimal (no PII required).

---

## API & Edge Functions

### Rate Limiting

Applied on every Edge Function that mutates the DB:

- Max **5 queue joins per IP per minute** for `createTicket`.
- Max **20 requests per IP per minute** for read operations.
- Implementation: track counts in Supabase `kv` or use Upstash Redis via `@upstash/ratelimit`.
- On limit exceeded: return `429` with `Retry-After` header. Never expose the rate limit algorithm in the response body.

#### Slug change rate limit

- Max **1 slug change per hour** per merchant, enforced in `updateMerchantIdentityAction`.
- Implementation: `merchants.slug_last_changed_at` column (TIMESTAMPTZ) set to `NOW()` on every slug change. The Server Action checks `Date.now() - slug_last_changed_at < 1h` before writing.
- When the limit is hit, the action returns a user-friendly error with the number of minutes remaining — no `429` is surfaced to the browser (Server Action, not HTTP).
- Purpose: prevents automated slug enumeration via rapid rename attempts.

### Input Validation (defense-in-depth)

Three-layer validation for every mutation:

1. **Client-side** (Zod): immediate UX feedback.
2. **Edge Function / Server Action** (Zod): authoritative validation before DB call.
3. **Postgres trigger** (SQL `CHECK` / trigger): last resort, cannot be bypassed.

If layers 1 and 2 agree, layer 3 should never fire. If it does → Sentry alert (indicates a bypass attempt).

---

## Database (Supabase RLS)

### Principle

No query reaches the DB without passing an RLS policy. **Anon key + RLS = zero trust by default.**

### Policy matrix

| Table                | Operation       | Who           | Condition                                                      |
| -------------------- | --------------- | ------------- | -------------------------------------------------------------- |
| `merchants`          | SELECT          | Public (anon) | Always                                                         |
| `merchants`          | UPDATE          | Merchant      | `auth.uid() = id`                                              |
| `merchants`          | INSERT          | Merchant      | `auth.uid() = id` (onboarding)                                 |
| `queue_items`        | SELECT          | Public (anon) | `id = [param]` only (own ticket)                               |
| `queue_items`        | SELECT          | Merchant      | `merchant_id = [merchant's id]`                                |
| `queue_items`        | INSERT          | Public (anon) | Always (guarded by trigger)                                    |
| `queue_items`        | UPDATE          | Merchant      | `merchant_id = [merchant's id]`                                |
| `push_subscriptions` | INSERT          | Public (anon) | Always                                                         |
| `push_subscriptions` | SELECT / DELETE | System only   | Via `SECURITY DEFINER` RPC (never anon/authenticated directly) |
| `qr_tokens`          | INSERT          | Merchant      | `auth.uid() = merchant_id`                                     |
| `qr_tokens`          | SELECT          | Public (anon) | Always (needed for token validation on join page)              |
| `qr_tokens`          | UPDATE          | System only   | Via `SECURITY DEFINER` RPC `validate_qr_token` only           |
| `qr_tokens`          | DELETE          | System only   | Supabase Cron Job (expired token cleanup)                      |
| `settings`           | SELECT          | Public (anon) | Always (needed for capacity check)                             |
| `settings`           | UPDATE          | Merchant      | `merchant_id = auth.uid()`                                     |

### Sensitive data rules

- Customer names in `queue_items` are **never returned in bulk** to non-merchants.
- The `get_position` RPC uses `SECURITY DEFINER` and returns only an integer — no ticket data from other customers.
- Web Push credentials (`endpoint`, `p256dh`, `auth`) are only accessible server-side via the admin client.
- QR token nonces are high-entropy and ephemeral — they carry no sensitive data, only an opaque reference.

---

## Secure Rotating QR Code

The QR code is the **sole entry point** for customers to join the queue. It rotates every 15 seconds with a cryptographic one-time token to enforce physical presence at the merchant's location.

### Token lifecycle

1. Merchant's QR Display page (`/(dashboard)/qr-display`) calls `generateQrTokenAction` every 15 seconds.
2. Server Action generates a nonce: `crypto.randomUUID()` + HMAC-SHA256 signed with `QR_TOKEN_SECRET`.
3. Token is stored in `qr_tokens` table with a **30-second TTL** and `used = false`.
4. QR code encodes: `/[slug]/join?token=<nonce>`.
5. Customer scans → `/[slug]/join` page calls `validate_qr_token(nonce, slug)` RPC.
6. RPC atomically validates (exists + not expired + not used) and sets `used = true`.
7. Expired tokens are purged by a Supabase Cron Job every 5 minutes.

### Anti-fraud measures

| Threat | Mitigation |
| --- | --- |
| **Screenshot sharing** | 30s TTL — by the time a photo is shared via messaging, the token is expired |
| **Scanning from behind / at distance** | 15s rotation + single-use — only the first person to scan each frame can use it |
| **Remote / bot queue stuffing** | Valid token required + IP rate limiting (5 joins/IP/min) + Postgres capacity trigger |
| **Token replay** | `used = true` flag set atomically on first validation — no second use possible |
| **Token brute-force** | UUID + HMAC-SHA256 = ~256 bits of entropy — computationally infeasible to guess |
| **Man-in-the-middle** | HTTPS enforced via HSTS — QR URL cannot be intercepted in transit |

### Rate limits on token generation

- Max **10 token generations per minute per merchant** — prevents abuse if a merchant account is compromised.
- Enforced in the `generateQrTokenAction` Server Action.

### Configuration constants

- `QR_ROTATION_INTERVAL_MS = 15000` (15 seconds between rotations)
- `QR_TOKEN_TTL_SECONDS = 30` (token validity window)
- `QR_MAX_VALID_TOKENS = 2` (rolling window: current + previous token)
- Stored in `lib/utils/qr-config.ts` for centralized tuning.

---

## HTTP Security Headers

Configured in `next.config.ts`:

```ts
const securityHeaders = [
    { key: "X-DNS-Prefetch-Control", value: "on" },
    {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
    },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
    },
    {
        key: "Content-Security-Policy",
        value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline'", // required by Next.js — tighten in prod
            "style-src 'self' 'unsafe-inline'",
            `connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL} wss://*.supabase.co`,
            "img-src 'self' data: blob:",
            "font-src 'self'",
            "frame-ancestors 'none'",
        ].join("; "),
    },
]
```

---

## Secrets & Environment Variables

| Variable                        | Side            | Notes                                                                      |
| ------------------------------- | --------------- | -------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Public          | Safe to expose — just a URL                                                |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public          | Safe to expose — RLS is the guard                                          |
| `SUPABASE_SERVICE_ROLE_KEY`     | **Server only** | Never prefix with `NEXT_PUBLIC_`. Only in Server Actions / Edge Functions. |
| `QR_TOKEN_SECRET`               | **Server only** | HMAC signing key for QR token nonces. Never client-side.                   |
| `VAPID_PRIVATE_KEY`             | **Server only** | Web Push signing key. Never client-side.                                   |
| `VAPID_PUBLIC_KEY`              | Public          | Used by the browser to subscribe to push.                                  |
| `SENTRY_DSN`                    | Server + Client | Separate DSNs for server and client Sentry projects.                       |

Committed to git: `.env.example` with all variable names and empty values.
Never committed: `.env`, `.env.local`, `.env.production`.

---

## RGPD

- The join form (`/[slug]/join`) must have a **mandatory checkbox** for data processing consent before submit is enabled.
- Collected data: first name (or nickname), timestamp. Nothing else.
- Retention: tickets in `done` or `cancelled` status are purged after **24 hours** via Supabase Cron Job.
- A link to the privacy policy page (`/privacy`) must be present on the join form.
- No analytics scripts (Google Analytics, etc.) that transmit customer data without explicit consent.
