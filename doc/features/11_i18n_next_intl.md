# Feature 11: Internationalization (i18n) — next-intl

- **Type**: Cross-cutting concern
- **Dependencies**: All other features (affects every component with text)
- **Priority**: High — required by `doc/accessibility.md` (WCAG 2.1 AA)
- **Status**: ⬜ Not started

**Description**: Replace all hardcoded French text in JSX components with `next-intl` keys. Add support for French (`fr`) and English (`en`) as the first mandatory additional locale, with automatic detection via `Accept-Language` and a language selector in the footer.

> ⚠️ Current blocker: `next-intl` is not installed. All visible text is currently hardcoded in French, in direct violation of `doc/accessibility.md` §Internationalisation.

---

## Integration sub-tasks

### Infrastructure

- [ ] Install `next-intl` (`npm install next-intl`) and document the bundle impact (~30 KB gzip).
- [ ] Configure the `next-intl` middleware in `proxy.ts` for locale detection via `Accept-Language` and cookie storage.
- [ ] Add the locale prefix to public routes: `/fr/[slug]`, `/en/[slug]` (merchant routes non-prefixed or optionally prefixed based on decision).
- [ ] Create `messages/fr.json` and `messages/en.json` — key structure by domain (auth, onboarding, settings, dashboard, queue, common).
- [ ] Update `next.config.ts` for i18n support.
- [ ] Wrap the root Server Components with `NextIntlClientProvider`.

### Component translation

- [ ] `components/sections/` — all organisms (`SettingsPanel`, `LoginForm`, `RegisterForm`, `OnboardingForm`, `QueueList`, `CustomerWaitView`, `DashboardHeader`, `StatsPanel`, `ForgotPasswordForm`, `ResetPasswordForm`).
- [ ] `components/composed/` — all molecules with visible text (`SlugInput`, `QRCodeDisplay`, `CapacityIndicator`, `StatusBanner`, `JoinForm`, `WaitTimeEstimate`, `ConnectionStatus`, `ActivityFeed`, `TicketCard`).
- [ ] `components/ui/` — atoms with text (`Toast`, `Input` / `Textarea` error messages).
- [ ] `lib/actions/` — Server Actions error messages translated via `next-intl` (use `getTranslations()` server-side).
- [ ] `lib/validators/` — translated Zod error messages (pass the `t()` function to schemas or use `z.setErrorMap`).
- [ ] `app/` pages — `<title>` and meta tags (`metadata`) localized via `generateMetadata`.

### UX — language selector

- [ ] Create a `LanguageSwitcher` component in `components/ui/`: displays `Français` / `English` (never flags — `doc/accessibility.md` rule).
- [ ] Integrate the selector in the footer of the public layout and the dashboard layout.
- [ ] Persist the language choice in a cookie (`NEXT_LOCALE`) and read it on load.

### Localized formats

- [ ] Replace all `toLocaleString('fr-FR')` with `Intl.DateTimeFormat` passed the active locale.
- [ ] Replace all hardcoded units (`"min"`, `"h"`, `"Ko"`) with `Intl.NumberFormat` formats with units.

### Tests

- [ ] Verify that every `fr.json` key has its equivalent in `en.json` (lint script or CI check).
- [ ] Playwright E2E Test: change the language via the selector and verify the display in English on `/[slug]`.

---

## Decisions to make before implementation

| Question | Options | Recommendation |
| --- | --- | --- |
| Routing strategy | Mandatory prefix (`/fr/*`, `/en/*`) vs optional prefix (`/*` = default locale) | Optional prefix for French (default) — avoids breaking existing printed QR Codes |
| Fallback locale | `fr` → `en` or `en` → `fr` | `en` as universal fallback (`next-intl` convention) |
| Supabase email translation | Out of `next-intl` scope — configure in the Supabase dashboard | Leave in French for now, iterate in v2 |

---

## Architecture Notes

- Server Actions returning `{ error: string }` must use `getTranslations()` from `next-intl/server` — **never** pass the locale as an action parameter.
- Zod schemas must **not** receive hardcoded translated strings — use `z.setErrorMap` with the active locale or override messages at the action level after `safeParse`.
- The `SlugInput` component displays the public URL (`waitlight.app/[slug]`) — this URL is not translated, but the labels around it are.
