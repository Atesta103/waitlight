# Responsive app-wide — design

**Date:** 2026-08-06
**Status:** Approved (brainstorming)

## Goal

Make the whole app genuinely usable on every device, worked "like a real app":
everything fits at the smallest size of each device class. Strict no-scroll
rules apply only to the dashboard queue page; every other page just needs to be
comfortable and fit, with normal vertical scroll allowed.

## Target minimum sizes (the "it must fit" guarantee)

- **Phone:** iPhone SE — 375 × 667
- **Tablet portrait:** iPad — 768 × 1024

Anything larger is expected to work by construction.

## Part 1 — One responsive model for the whole app

A single, app-wide convention so "side by side" means the same thing everywhere.

**Side-by-side condition = landscape AND width ≥ 1024px.**
Everything else (portrait at any width, OR width < 1024px) = stacked / tabs.

| Device | Result |
|---|---|
| iPhone SE 375×667 (portrait or landscape) | stacked / tabs |
| iPad 768×1024 portrait | tabs |
| iPad Pro 12.9" 1024×1366 **portrait** | tabs (orientation decides, not width) |
| iPad 1024×768 **landscape** | side by side |
| Desktop 1440×900 | side by side |

Rationale for orientation-based (not pure width): a 12.9" iPad in portrait is
1024px wide; a pure `lg:` (≥1024px) width breakpoint would wrongly put it in
side-by-side. Requiring landscape as well fixes that. Requiring width ≥ 1024px
in addition keeps phones in landscape (short viewports, e.g. 667×375 or 932×430)
on the stacked/tabs layout where they belong.

**Tailwind implementation:** the base styles express the stacked/tabs layout;
the side-by-side layout is applied via stacked variants `lg:landscape:…` (both
conditions must be true). `landscape` and `lg` are built-in Tailwind variants —
no new dependency, no config change.

## Part 2 — Dashboard queue page (strict rules)

The only page with a "zero general scroll" constraint. Fixed-height shell
(`h-dvh`) is already in place (see `app/(dashboard)/layout.tsx`).

Files: `app/(dashboard)/dashboard/QueueSection.tsx`,
`components/composed/QRCodeDisplay.tsx`.

### Phone + tablet portrait (tabs)

- Tabs "File / QR code"; only one panel visible at a time (unchanged behavior).
- **File tab:** internal scroll on the list only.
- **QR tab:** fits normally; if the viewport is genuinely too short (e.g. iPhone
  SE in landscape), the card keeps an internal-scroll safety valve. No page
  scroll.

### Tablet landscape + desktop (side by side)

- List on the left (internal scroll if long), QR card on the right.
- **Zero scroll anywhere else, including the QR card** — the key technical point.

### QR sizing — container-measured (replaces fixed tiers)

To guarantee the QR card never scrolls in landscape/desktop, replace the three
fixed sizes (`110 / 150 / 220`) and the `useMediaQuery`-based size selection with
a QR canvas sized to the actually-available space:

- Measure the QR panel/card available height with a `ResizeObserver`.
- Compute the canvas pixel size from available height (accounting for the card's
  header, countdown, and footer chrome), clamped to a min/max range
  (~120px to ~240px).
- On iPad landscape (768px tall) the QR shrinks to fit without scroll; on a large
  screen it grows to fill the space nicely.
- This removes the `QR_SIZE_FULL / QR_SIZE_COMPACT / QR_SIZE_COMPACT_SM`
  constants, the `isCompactQr` / `isShortViewport` media queries, and the size
  branching in `QueueSection.tsx`.

### Layout switch wiring

The `lg:` prefixes in `QueueSection.tsx` that drive the split (tab switcher
visibility, `grid-cols`, panel `order-*` / `flex` / `hidden`) become
`lg:landscape:` so the switch follows the Part 1 condition. The `activeTab`
state and the stacked layout remain the fallback whenever side-by-side is off.

## Part 3 — Rest of the app (simple rules: "usable and it fits")

**Analyse + réglage** on every page below, at both minimum sizes (375×667 and
768×1024). Normal vertical scroll is allowed. No redesign — just make each screen
clean and comfortable.

Pages in scope:
- Customer-facing: `app/[slug]/join`, `app/[slug]/wait/[ticketId]`,
  `app/[slug]/retrouver`, `app/[slug]/wait/[ticketId]/games/*`, `app/carte`
- Dashboard: `app/(dashboard)/analytics`, `app/(dashboard)/dashboard/settings`
- `app/onboarding`, landing (`app/page.tsx`), auth (`app/(auth)/*`)

Checklist applied to each page:
- No horizontal overflow at 375px and 768px width.
- Touch targets ≥ 40px.
- Text remains legible (no overflow, no truncation of essential content).
- Forms and cards don't cramp or clip; spacing stays comfortable.
- Content reflows sensibly (columns collapse to a single column when narrow).

Each page is a small independent unit of work: audit at the two sizes, fix what's
wrong, verify. No shared state between them beyond the Part 1 convention (which
only the queue page actually uses for the tabs/side-by-side switch).

## Out of scope

- Any redesign or new features.
- Changing the queue page's data flow, tabs semantics, or QR rotation logic.
- New breakpoints or Tailwind config changes beyond using built-in variants.

## Verification

- Queue page: at 375×667, 768×1024 (portrait → tabs), 1024×768 and 1440×900
  (landscape → side by side): only the list scrolls in landscape/desktop; the QR
  card never scrolls there; no page-level scroll.
- Every Part 3 page: no horizontal scroll at 375 and 768 width; content readable
  and reachable.
