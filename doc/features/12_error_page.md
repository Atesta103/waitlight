# Feature 12: Error & Not-Found Pages

* **Type**: Core application (Core)
* **Dependencies**: None
* **Status**: ⬛ Stub only — custom error/not-found pages not yet implemented

**Description**: Provide user-friendly custom error pages for common failure scenarios: `404 Not Found`, `500 Internal Server Error`, and route-level error boundaries.

## Current state

- `app/error.tsx` — file exists but is **empty**. Falls back to the Next.js default error UI.
- `app/not-found.tsx` — not yet created. Falls back to the Next.js default 404 page.
- No route-level `error.tsx` boundaries inside `(dashboard)` or `[slug]`.

## Integration sub-tasks

### Frontend (Next.js)

- [ ] Create `app/not-found.tsx` — custom 404 page with:
  - Wait-Light branding (logo + tagline).
  - Human-friendly message ("Oops, this page doesn't exist").
  - Link back to `/` (or `/dashboard` if authenticated).
- [ ] Implement `app/error.tsx` — global error boundary:
  - Display a recovery message with a "Try again" button that calls `reset()`.
  - Log the error to a monitoring service if available.
- [ ] Add `app/(dashboard)/error.tsx` — scoped error boundary for the merchant dashboard to prevent a single page crash from logging the merchant out.
- [ ] Add `app/[slug]/error.tsx` — scoped error boundary for the customer-facing public routes.

## Identified additional tasks

### UX & accessibility
- [ ] Error pages must still render the correct HTTP status code (`notFound()` → 404, unhandled throw → 500).
- [ ] Avoid exposing raw stack traces or Supabase error messages to end-users.
- [ ] Maintain consistent branding and color palette from the design system.
