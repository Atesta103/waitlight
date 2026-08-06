# Responsive App-Wide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the whole app usable at each device's smallest size — strict zero-general-scroll rules on the dashboard queue page, "usable and it fits" everywhere else.

**Architecture:** One app-wide breakpoint convention (side-by-side = landscape AND ≥1024px, expressed via Tailwind's `lg:landscape:` stacked variants). On the queue page, the QR canvas size is computed from the QR panel's measured height (ResizeObserver) so the card never scrolls in the side-by-side layout, replacing the old fixed-size media-query tiers. Every other page gets an audit-and-fix pass at 375×667 and 768×1024.

**Tech Stack:** Next.js (App Router), React, Tailwind CSS, TanStack Query, Vitest (unit), `qrcode.react`.

## Global Constraints

- Minimum target sizes that must fit: phone iPhone SE **375 × 667**; tablet portrait iPad **768 × 1024**. Larger works by construction.
- Side-by-side layout condition (app-wide): **landscape AND width ≥ 1024px**. Everything else (portrait at any width, OR width < 1024px) = stacked / tabs.
- Tailwind only — built-in `lg` and `landscape` variants stacked as `lg:landscape:…`. No config changes, no new dependencies.
- Strict "no general scroll, no QR-card scroll" applies **only** to the dashboard queue page in the side-by-side layout. Everywhere else, normal vertical page scroll is allowed.
- QR size clamp range: **120–240px**. `QR_CARD_CHROME_PX` starts at **366** and is tuned by eye during implementation.
- Follow existing code style: 4-space indent, no semicolons at statement ends (match surrounding files), Tailwind utility classes, French user-facing copy.

---

### Task 1: Pure QR-size computation util

**Files:**
- Create: `lib/utils/qr-size.ts`
- Test: `lib/utils/__tests__/qr-size.test.ts`

**Interfaces:**
- Produces: `computeQrSize(containerHeight: number, chrome?: number, min?: number, max?: number): number`; constants `QR_CARD_CHROME_PX = 366`, `QR_SIZE_MIN = 120`, `QR_SIZE_MAX = 240`.

- [ ] **Step 1: Write the failing test**

```ts
// lib/utils/__tests__/qr-size.test.ts
import { describe, it, expect } from "vitest"
import { computeQrSize, QR_SIZE_MIN, QR_SIZE_MAX, QR_CARD_CHROME_PX } from "@/lib/utils/qr-size"

describe("computeQrSize", () => {
    it("returns available height minus chrome when within range", () => {
        // 366 chrome + 200 => size 200
        expect(computeQrSize(QR_CARD_CHROME_PX + 200)).toBe(200)
    })

    it("clamps to the max on a tall container", () => {
        expect(computeQrSize(2000)).toBe(QR_SIZE_MAX)
    })

    it("clamps to the min on a short container", () => {
        expect(computeQrSize(QR_CARD_CHROME_PX + 10)).toBe(QR_SIZE_MIN)
    })

    it("returns the min for a zero / unmeasured container", () => {
        expect(computeQrSize(0)).toBe(QR_SIZE_MIN)
    })

    it("returns the min for a non-finite height", () => {
        expect(computeQrSize(Number.NaN)).toBe(QR_SIZE_MIN)
    })

    it("rounds fractional results", () => {
        expect(computeQrSize(QR_CARD_CHROME_PX + 150.6)).toBe(151)
    })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:unit -- qr-size`
Expected: FAIL — cannot resolve `@/lib/utils/qr-size`.

- [ ] **Step 3: Write minimal implementation**

```ts
// lib/utils/qr-size.ts

/**
 * Fixed chrome around the QR canvas inside QRCodeDisplay's card: header,
 * countdown, camera hint, footer buttons, all paddings/gaps, plus the QR
 * block's ~38px overhang beyond `size` (see QRCodeDisplay's viewSize). The
 * card fills its container's height, so the canvas gets containerHeight − this.
 * Deterministic (all these parts have fixed heights), tuned by eye — see spec
 * docs/superpowers/specs/2026-08-06-responsive-app-wide-design.md.
 */
export const QR_CARD_CHROME_PX = 366
export const QR_SIZE_MIN = 120
export const QR_SIZE_MAX = 240

/**
 * Canvas pixel size for the QR so its card fits `containerHeight` without
 * scrolling, clamped to [min, max]. Returns min for an unmeasured (0 / NaN)
 * container so first paint shows a sane size before ResizeObserver fires.
 */
export function computeQrSize(
    containerHeight: number,
    chrome = QR_CARD_CHROME_PX,
    min = QR_SIZE_MIN,
    max = QR_SIZE_MAX,
): number {
    if (!Number.isFinite(containerHeight) || containerHeight <= 0) return min
    const available = Math.round(containerHeight - chrome)
    return Math.max(min, Math.min(max, available))
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:unit -- qr-size`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/utils/qr-size.ts lib/utils/__tests__/qr-size.test.ts
git commit -m "feat(responsive): pure computeQrSize util for container-fit QR sizing"
```

---

### Task 2: Element-height hook (ResizeObserver)

**Files:**
- Create: `lib/hooks/use-measured-height.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `useMeasuredHeight<T extends HTMLElement>(): [React.RefObject<T | null>, number]` — attach the ref to an element; the number is its content-box height in px (0 until first observation, 0 while `display:none`).

This is a thin wrapper over the browser `ResizeObserver` with no branching logic of its own, so it has no unit test (the node test env has no `ResizeObserver`; the tested logic lives in Task 1). It is verified in Task 3 in the browser.

- [ ] **Step 1: Write the hook**

```ts
// lib/hooks/use-measured-height.ts
"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Tracks a DOM element's content-box height via ResizeObserver. Attach the
 * returned ref to the element to measure. Height is 0 until the first
 * observation, and 0 whenever the element is display:none (e.g. an inactive
 * tab panel) — callers should treat 0 as "unmeasured".
 */
export function useMeasuredHeight<T extends HTMLElement>(): [
    React.RefObject<T | null>,
    number,
] {
    const ref = useRef<T | null>(null)
    const [height, setHeight] = useState(0)

    useEffect(() => {
        const el = ref.current
        if (!el || typeof ResizeObserver === "undefined") return

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setHeight(entry.contentRect.height)
            }
        })
        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    return [ref, height]
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS (no errors).

- [ ] **Step 3: Commit**

```bash
git add lib/hooks/use-measured-height.ts
git commit -m "feat(responsive): useMeasuredHeight ResizeObserver hook"
```

---

### Task 3: Queue page — orientation switch + container-measured QR

**Files:**
- Modify: `app/(dashboard)/dashboard/QueueSection.tsx`

**Interfaces:**
- Consumes: `computeQrSize` (Task 1), `useMeasuredHeight` (Task 2).
- Produces: nothing consumed by later tasks.

This task replaces the fixed QR-size tiers with container-measured sizing and switches the tabs↔side-by-side breakpoint from `lg:` to `lg:landscape:`. Verification is in the browser at the four reference sizes (no unit test — it's layout).

- [ ] **Step 1: Remove the fixed-size constants and media-query sizing**

In `app/(dashboard)/dashboard/QueueSection.tsx`, delete the `QR_SIZE_FULL / QR_SIZE_COMPACT / QR_SIZE_COMPACT_SM` constant block (and its doc comment, lines ~23–33), and remove the `useMediaQuery` import if it becomes unused. Delete these lines from the component body:

```ts
const isCompactQr = useMediaQuery("(max-width: 1023px)")
const isShortViewport = useMediaQuery("(max-height: 700px)")
const qrSize = isCompactQr
    ? isShortViewport
        ? QR_SIZE_COMPACT_SM
        : QR_SIZE_COMPACT
    : QR_SIZE_FULL
```

- [ ] **Step 2: Add the measured-height hook + computed size**

Add imports near the other lib imports:

```ts
import { useMeasuredHeight } from "@/lib/hooks/use-measured-height"
import { computeQrSize } from "@/lib/utils/qr-size"
```

Inside the component, where the deleted sizing logic was:

```ts
// The QR canvas size is derived from the QR panel's measured height so the
// card fits without scrolling in the side-by-side layout (spec Part 2). In
// the tabs layout the panel is full-height, so the QR is large there too; the
// card's own overflow-y-auto is only a safety valve for very short phones.
const [qrPanelRef, qrPanelHeight] = useMeasuredHeight<HTMLDivElement>()
const qrSize = computeQrSize(qrPanelHeight)
```

- [ ] **Step 3: Attach the ref to the QR panel wrapper**

Find the QR panel `<div>` (the one with `activeTab === "qr" ? "flex" : "hidden"`). Add `ref={qrPanelRef}`:

```tsx
<div
    ref={qrPanelRef}
    className={cn(
        "min-h-0 flex-col items-center gap-3 overflow-y-auto pb-28 md:pb-0 lg:landscape:order-2 lg:landscape:flex",
        activeTab === "qr" ? "flex" : "hidden",
    )}
>
    {qrPanel}
</div>
```

- [ ] **Step 4: Switch the layout breakpoint from `lg:` to `lg:landscape:`**

Change every `lg:` prefix that drives the split (leave any other `lg:` untouched — there are none else on this page):

- Tabs: `className="lg:hidden"` → `className="lg:landscape:hidden"`
- Grid: `... gap-4 lg:grid-cols-[1fr_auto]` → `... gap-4 lg:landscape:grid-cols-[1fr_auto]`
- Queue panel div: `"min-h-0 flex-col pb-28 md:pb-0 lg:order-1 lg:flex"` → `"min-h-0 flex-col pb-28 md:pb-0 lg:landscape:order-1 lg:landscape:flex"`
- QR panel div: `lg:order-2 lg:flex` → `lg:landscape:order-2 lg:landscape:flex` (done in Step 3).

- [ ] **Step 5: Typecheck + lint**

Run: `npm run typecheck && npm run lint`
Expected: PASS. If `useMediaQuery` is now an unused import, remove it (lint will flag it).

- [ ] **Step 6: Verify in the browser at the four reference sizes**

Run `npm run dev`, open the dashboard with the queue **open**, use devtools device toolbar. For each size confirm the expected result:

| Size (W×H) | Orientation | Expected |
|---|---|---|
| 375 × 667 | portrait | Tabs shown. File tab: only the list scrolls. QR tab: card fits or scrolls internally; no page scroll. |
| 768 × 1024 | portrait | Tabs shown (not side-by-side). |
| 1024 × 768 | landscape | Side-by-side. List scrolls if long; **QR card does not scroll**; no page scroll. |
| 1440 × 900 | landscape | Side-by-side; QR fills nicely; no scroll except a long list. |

If the QR card scrolls or overflows at 1024×768, increase `QR_CARD_CHROME_PX` in `lib/utils/qr-size.ts` by ~10–20 and reload; if the QR looks too small on desktop, decrease it. Re-run the Task 1 test after any change (`npm run test:unit -- qr-size`) — update the test's chrome-dependent expectations if you changed the constant.

- [ ] **Step 7: Commit**

```bash
git add app/(dashboard)/dashboard/QueueSection.tsx lib/utils/qr-size.ts lib/utils/__tests__/qr-size.test.ts
git commit -m "feat(responsive): orientation-based split + container-measured QR on queue page"
```

---

## Part 3 — Audit-and-fix pass (usable and it fits)

Tasks 4–8 are independent "analyse et réglage" passes. Each follows the same
loop; no shared state beyond the Part 1 convention (which only the queue page
uses). Order matches the approved priority: customer pages first (highest
mobile traffic), then dashboard secondary pages, then onboarding/landing/auth.

**The audit loop (applies to every Task 4–8 page):**
1. `npm run dev`; open the page in devtools device toolbar.
2. At **375 × 667** then **768 × 1024**, check and fix:
   - No horizontal scroll / no element wider than the viewport.
   - Touch targets (buttons, links, inputs) ≥ 40px tall.
   - No text clipped or overflowing; no essential content truncated.
   - Cards/forms don't cramp; multi-column blocks collapse to one column when narrow (use existing `grid-cols-1 sm:grid-cols-2` etc. patterns already in the codebase).
   - Fixed/sticky bars don't cover content (respect `env(safe-area-inset-*)` as the dashboard header already does).
3. Apply fixes with Tailwind utilities following existing patterns in neighboring files. No redesign.
4. Re-verify both sizes. `npm run lint && npm run typecheck`. Commit.

Record the concrete issues found and the fix applied in each commit message.

---

### Task 4: Customer join + recover pages

**Files:**
- Modify (as needed): `app/[slug]/join/JoinClient.tsx`, `app/[slug]/retrouver/RecoverClient.tsx`, `app/[slug]/retrouver/page.tsx`, `app/retrouver/RetrouverClient.tsx`

- [ ] **Step 1:** Run the audit loop on `/[slug]/join` at 375×667 and 768×1024.
- [ ] **Step 2:** Run the audit loop on `/[slug]/retrouver` and `/retrouver`.
- [ ] **Step 3:** `npm run lint && npm run typecheck` → PASS.
- [ ] **Step 4: Commit**

```bash
git add app/\[slug\]/join app/\[slug\]/retrouver app/retrouver
git commit -m "fix(responsive): join + recover pages fit at 375 and 768"
```

---

### Task 5: Customer wait page + games

**Files:**
- Modify (as needed): `app/[slug]/wait/[ticketId]/WaitClient.tsx`, `app/[slug]/wait/[ticketId]/games/layout.tsx`, `app/[slug]/wait/[ticketId]/games/page.tsx`, and the individual games under `app/[slug]/wait/[ticketId]/games/*/page.tsx`

- [ ] **Step 1:** Audit loop on `/[slug]/wait/[ticketId]` at both sizes (this is the highest-traffic mobile screen — check the status card, countdown, and any action buttons especially).
- [ ] **Step 2:** Audit loop on the games hub and each game. Games are interactive canvases/boards — confirm the board fits within 375px width without horizontal scroll and controls stay reachable; games may keep their own internal scroll/scaling.
- [ ] **Step 3:** `npm run lint && npm run typecheck` → PASS.
- [ ] **Step 4: Commit**

```bash
git add app/\[slug\]/wait
git commit -m "fix(responsive): wait page + games fit at 375 and 768"
```

---

### Task 6: Dashboard secondary pages (analytics, settings)

**Files:**
- Modify (as needed): `app/(dashboard)/analytics/page.tsx`, `app/(dashboard)/dashboard/settings/page.tsx` (and any section components they render)

Note: these live inside the dashboard shell (`app/(dashboard)/layout.tsx`), whose `<main>` already provides internal vertical scroll capped at `max-w-6xl` — so normal vertical scroll is expected and allowed here (not the queue page's strict rules).

- [ ] **Step 1:** Audit loop on `/analytics` at both sizes — charts/tables must not overflow horizontally; wide tables should scroll inside their own container, not the page.
- [ ] **Step 2:** Audit loop on `/dashboard/settings` at both sizes — form fields, color/font pickers, and preview must stack cleanly.
- [ ] **Step 3:** `npm run lint && npm run typecheck` → PASS.
- [ ] **Step 4: Commit**

```bash
git add app/\(dashboard\)/analytics app/\(dashboard\)/dashboard/settings
git commit -m "fix(responsive): analytics + settings fit at 375 and 768"
```

---

### Task 7: Onboarding

**Files:**
- Modify (as needed): `app/onboarding/OnboardingClient.tsx`, `app/onboarding/page.tsx`

- [ ] **Step 1:** Audit loop on `/onboarding` at both sizes — multi-step form, any live brand preview, and step navigation must fit and stay usable.
- [ ] **Step 2:** `npm run lint && npm run typecheck` → PASS.
- [ ] **Step 3: Commit**

```bash
git add app/onboarding
git commit -m "fix(responsive): onboarding fits at 375 and 768"
```

---

### Task 8: Landing + auth pages

**Files:**
- Modify (as needed): `app/page.tsx`, `app/(auth)/login/page.tsx`, `app/(auth)/register/page.tsx`, `app/(auth)/forgot-password/page.tsx`, `app/(auth)/reset-password/page.tsx`, `app/(auth)/layout.tsx`

- [ ] **Step 1:** Audit loop on the landing page `/` at both sizes — hero, sections, nav/footer; watch for fixed-width blocks and large headings overflowing at 375px.
- [ ] **Step 2:** Audit loop on each auth page (`/login`, `/register`, `/forgot-password`, `/reset-password`) at both sizes — cards centered, inputs full-width, no overflow.
- [ ] **Step 3:** `npm run lint && npm run typecheck` → PASS.
- [ ] **Step 4: Commit**

```bash
git add app/page.tsx app/\(auth\)
git commit -m "fix(responsive): landing + auth pages fit at 375 and 768"
```

---

## Final verification

- [ ] `npm run ci:app` (contract + lint + typecheck + unit tests + build) → PASS.
- [ ] Re-walk the queue page at the four reference sizes from Task 3, Step 6 — confirm the strict scroll rules still hold.
- [ ] Spot-check one page from each of Tasks 4–8 at 375×667 for horizontal overflow.

## Self-review notes (coverage vs spec)

- Spec Part 1 (orientation convention) → Task 3 Step 4 (`lg:landscape:`) + Global Constraints.
- Spec Part 2 (strict queue rules, container-measured QR) → Tasks 1, 2, 3.
- Spec Part 3 (audit-and-fix all other pages) → Tasks 4–8, one page-group each, both min sizes.
