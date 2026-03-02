# Design System — Wait-Light

> Part of the Wait-Light engineering rules. See [`AGENTS.md`](../AGENTS.md) for the full context.
> **Respect every rule here.** The design system is not optional — deviation requires explicit discussion.

---

## Design Tokens

All tokens are defined as Tailwind CSS `theme.extend` values in `tailwind.config.ts`. **Never use raw hex/rgb values in components.**

### Colors

| Token              | Usage                                                         |
| ------------------ | ------------------------------------------------------------- |
| `brand-primary`    | Main CTA buttons, active states, progress indicators          |
| `brand-secondary`  | Secondary actions, hover states                               |
| `status-waiting`   | Badge/background for `waiting` tickets                        |
| `status-called`    | Badge/background for `called` tickets — high contrast, urgent |
| `status-done`      | Badge/background for `done` tickets — muted                   |
| `status-cancelled` | Badge/background for `cancelled` tickets — muted              |
| `surface-base`     | Page background                                               |
| `surface-card`     | Card / panel background                                       |
| `surface-overlay`  | Modal / sheet background                                      |
| `text-primary`     | Main body text                                                |
| `text-secondary`   | Supporting / label text                                       |
| `text-disabled`    | Disabled state text                                           |
| `border-default`   | Default border color                                          |
| `border-focus`     | Focus ring color (accessibility)                              |
| `feedback-error`   | Error messages, destructive actions                           |
| `feedback-success` | Success confirmation states                                   |

### Spacing

Use Tailwind's default spacing scale (`4` = 16px). No custom spacing values — use multiples of the base 4px grid.

### Typography

| Token        | Tag         | Size                 | Weight |
| ------------ | ----------- | -------------------- | ------ |
| `heading-xl` | `h1`        | 2xl–3xl (responsive) | 700    |
| `heading-lg` | `h2`        | xl–2xl               | 700    |
| `heading-md` | `h3`        | lg                   | 600    |
| `body-lg`    | `p`         | base (16px)          | 400    |
| `body-sm`    | `p`, `span` | sm (14px)            | 400    |
| `label`      | `label`     | sm                   | 500    |
| `caption`    | `span`      | xs                   | 400    |

Use Tailwind's `font-size` utilities mapped to these tokens. Never pick an arbitrary `text-[13px]`.

### Motion

All animations use Framer Motion. Token values to use as constants in `lib/utils/motion.ts`:

| Token              | Value                                             | Usage                                            |
| ------------------ | ------------------------------------------------- | ------------------------------------------------ |
| `duration.fast`    | 150ms                                             | Micro-interactions (hover, focus)                |
| `duration.default` | 300ms                                             | State transitions (card reveal, button feedback) |
| `duration.slow`    | 500ms                                             | Queue position change animation                  |
| `ease.default`     | `easeInOut`                                       | Standard transitions                             |
| `ease.spring`      | `{ type: 'spring', stiffness: 300, damping: 30 }` | Queue list item re-ordering                      |

**No animation on first render** unless it communicates a state change. Loading spinners and skeleton states are always `duration.default`.

---

## Component Hierarchy

### Atoms (`components/ui/`)

Smallest, stateless, reusable UI primitives. **No business logic. No Supabase calls. No hooks.**

| Component  | Props contract                                                                                                         |
| ---------- | ---------------------------------------------------------------------------------------------------------------------- |
| `Button`   | `variant: 'primary' \| 'secondary' \| 'ghost' \| 'destructive'`, `size: 'sm' \| 'md' \| 'lg'`, `isLoading`, `disabled` |
| `Input`    | `label`, `error`, `hint`, all native `<input>` attrs                                                                   |
| `Badge`    | `status: 'waiting' \| 'called' \| 'done' \| 'cancelled'` — auto-maps to color token                                    |
| `Card`     | `children`, `className` — layout shell only                                                                            |
| `Spinner`  | `size: 'sm' \| 'md' \| 'lg'`                                                                                           |
| `Avatar`   | `name: string` — generates initials + deterministic color from name                                                    |
| `Skeleton` | `className` — loading placeholder shape                                                                                |
| `Toast`    | Used via a global toast provider, never instantiated directly                                                          |

**Rules for atoms:**

- Must be fully accessible: keyboard navigable, correct ARIA roles, visible focus ring using `border-focus` token.
- Touch target minimum: `44×44px`. Use `min-h-11 min-w-11` as a baseline.
- Never accept a `style` prop. All variants via `className` + `cn()`.

---

### Molecules (`components/composed/`)

Combinations of atoms that form a meaningful UI unit. **May contain local state (`useState`). No async data fetching.**

| Component          | Composed from                               | Purpose                                                               |
| ------------------ | ------------------------------------------- | --------------------------------------------------------------------- |
| `TicketCard`       | `Card`, `Badge`, `Avatar`, `Button`         | Displays one queue item for the merchant dashboard                    |
| `PositionDisplay`  | `Skeleton`, Framer Motion `AnimatePresence` | Animated position counter for the customer wait page                  |
| `QRCodeDisplay`    | `Card`, `Button`                            | Shows the merchant's QR code with a download button                   |
| `WaitTimeEstimate` | `Skeleton`                                  | Shows formatted estimated wait time                                   |
| `ConnectionStatus` | `Badge`                                     | Realtime connection state banner (connected / reconnecting / offline) |
| `JoinForm`         | `Input`, `Button`, `Checkbox`               | Customer join form with RGPD consent checkbox                         |
| `StatusBanner`     | `Card`                                      | Full-screen status message (queue full, closed, called, done)         |

**Rules for molecules:**

- Props must be typed with a dedicated `type Props = { ... }` at the top of the file.
- If a molecule grows beyond ~100 lines, split it.

---

### Organisms (`components/sections/`)

Full page sections that **may fetch data** (via TanStack Query hooks) and orchestrate multiple molecules.

| Component          | Purpose                                                                      |
| ------------------ | ---------------------------------------------------------------------------- |
| `QueueList`        | Merchant dashboard: full queue with Realtime updates and call/cancel actions |
| `CustomerWaitView` | Customer view: position, wait time, status change with animations            |
| `DashboardHeader`  | Merchant header: commerce name, open/close toggle, stats summary             |
| `OnboardingForm`   | Multi-step merchant setup (name → slug → settings)                           |
| `StatsPanel`       | Fréquentation charts and metrics on `/dashboard/stats`                       |

**Rules for organisms:**

- Organisms are the only layer allowed to import TanStack Query hooks.
- Organisms are always `"use client"` components (they hold subscriptions and state).
- Pass data down to molecules/atoms as props — molecules must not re-fetch.

---

## Rules Summary

1. **Never skip a level.** A molecule must not be used where an atom is sufficient. An organism must not be embedded inside another organism.
2. **Design tokens or nothing.** If the value you need doesn't have a token, add the token first.
3. **Framer Motion for state transitions only.** Not for page load flourishes. Always wrap with `useReducedMotion()` — see `doc/accessibility.md`.
4. **Accessibility first.** Every interactive atom must pass a manual keyboard-only navigation test. Contrast ratio ≥ 4.5:1. Never `outline: none`. Every icon-only button has `aria-label`. Full rules: [`doc/accessibility.md`](./accessibility.md).
5. **Responsive from 320px.** Test every molecule at 320px (small Android) and 390px (iPhone 14).
6. **All strings are translatable.** No hardcoded French text in any component — use `next-intl` keys.
