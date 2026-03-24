# Feature 12: Error & Not-Found Pages

## 1. Metadata

- Feature: Custom Error & 404 Pages
- Owner: Founding Team
- Status: `proposed`
- Last updated: 2026-03-23
- Related issue/epic: TBD
- Value to user: 2
- Strategic priority: 3
- Time to code: 1
- Readiness score: 30/100
- Interest score: 55/100
- Source of truth:
  - Schema: n/a
  - Route(s): `app/error.tsx`, `app/not-found.tsx`, `app/(dashboard)/error.tsx`, `app/[slug]/error.tsx`
  - UI entrypoint(s): `app/error.tsx`

## 2. Problem and Outcome

### Problem

`app/error.tsx` exists but is empty. `app/not-found.tsx` doesn't exist. Next.js default error/404 pages are generic, break branding, and expose no recovery path. A crash in the dashboard logs the merchant out.

### Target outcome

All error and 404 scenarios render with consistent Wait-Light branding, a human-friendly message, and a clear recovery action. Route-scoped error boundaries keep a dashboard crash from affecting the entire app.

### Success metrics

- 404 page renders the Wait-Light logo + recovery link
- Dashboard crash boundary prevents merchant logout
- No raw error messages or stack traces shown to users

## 3. Scope

### In scope

- `app/not-found.tsx` — custom 404 with branding and back link
- `app/error.tsx` — global error boundary with "Try again" reset button
- `app/(dashboard)/error.tsx` — scoped boundary for dashboard
- `app/[slug]/error.tsx` — scoped boundary for customer-facing routes

### Out of scope

- Error monitoring service integration (Sentry etc.) — can be added separately
- Animated error illustrations
- Multi-locale error messages (→ Feature 11)

## 4. User Stories

- As a customer, I want a clear 404 page so that I know the link was wrong.
- As a merchant, I want a dashboard error to show a recovery option so that I don't lose access to the queue.
- As any user, I want to never see a raw Supabase error or stack trace in production.

## 5. Functional Requirements

- [ ] FR-1: `app/not-found.tsx` — Wait-Light logo, "Page introuvable" message, link back to `/` or `/dashboard`
- [ ] FR-2: `app/error.tsx` — global boundary, "Quelque chose s'est cassé" message, `reset()` button
- [ ] FR-3: `app/(dashboard)/error.tsx` — scoped boundary prevents full logout on dashboard crash
- [ ] FR-4: `app/[slug]/error.tsx` — scoped boundary for customer public routes
- [ ] FR-5: All error pages use design system tokens (no raw colors)
- [ ] FR-6: HTTP status codes correct (`notFound()` → 404, unhandled throw → 500)
- [ ] FR-7: No raw stack traces or Supabase error messages in production

## 6. Data Contracts

### Existing tables/types

- n/a

### Schema changes (if any)

- [x] None

### Validation (Zod)

- Input schema(s): n/a
- Expected failure responses: n/a

## 7. API and Integration Contracts

### Route handlers

- n/a (Next.js file-system convention only)

### External dependencies

- None

## 8. UI and UX

- Entry points: Automatic — triggered by Next.js on 404 or unhandled error
- Loading state: n/a
- Empty state: n/a
- Error state: The page IS the error state — must show branded recovery UI
- Accessibility notes: `<h1>` describes the error; recovery link / button is keyboard-focusable; page title reflects error type

## 9. Security and Privacy

- Secret/env requirements: none
- Data retention and PII handling: n/a — error messages must NOT include raw DB errors, user data, or stack traces
- Abuse/failure cases and mitigations: `error.message` always sanitized before rendering; `process.env.NODE_ENV === 'production'` guard for dev-only details

## 10. Observability

- Structured logs to emit: Error captured (route, error.message, user_id if available)
- Key counters/timers to track: 404 rate, global error boundary trigger rate
- Alert thresholds (if relevant): Error boundary trigger rate > 0.5% → alert

## 11. Test Plan

### Unit

- n/a

### Integration

- n/a

### Storybook (if UI)

- Story variant 1: `NotFoundPage` — default 404
- Story variant 2: `ErrorPage` — global error boundary with reset button
- Story variant 3: `DashboardErrorBoundary` — scoped error state

### Manual QA

- Step 1: Navigate to `/nonexistent` → verify custom 404 page
- Step 2: Throw a test error in a dashboard component → verify boundary catches it; queue continues
- Step 3: Verify no stack trace in production error page

## 12. Implementation Plan

1. Milestone 1: `app/not-found.tsx` + `app/error.tsx` with branding
2. Milestone 2: `app/(dashboard)/error.tsx` + `app/[slug]/error.tsx` scoped boundaries
3. Milestone 3: Error sanitization guard, observability logging

## 13. Rollout and Backfill

- Feature flag needed: no
- Backfill required: no
- Rollback plan: Delete error.tsx / not-found.tsx; Next.js falls back to defaults

## 14. Definition of Done

- [ ] Implementation merged to main
- [ ] Relevant unit and integration tests added and passing
- [ ] End-user or internal documentation updated
- [ ] `.env.example` updated (if needed)
- [ ] Dashboard/Storybook layout and behavior visually validated
