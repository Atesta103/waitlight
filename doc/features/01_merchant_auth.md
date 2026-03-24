# Feature 01: Authentication & Account Management

## 1. Metadata

- Feature: Merchant Authentication & Account Management
- Owner: Founding Team
- Status: `implemented`
- Last updated: 2026-03-23
- Related issue/epic: TBD
- Value to user: 5
- Strategic priority: 5
- Time to code: 2
- Readiness score: 90/100
- Interest score: 95/100
- Source of truth:
  - Schema: `supabase/migrations/20260302000000_initial_schema.sql`
  - Route(s): `app/(auth)/`
  - UI entrypoint(s): `app/(auth)/login/page.tsx`, `app/(auth)/register/page.tsx`

## 2. Problem and Outcome

### Problem

Without auth, any user could access any merchant's dashboard. Merchants need a private space to manage their queue in isolation, with no risk of cross-tenant data leakage.

### Target outcome

Merchants can create a secure account, sign in, reset their password, and sign out. All dashboard data is scoped to `auth.uid()` via Supabase RLS — no merchant can access another merchant's data.

### Success metrics

- 100% of dashboard routes protected by auth session check
- No raw Supabase error messages exposed to the browser
- Password reset email delivered in < 60 seconds

## 3. Scope

### In scope

- Email/password sign up, sign in, sign out
- Password reset via email (PKCE flow)
- Auth session refresh via middleware
- Onboarding redirect after first sign-up

### Out of scope

- Google/Apple SSO (→ Feature 10)
- Customer accounts (customers are always anonymous)

## 4. User Stories

- As a merchant, I want to create an account with my email so that my queue data stays private.
- As a merchant, I want to reset my password so that I can recover access if I forget it.
- As a merchant, I want to stay logged in across sessions so that I don't need to re-authenticate on every visit.

## 5. Functional Requirements

- [x] FR-1: Register with email + password (email confirmation required)
- [x] FR-2: Sign in with email + password
- [x] FR-3: Sign out from the dashboard header
- [x] FR-4: Forgot password → reset via email (PKCE callback)
- [x] FR-5: Session cookie refreshed by middleware on every request
- [x] FR-6: Authenticated users redirected away from auth pages
- [x] FR-7: Unauthenticated access to `/dashboard` redirects to `/login`
- [x] FR-8: Merchant without a profile row redirected to `/onboarding`
- [ ] FR-9: Welcome message shown after first login
- [ ] FR-10: Paywall/licence key gate (future monetisation hook)

## 6. Data Contracts

### Existing tables/types

- `auth.users` (Supabase managed): email, encrypted_password, confirmed_at
- `merchants`: `id = auth.uid()`, name, slug, logo_url, is_open, default_prep_time_min

### Schema changes (if any)

- [x] None (merchants table created in initial migration)

### Validation (Zod)

- Input schema(s): `LoginSchema`, `RegisterSchema`, `ForgotPasswordSchema`, `ResetPasswordSchema` in `lib/validators/auth.ts`
- Expected failure responses: `400` (invalid input), `401` (bad credentials), `422` (Zod parse failure)

## 7. API and Integration Contracts

### Route handlers

- `GET /auth/callback`: PKCE code exchange (email confirmation + password reset)

### External dependencies

- Supabase Auth (email/password provider, PKCE)

## 8. UI and UX

- Entry points: `/login`, `/register`, `/forgot-password`, `/reset-password`
- Loading state: Button in loading state with spinner during Server Action execution
- Empty state: n/a
- Error state: `AuthErrorBanner` component below form; success redirects with `?reset=success` query param
- Accessibility notes: Password input with strength indicator, ARIA live region for error messages

## 9. Security and Privacy

- Secret/env requirements: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Data retention and PII handling: Email stored in `auth.users` (Supabase managed); no additional PII collected at registration
- Abuse/failure cases and mitigations: Supabase Auth built-in rate limiting on sign-in attempts; PKCE prevents token interception

## 10. Observability

- Structured logs to emit: Sign-in success/failure, password reset requested
- Key counters/timers to track: Registration conversion rate, session refresh errors
- Alert thresholds (if relevant): Auth callback error rate > 1% → alert

## 11. Test Plan

### Unit

- `LoginSchema`: valid credentials, empty email, invalid email format
- `RegisterSchema`: valid, weak password, mismatched confirmation

### Integration

- `loginAction`: valid creds → session created; invalid creds → `{ error }` returned
- `registerAction`: new email → user created; existing email → handled gracefully

### Storybook (if UI)

- Story variant 1: `LoginForm` — default empty state
- Story variant 2: `LoginForm` — error state (invalid credentials)
- Story variant 3: `RegisterForm` — post-submit "Check your email" state

### Manual QA

- Step 1: Register with a new email → confirm → land on `/onboarding`
- Step 2: Sign out → try to access `/dashboard` → redirect to `/login`
- Step 3: Use forgot password → verify email → reset → sign in successfully

## 12. Implementation Plan

1. Milestone 1: Supabase Auth config, `merchants` table + RLS, `/auth/callback` route
2. Milestone 2: Login, register, forgot-password, reset-password pages + Server Actions + Zod schemas
3. Milestone 3: Middleware, onboarding redirect, session refresh, error handling

## 13. Rollout and Backfill

- Feature flag needed: no
- Backfill required: no (all accounts created after this feature)
- Rollback plan: Disable Supabase Auth email provider; redirect all auth routes to maintenance page

## 14. Definition of Done

- [x] Implementation merged to main
- [x] Relevant unit and integration tests added and passing
- [x] End-user or internal documentation updated
- [x] `.env.example` updated (if needed)
- [ ] Dashboard/Storybook layout and behavior visually validated
