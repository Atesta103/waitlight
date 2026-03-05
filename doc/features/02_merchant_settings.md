# Feature 02: Merchant Settings (Merchant Settings)

- **Type**: Core application (Core)
- **Dependencies**: [Feature 01: Authentication](./01_merchant_auth.md)
- **Status**: ✅ Implemented (2026-03-03) — additional tasks completed (2026-03-04)

**Description**: Configuration screen allowing the registered merchant to define the identity of their shop (name, logo, custom URL "slug", default manual wait time) as well as the queue configuration (max capacity, welcome message, notifications, auto-close).

## Integration sub-tasks

### Backend (Supabase)

- [x] Add `logo_url` and `default_prep_time_min` columns in the `merchants` table.
- [x] Add `notifications_enabled` and `auto_close_enabled` columns in the `settings` table.
- [x] Create a public `merchant-logos` Storage Bucket (max 512 KB, JPEG/PNG/WebP) with owner RLS policies.
- [x] Create the RPC `check_slug_available(p_slug, p_exclude_merchant_id)` — checks a slug's availability excluding the merchant themselves.
- [x] Update modification actions (`updateMerchantIdentityAction`, `updateQueueSettingsAction`, `regenerateQRAction`) with auth session + Zod.

### Frontend (Next.js)

- [x] `/(dashboard)/dashboard/settings/page.tsx` page — SSR Server Component that loads initial data and passes it to the `SettingsPanel`.
- [x] Rewired `SettingsPanel` component — split into two independent sections (Identity / Queue configuration), each with its own `useTransition` + Server Action.
- [x] Logo image upload — client-side upload to `merchant-logos` bucket via the Supabase browser client, public URL saved via `updateMerchantIdentityAction`.
- [x] Dynamic slug validation with `SlugInput` hooked to `checkSlugAvailabilitySettingsAction` (excludes the merchant's current slug).
- [x] Updated `Avatar` component to support the `imageUrl` prop (`next/image` display if available).
- [x] Forms with inline error feedback and success confirmation.

## Identified additional tasks

### Quality & robustness

- [x] **Zod Tests**: Add unit tests for `MerchantIdentitySchema` and `QueueSettingsSchema` (1 valid case, 2 invalid cases each — AGENTS.md rule §2.6). — 19 tests in `lib/validators/__tests__/settings.test.ts`.
- [ ] **Integration Tests**: Test `updateMerchantIdentityAction` and `updateQueueSettingsAction` in test environment.
- [x] **Logo deletion**: Add a "Delete logo" button (deletes the Supabase Storage file + sets `logo_url` to `null`).

### UX & accessibility

- [x] **Logo preview** before upload (FileReader API) to avoid an unnecessary network round-trip.
- [x] **Slug confirmation**: Warn the user that a slug change invalidates already printed QR codes (Confirmation dialog).
- [x] **Navigation**: Settings is accessible via the `UserMenu` dropdown (avatar menu in the dashboard header).

### Security

- [x] **Rate limit** on `updateMerchantIdentityAction` (slug change) — `merchants.slug_last_changed_at` + 1h cooldown enforced server-side (migration `20260303000001_slug_rate_limit.sql`).

## Architecture Notes

- The `SettingsPanel` is divided into two sections with separate local states to avoid blocking the QR/capacity section when saving the identity and vice versa.
- Logo upload is done **client-side** via the Supabase browser client (anonymous session with storage policy): the `service_role` key is never exposed.
- The `check_slug_available` RPC is `SECURITY DEFINER`: it does not leak existing slugs via brute-force starting from the anon key.
- The QR Code is **not re-generated after a slug change** — the React component recalculates it client-side from the slug updated in the local state. The save updates `merchants.slug` in the database.
