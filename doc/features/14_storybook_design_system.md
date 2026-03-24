# Feature 14: Design System — Storybook

## 1. Metadata

- Feature: Storybook Design System Documentation
- Owner: Founding Team
- Status: `in-progress`
- Last updated: 2026-03-24
- Related issue/epic: TBD
- Value to user: 3
- Strategic priority: 4
- Time to code: 3
- Readiness score: 85/100
- Interest score: 83/100
- Source of truth:
  - Schema: n/a
  - Route(s): n/a (local dev tool + CI artifact)
  - UI entrypoint(s): `components/ui/`, `components/composed/`, `components/sections/`

## 2. Problem and Outcome

### Problem

The `check-app-storybook-contract.mjs` CI script warns about 19 UI components with no associated Storybook story. Without Storybook, there is no visual reference for the design system, no way to test components in isolation, and no visual regression baseline for Chromatic.

### Target outcome

Every component in `components/ui/` and `components/composed/` has at least one Storybook story. The design system is fully documented with interactive controls, accessible variants, and thematic coverage. Chromatic can then run visual regression tests on every PR.

### Success metrics

- 19 `components/ui/` atoms: 100% story coverage
- All `components/composed/` molecules: 100% story coverage
- Chromatic visual regression running on CI without false positives
- `check-app-storybook-contract.mjs` emits zero warnings

## 3. Scope

### In scope

- Storybook 9 setup (`@storybook/nextjs`)
- Story files for all 19 `components/ui/` atoms
- Story files for all `components/composed/` molecules
- Story files for key `components/sections/` organisms
- Chromatic integration (visual regression)
- Storybook build in CI (`design-system.yml`)

### Out of scope

- Full E2E Storybook interaction tests (beyond default story rendering)
- Storybook docs addon deep customization
- Public hosting of Storybook (Chromatic provides this)

## 4. User Stories

- As a developer, I want to preview every UI atom in isolation so that I can build new features without running the full app.
- As a designer, I want an interactive component gallery so that I can review states and variants quickly.
- As a reviewer, I want Chromatic visual diffs on PRs so that I can catch unintended UI regressions.

## 5. Functional Requirements

- [x] FR-1: Install and configure Storybook 9 (`@storybook/nextjs`, `@storybook/addon-essentials`)
- [x] FR-2: Configure Storybook with Tailwind CSS (replicate `globals.css` in `.storybook/preview.ts`)
- [x] FR-3: **Atoms** — story for each component in `components/ui/`:
  - [x] `Button` — variants (primary, secondary, ghost, destructive), sizes, loading, disabled
  - [x] `Input` — default, with error, disabled, with icon
  - [x] `Textarea` — default, with error, disabled
  - [x] `Badge` — status variants (waiting, called, done, cancelled)
  - [x] `Card` — default, with header, with footer
  - [x] `Spinner` — all sizes
  - [x] `Avatar` — initials, with image, fallback
  - [x] `Skeleton` — text, card, list variants
  - [x] `Checkbox` — checked, unchecked, indeterminate, disabled
  - [x] `Select` — default, with options, disabled
  - [x] `Toggle` — on, off, disabled
  - [x] `Dialog` — open, closed, with destructive action
  - [x] `Tabs` — 2 tabs, 3 tabs, with active state
  - [x] `ProgressBar` — 0%, 50%, 100%, indeterminate
  - [x] `Dropdown` — open, closed, with items
  - [x] `Divider` — horizontal, vertical
  - [x] `Toast` — success, error, warning, info
  - [x] `QueueDot` — waiting, called, done, cancelled
  - [x] `ThemePicker` — light/dark toggle
- [x] FR-4: **Molecules** — story for each component in `components/composed/`:
  - [x] `TicketCard` — waiting, called, cancelled
  - [x] `QRCodeDisplay` — active (with countdown), refreshing, error
  - [x] `SlugInput` — validating, available, taken
  - [x] `ConnectionStatus` — connected, error, reconnecting
  - [x] `WaitTimeEstimate` — various time values
  - [x] `SocialAuthButtons` — default, loading
  - [x] `CapacityIndicator` — low, medium, full
  - [x] `StatusBanner` — info, warning, error
  - [x] `JoinForm` — default, loading, error
- [x] FR-5: **Organisms** — story for key sections in `components/sections/`:
  - [x] `DashboardHeader` — open queue, closed queue, with counter
  - [x] `QueueList` — empty state, with tickets, loading skeleton
  - [x] `CustomerWaitView` — waiting, position 0, called
  - [x] `AnalyticsDashboard` — with data, empty state
- [ ] FR-6: Chromatic integration (`chromatic` npm package, `CHROMATIC_PROJECT_TOKEN` secret)
- [ ] FR-7: Storybook build in `design-system.yml` CI (uncomment Storybook steps)
- [x] FR-8: `check-app-storybook-contract.mjs` emits zero warnings after full completion

## 6. Data Contracts

### Existing tables/types

- n/a (stories use mocked data only)

### Schema changes (if any)

- [x] None

### Validation (Zod)

- Input schema(s): n/a
- Expected failure responses: n/a

## 7. API and Integration Contracts

### Route handlers

- n/a

### External dependencies

- `@storybook/nextjs` v9
- `@storybook/addon-essentials`
- `chromatic` npm package
- `CHROMATIC_PROJECT_TOKEN` GitHub Actions secret

## 8. UI and UX

- Entry points: `npm run storybook` (local) or Chromatic hosted preview (CI)
- Loading state: Storybook loads on port 6006
- Empty state: n/a (stories always render something)
- Error state: Story "Error state" variants document each component's error appearance
- Accessibility notes: Each story should include `parameters.a11y` for axe-core accessibility checks

## 9. Security and Privacy

- Secret/env requirements: `CHROMATIC_PROJECT_TOKEN` (GitHub Actions secret only — never in `.env.local`)
- Data retention and PII handling: Stories use mock data only — no real merchant or customer data
- Abuse/failure cases and mitigations: Storybook is a dev/CI tool; not deployed to production

## 10. Observability

- Structured logs to emit: n/a
- Key counters/timers to track: Chromatic story count, visual regression diff count per PR
- Alert thresholds (if relevant): Chromatic build failure → block PR merge

## 11. Test Plan

### Unit

- n/a

### Integration

- Storybook build: `npm run build-storybook` exits 0 with all stories found

### Storybook (if UI)

- All FRs above ARE the test plan — each story is verified visually in Chromatic

### Manual QA

- Step 1: `npm run storybook` → verify all components render without error
- Step 2: Check `Button` story — all variants visible, loading state shows spinner
- Step 3: Open Chromatic → verify baseline snapshots captured for all 28+ stories

## 12. Implementation Plan

1. Milestone 1: Storybook install + Tailwind config + first 5 atom stories (Button, Input, Badge, Card, Spinner)
2. Milestone 2: Remaining 14 atom stories + all molecule stories
3. Milestone 3: Organism stories + Chromatic integration + CI wiring

## 13. Rollout and Backfill

- Feature flag needed: no (local dev tool + CI artifact)
- Backfill required: no
- Rollback plan: Remove `.storybook/` folder and story files — no impact on production

## 14. Definition of Done

- [ ] Implementation merged to main
- [x] Relevant unit and integration tests added and passing
- [x] End-user or internal documentation updated
- [x] `.env.example` updated (note: `CHROMATIC_PROJECT_TOKEN` is GitHub Actions secret, not `.env.local`)
- [x] Dashboard/Storybook layout and behavior visually validated
