# Feature 10: Multichannel Authentication (Google / Apple SSO)

## 1. Metadata

- Feature: Social Login (Google & Apple SSO)
- Owner: Founding Team
- Status: `proposed` <!-- Code scaffolding exists (FR-1–FR-5); blocked on external OAuth provider config -->
- Last updated: 2026-03-23
- Related issue/epic: TBD
- Value to user: 3
- Strategic priority: 3
- Time to code: 3
- Readiness score: 65/100
- Interest score: 60/100
- Source of truth:
  - Schema: `supabase/migrations/20260302000000_initial_schema.sql`
  - Route(s): `app/(auth)/`, `app/auth/callback/`
  - UI entrypoint(s): `components/composed/SocialAuthButtons.tsx`

## 2. Problem and Outcome

### Problem

Email/password registration has significant friction — merchants must choose a password, confirm their email, and remember credentials. This raises signup abandonment rate and leads to support requests for password resets.

### Target outcome

Merchants can sign up and sign in with one tap via Google or Apple — no password, no email confirmation needed. The existing onboarding flow handles new OAuth users automatically.

### Success metrics

- OAuth sign-in completes in < 3 seconds (redirect + PKCE exchange)
- Zero raw OAuth tokens visible in the browser at any point
- Account linking handled for existing email/password users

## 3. Scope

### In scope

- Google OAuth via Supabase Auth provider
- Apple OAuth via Supabase Auth provider
- PKCE flow via `/auth/callback` route
- Error mapping (cancelled, provider error) to user-friendly messages
- Onboarding redirect for new OAuth users

### Out of scope

- Apple Private Relay email masking (planned)
- Account linking between email/password and OAuth (planned)
- Customer SSO (customers are anonymous)

## 4. User Stories

- As a merchant, I want to sign in with Google so that I don't need to remember a password.
- As a merchant, I want to sign in with Apple so that I can use Face ID / Touch ID.
- As a merchant, I want my OAuth account linked to my existing email/password account so that I can switch between methods.

## 5. Functional Requirements

<!-- NOTE: FR-1–FR-5 are code-complete (components + actions exist in codebase).
     Feature remains `proposed` because Google/Apple providers are not yet configured
     in Supabase Auth dashboard, and redirect URIs are not whitelisted. -->
- [x] FR-1: `SocialAuthButtons` molecule — Google + Apple buttons on `/login` and `/register`
- [x] FR-2: `oauthSignInAction` — calls `supabase.auth.signInWithOAuth()`, returns redirect URL (PKCE-safe)
- [x] FR-3: `/auth/callback` handler — PKCE code exchange; maps `?error=access_denied` → `oauth_cancelled`
- [x] FR-4: Session refresh via root `proxy.ts` middleware (`updateSession` on every request)
- [x] FR-5: OAuth users land on `/onboarding` if no `merchants` row exists
- [ ] FR-6: Enable Google provider in Supabase Auth panel + configure OAuth credentials
- [ ] FR-7: Enable Apple provider in Supabase Auth panel + configure OAuth credentials
- [ ] FR-8: Whitelist production redirect URI in both Google Cloud Console and Apple Developer Portal
- [ ] FR-9: Account linking for existing email/password users trying OAuth with same email
- [ ] FR-10: Handle Apple Private Relay email (`...@privaterelay.appleid.com`)

## 6. Data Contracts

### Existing tables/types

- `auth.users` (Supabase managed): OAuth users created automatically on first sign-in
- `merchants`: same RLS INSERT policy (`auth.uid() = id`) — OAuth new users trigger onboarding

### Schema changes (if any)

- [x] None

### Validation (Zod)

- Input schema(s): `OAuthProviderSchema` (`provider: 'google' | 'apple'`)
- Expected failure responses: `400` (invalid provider), `500` (OAuth provider error)

## 7. API and Integration Contracts

### Route handlers

- `GET /auth/callback`: PKCE code exchange; redirects to `/dashboard` or `/onboarding`

For each route:

- Auth requirements: Public (unauthenticated) — processes Supabase PKCE callback
- Input shape: `?code=...` query param from Supabase Auth
- Output shape: Redirect to `/dashboard` (existing user) or `/onboarding` (new user)
- Error states: `?error=access_denied` → `oauth_cancelled` redirect; other errors → `oauth_error`
- Idempotency expectations: Code is one-time use (PKCE)

### External dependencies

- Google Cloud Console (OAuth App credentials)
- Apple Developer Portal (OAuth App credentials)
- Supabase Auth Google + Apple providers

## 8. UI and UX

- Entry points: `/login`, `/register` — below the email/password form
- Loading state: Button in loading state during OAuth redirect
- Empty state: n/a
- Error state: `AuthErrorBanner` — distinct message for cancelled vs provider error
- Accessibility notes: Google button uses official brand colors (4-path G logo); Apple button uses monochrome logo — both comply with provider guidelines; buttons have `aria-label`

## 9. Security and Privacy

- Secret/env requirements: No new env vars in Next.js — credentials stored in Supabase Auth dashboard
- Data retention and PII handling: OAuth email and profile stored in `auth.users` (Supabase managed); no additional storage
- Abuse/failure cases and mitigations: PKCE flow — app never sees raw OAuth tokens; strict redirect URI whitelisting prevents open redirect; Supabase Auth handles token refresh

## 10. Observability

- Structured logs to emit: OAuth sign-in initiated, OAuth callback success/failure, provider error type
- Key counters/timers to track: OAuth vs email/password registration ratio, callback error rate
- Alert thresholds (if relevant): OAuth callback error rate > 5% → alert

## 11. Test Plan

### Unit

- `OAuthProviderSchema`: valid `google`, valid `apple`, invalid string

### Integration

- `oauthSignInAction`: valid provider → returns redirect URL; invalid provider → error

### Storybook (if UI)

- Story variant 1: `SocialAuthButtons` — default (Google + Apple)
- Story variant 2: `SocialAuthButtons` — loading state (one button loading)

### Manual QA

- Step 1: Click "Continue with Google" → authorize → land on `/onboarding`
- Step 2: Cancel Google OAuth → verify "Connexion annulée." error shown
- Step 3: Sign in again with same Google account → land on `/dashboard` (no re-onboarding)

## 12. Implementation Plan

1. Milestone 1: Enable Google/Apple in Supabase Auth dashboard + configure OAuth credentials
2. Milestone 2: Configure redirect URIs in Google Cloud Console + Apple Developer Portal
3. Milestone 3: Account linking + Apple Private Relay handling

## 13. Rollout and Backfill

- Feature flag needed: yes — OAuth providers disabled until credentials configured in Supabase
- Backfill required: no
- Rollback plan: Disable Google/Apple providers in Supabase Auth dashboard — existing email/password accounts unaffected

## 14. Definition of Done

- [ ] Implementation merged to main
- [ ] Relevant unit and integration tests added and passing
- [ ] End-user or internal documentation updated
- [ ] `.env.example` updated (if needed)
- [ ] Dashboard/Storybook layout and behavior visually validated
