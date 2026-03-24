# Feature 02: Merchant Settings

## 1. Metadata

- Feature: Merchant Settings & Profile Configuration
- Owner: Founding Team
- Status: `implemented`
- Last updated: 2026-03-23
- Related issue/epic: TBD
- Value to user: 4
- Strategic priority: 4
- Time to code: 3
- Readiness score: 85/100
- Interest score: 80/100
- Source of truth:
  - Schema: `supabase/migrations/20260303000001_slug_rate_limit.sql`
  - Route(s): `app/(dashboard)/dashboard/settings/`
  - UI entrypoint(s): `app/(dashboard)/dashboard/settings/page.tsx`

## 2. Problem and Outcome

### Problem

Merchants need to personalize their service (name, logo, public URL slug) and configure queue behavior (capacity, welcome message, notifications). Without settings, all merchants share the same generic experience with no branding.

### Target outcome

Each merchant can configure their identity and queue parameters. Changes are persisted immediately with proper validation, and slug changes are rate-limited to prevent abuse of already-printed QR codes.

### Success metrics

- Settings save in < 2 seconds (90th percentile)
- Slug change rate-limited to once per hour per merchant
- Logo upload validated client-side before any network request

## 3. Scope

### In scope

- Merchant identity: name, slug, logo upload/delete, default prep time
- Queue config: max capacity, welcome message, notifications toggle, auto-close toggle
- Slug availability real-time validation (excludes current slug)
- Rate limit on slug changes (1h cooldown)

### Out of scope

- Multi-location support (one merchant = one slug)
- Custom domain (merchants share waitlight.app domain)

## 4. User Stories

- As a merchant, I want to set my shop name and logo so that customers recognize my brand on the wait screen.
- As a merchant, I want to configure my queue capacity so that I never exceed my service limits.
- As a merchant, I want to change my slug with a warning so that I know my QR codes will need reprinting.

## 5. Functional Requirements

- [x] FR-1: Merchant identity form (name, slug, logo, default prep time) with Zod validation
- [x] FR-2: Queue settings form (max capacity, welcome message, notifications, auto-close)
- [x] FR-3: Logo upload to Supabase Storage (`merchant-logos` bucket), preview before upload
- [x] FR-4: Logo delete button (removes from storage + sets `logo_url = null`)
- [x] FR-5: Slug availability check (real-time, excludes current slug)
- [x] FR-6: Slug change confirmation dialog warning about QR code invalidation
- [x] FR-7: Rate limit on slug changes (1h enforced server-side)
- [ ] FR-8: Integration test for `updateMerchantIdentityAction` and `updateQueueSettingsAction`

## 6. Data Contracts

### Existing tables/types

- `merchants`: `name`, `slug`, `logo_url`, `default_prep_time_min`, `is_open`, `slug_last_changed_at`
- `settings`: `merchant_id`, `max_capacity`, `welcome_message`, `notifications_enabled`, `auto_close_enabled`, `qr_regenerated_at`

### Schema changes (if any)

- [x] None (all columns added in migration `20260303000001_slug_rate_limit.sql`)

### Validation (Zod)

- Input schema(s): `MerchantIdentitySchema`, `QueueSettingsSchema` in `lib/validators/settings.ts`
- Expected failure responses: `400` (validation), `429` (slug rate limit), `401` (unauthenticated)

## 7. API and Integration Contracts

### Route handlers

- No route handlers — all mutations via Server Actions

### External dependencies

- Supabase Storage (`merchant-logos` bucket) for logo upload
- `check_slug_available(p_slug, p_exclude_merchant_id)` RPC (SECURITY DEFINER)

## 8. UI and UX

- Entry points: Dashboard header → avatar menu → Settings
- Loading state: `useTransition` per-section — saves button shows spinner; other section remains interactive
- Empty state: Default values pre-filled from SSR fetch
- Error state: Inline per-field error messages; toast on server error
- Accessibility notes: Confirmation dialog (`Dialog` component) for destructive slug change; `aria-invalid` on Zod-errored inputs

## 9. Security and Privacy

- Secret/env requirements: none new (uses existing Supabase keys)
- Data retention and PII handling: Logo stored in public Supabase Storage with owner RLS; URL saved as `logo_url`
- Abuse/failure cases and mitigations: `check_slug_available` RPC is SECURITY DEFINER (prevents slug enumeration); slug rate limit prevents QR code churn

## 10. Observability

- Structured logs to emit: Slug change event (old → new), logo upload/delete
- Key counters/timers to track: Settings save latency, logo upload size distribution
- Alert thresholds (if relevant): Rate limit hit rate > 5% → possible abuse

## 11. Test Plan

### Unit

- `MerchantIdentitySchema`: valid, empty name, slug too short, invalid logo URL
- `QueueSettingsSchema`: valid, max_capacity = 0, welcome_message > 500 chars

### Integration

- `updateMerchantIdentityAction`: valid → merchants row updated; unauthorized → rejected
- `updateQueueSettingsAction`: valid → settings row updated

### Storybook (if UI)

- Story variant 1: `SettingsPanel` — default state (identity form)
- Story variant 2: `SettingsPanel` — with logo uploaded
- Story variant 3: `SlugInput` — validating, available, taken

### Manual QA

- Step 1: Change shop name → save → verify in dashboard header
- Step 2: Change slug → confirm dialog → verify rate limit after 2 attempts
- Step 3: Upload logo → preview → save → verify in avatar

## 12. Implementation Plan

1. Milestone 1: DB migrations (logo_url, slug_last_changed_at, notifications, auto_close)
2. Milestone 2: SettingsPanel component split, Server Actions, Zod schemas
3. Milestone 3: Logo upload client flow, slug validation, rate limit enforcement

## 13. Rollout and Backfill

- Feature flag needed: no
- Backfill required: no
- Rollback plan: Revert slug_last_changed_at migration; remove rate-limit check from action

## 14. Definition of Done

- [x] Implementation merged to main
- [x] Relevant unit and integration tests added and passing
- [x] End-user or internal documentation updated
- [x] `.env.example` updated (if needed)
- [ ] Dashboard/Storybook layout and behavior visually validated
