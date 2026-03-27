**Wait-Light Backend API**

***

# Wait-Light Backend API

## Modules

### Actions

Server Action for generating cryptographic one-time QR tokens.
Tokens are stored in `qr_tokens`, valid for 30 seconds, single-use.

| Module | Description |
| ------ | ------ |
| [actions/qr](actions/qr.md) | - |

### Actions

Server Actions for merchant authentication.
All actions validate input via Zod before any Supabase call.
Errors are returned as user-facing French strings — never thrown.

| Module | Description |
| ------ | ------ |
| [actions/auth](actions/auth.md) | - |

### Actions

Server Actions for merchant queue management.
All mutations verify merchant ownership before writing (`merchant_id = auth.uid()`).
RLS provides a second enforcement layer in the database.

| Module | Description |
| ------ | ------ |
| [actions/queue](actions/queue.md) | - |

### Actions

Server Actions for merchant settings management.
Covers merchant identity, queue config, QR regeneration, logo, and slug.

| Module | Description |
| ------ | ------ |
| [actions/settings](actions/settings.md) | - |

### Actions

Server Actions for the merchant onboarding flow (first-time setup).

| Module | Description |
| ------ | ------ |
| [actions/onboarding](actions/onboarding.md) | - |

### Other

| Module | Description |
| ------ | ------ |
| [types/database](types/database.md) | - |

### Routes

### `GET /auth/callback`

OAuth/PKCE callback Route Handler. Supabase redirects here after:
- Email confirmation (sign-up)
- Password reset (magic link)
- OAuth provider authentication (Google, Apple)

The `code` query param is exchanged for a session cookie via PKCE.

| Scenario | Query params | Redirect |
|---|---|---|
| OAuth cancelled | `?error=access_denied` | `/login?error=oauth_cancelled` |
| OAuth error | `?error=*` | `/login?error=oauth_error` |
| PKCE success | `?code=*` | `{origin}{next}` (default `/dashboard`) |
| Invalid/expired code | `?code=*` (exchange fails) | `/login?error=auth_callback_error` |
| No code | — | `/login?error=auth_callback_error` |

> This route is **excluded from middleware protection** by design.

| Module | Description |
| ------ | ------ |
| [auth-callback](auth-callback.md) | - |

### Routes

Next.js Middleware (named `proxy` to avoid Next.js file naming ambiguity).

**Runs on:** all requests matching `config.matcher`
(excludes static assets, images, and `/auth/callback`).

**Responsibilities:**
1. Refresh the Supabase session cookie so Server Components always see the latest auth state.
2. Protect `(dashboard)` + `/onboarding` routes — redirect unauthenticated users to `/login`.
3. Redirect authenticated users away from auth pages to `/dashboard`.
4. Redirect `/` to either `/dashboard` (authed) or `/login` (unauthed).

| Route pattern | Authed | Unauthed |
|---|---|---|
| `/` | → `/dashboard` | → `/login` |
| `/dashboard/**`, `/onboarding` | pass | → `/login?redirectTo={path}` |
| `/login`, `/register`, etc. | → `/dashboard` | pass |

| Module | Description |
| ------ | ------ |
| [proxy](proxy.md) | - |

### Utilities

Centralized configuration constants for the rotating QR code system.
Edit here to tune timing without hunting across multiple files.

| Module | Description |
| ------ | ------ |
| [qr-config](qr-config.md) | - |

### Utilities

Client-side time-slot token validation for the rotating QR code.

**Strategy:** the merchant dashboard generates a time-slotted integer token:
`token = Math.floor(Date.now() / QR_REFRESH_INTERVAL_MS)`.
The token is embedded in the join URL as `/{slug}/join?t={token}`.

**Grace period:** when the QR rotates, the previous slot is still accepted
for {@link QR_GRACE_MS} ms to cover customers who scanned just before rotation.

| Module | Description |
| ------ | ------ |
| [qr-token](qr-token.md) | - |

### Validators

Zod schema for the merchant onboarding form.

| Module | Description |
| ------ | ------ |
| [validators/onboarding](validators/onboarding.md) | - |

### Validators

Zod schemas for all merchant authentication flows.

| Module | Description |
| ------ | ------ |
| [validators/auth](validators/auth.md) | - |

### Validators

Zod schemas for merchant settings form inputs.

| Module | Description |
| ------ | ------ |
| [validators/settings](validators/settings.md) | - |

### Validators

Zod schemas for queue mutation inputs.

| Module | Description |
| ------ | ------ |
| [validators/queue](validators/queue.md) | - |
