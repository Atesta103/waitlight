# Feature 11: Internationalization (i18n) — next-intl

## 1. Metadata

- Feature: Internationalization (French / English)
- Owner: Founding Team
- Status: `proposed`
- Last updated: 2026-03-23
- Related issue/epic: TBD
- Value to user: 3
- Strategic priority: 4
- Time to code: 5
- Readiness score: 25/100
- Interest score: 55/100
- Source of truth:
  - Schema: n/a
  - Route(s): All routes (cross-cutting)
  - UI entrypoint(s): `app/layout.tsx`, `components/`

## 2. Problem and Outcome

### Problem

All visible text in the app is hardcoded in French, violating `doc/accessibility.md` §Internationalisation (WCAG 2.1 AA). Non-French-speaking merchants and customers cannot use the app without translation.

### Target outcome

All user-facing text is managed via `next-intl` translation keys. The app supports French (default) and English, with automatic locale detection via `Accept-Language` header and a manual language switcher in the footer.

### Success metrics

- 100% of user-facing strings keyed (zero hardcoded text)
- Language switch takes effect without page reload
- All `fr.json` keys have a matching `en.json` key (enforced in CI)

## 3. Scope

### In scope

- `next-intl` setup (middleware, messages, provider)
- `messages/fr.json` + `messages/en.json` translation files
- Translation of all sections, composed components, atoms with text
- Server Actions error message translation
- `LanguageSwitcher` component in footer
- Locale-aware formats (dates, units via `Intl`)
- CI check: all `fr.json` keys present in `en.json`

### Out of scope

- Supabase Auth email template translation (Supabase dashboard config)
- More than 2 locales in this iteration
- Professional copywriting for EN strings

## 4. User Stories

- As an English-speaking merchant, I want the dashboard in English so that I can use it comfortably.
- As a customer, I want the queue wait page in my browser's language so that I understand my position.
- As a merchant, I want to switch language manually so that I can serve multilingual customers.

## 5. Functional Requirements

- [ ] FR-1: Install `next-intl`, configure middleware for locale detection (`Accept-Language` + cookie)
- [ ] FR-2: Create `messages/fr.json` + `messages/en.json` (keys per domain: auth, onboarding, settings, dashboard, queue, common)
- [ ] FR-3: Translate all `components/sections/` organisms with static text
- [ ] FR-4: Translate all `components/composed/` molecules with static text
- [ ] FR-5: Translate `app/` pages — `<title>` + meta description via `generateMetadata`
- [ ] FR-6: Server Actions use `getTranslations()` for error messages (never receive locale as param)
- [ ] FR-7: `LanguageSwitcher` component — Français / English (no flags per `doc/accessibility.md`)
- [ ] FR-8: Integrate `LanguageSwitcher` in footer of public layout and dashboard layout
- [ ] FR-9: Replace `toLocaleString('fr-FR')` with `Intl.DateTimeFormat` using active locale
- [ ] FR-10: CI check: every `fr.json` key has equivalent in `en.json` (lint script)
- [ ] FR-11: Playwright E2E: change language via switcher → verify EN display on `/[slug]`

## 6. Data Contracts

### Existing tables/types

- n/a — no DB changes needed

### Schema changes (if any)

- [x] None

### Validation (Zod)

- Input schema(s): `LocaleSchema` (`'fr' | 'en'`) for language switcher cookie
- Expected failure responses: n/a

## 7. API and Integration Contracts

### Route handlers

- n/a (locale managed via middleware + cookie)

### External dependencies

- `next-intl` (~30 KB gzip)
- `NEXT_LOCALE` cookie for persistence

## 8. UI and UX

- Entry points: Footer of public layout + dashboard layout (LanguageSwitcher)
- Loading state: n/a (locale switch is synchronous via cookie + redirect)
- Empty state: n/a
- Error state: n/a
- Accessibility notes: `LanguageSwitcher` uses text labels (never flags per WCAG); `lang` attribute on `<html>` updated per locale

## 9. Security and Privacy

- Secret/env requirements: none
- Data retention and PII handling: n/a
- Abuse/failure cases and mitigations: Locale value from cookie sanitized via `LocaleSchema`

## 10. Observability

- Structured logs to emit: n/a
- Key counters/timers to track: Language distribution among active users (anonymized)
- Alert thresholds (if relevant): n/a

## 11. Test Plan

### Unit

- Zod `LocaleSchema`: `'fr'` → valid, `'de'` → invalid

### Integration

- CI key-parity check: run against sample `fr.json` with missing EN key → fails

### Storybook (if UI)

- Story variant 1: `LanguageSwitcher` — French selected
- Story variant 2: `LanguageSwitcher` — English selected

### Manual QA

- Step 1: Switch browser `Accept-Language` to `en` → verify English UI on `/[slug]`
- Step 2: Use footer switcher → toggle EN/FR → verify without page reload
- Step 3: Refresh page → verify locale persists via cookie

## 12. Implementation Plan

1. Milestone 1: Install `next-intl`, configure middleware, create `fr.json` + `en.json` stubs
2. Milestone 2: Translate all sections, composed, atoms in bulk; update `generateMetadata`
3. Milestone 3: `LanguageSwitcher`, Server Actions translation, CI key-parity check, Playwright E2E

## 13. Rollout and Backfill

- Feature flag needed: no (next-intl with optional prefix — default locale = `fr`, no URL change)
- Backfill required: no
- Rollback plan: Revert next-intl config; restore hardcoded French strings

## 14. Definition of Done

- [ ] Implementation merged to main
- [ ] Relevant unit and integration tests added and passing
- [ ] End-user or internal documentation updated
- [ ] `.env.example` updated (if needed)
- [ ] Dashboard/Storybook layout and behavior visually validated
