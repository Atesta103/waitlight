# Ticket téléchargeable — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a customer waiting in a queue download a PNG ticket (merchant identity, name, position snapshot, arrival time, recovery code, QR code) so they can find their way back to their ticket from any device, not just the browser they joined from.

**Architecture:** A pure-logic utils module (`lib/utils/ticket-download.ts`) backs a presentational `TicketDownloadCard` component (`components/composed/TicketDownloadCard.tsx`), captured to PNG client-side via `html-to-image` from a button on the existing `/wait` page. The QR code encodes a pre-filled link to the existing `/retrouver` recovery form.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind, `qrcode.react` (existing dependency), `html-to-image` (new dependency), Vitest for unit tests.

## Global Constraints

- No price/billing information anywhere on the ticket (explicit spec exclusion).
- No server-side image generation, no email/SMS delivery, no Wallet integration — PNG download only, client-side (spec exclusions).
- The QR code pre-fills `/retrouver` but never auto-submits it — the customer must confirm and click submit themselves.
- French copy throughout, matching the app's existing tone (see `/{slug}/retrouver`, `WaitClient.tsx` recovery-code card for reference phrasing).
- Raw `<button>`/`<input>` tags are forbidden in `app/` (enforced by `scripts/check-app-storybook-contract.mjs`) — always use the design-system `Button`/`Input` components.
- Every new `components/composed/*` component gets a Storybook story, matching existing convention (`MerchantsMap.stories.tsx`, `AddressAutocomplete.stories.tsx`).
- This session's dependency installs need `--legacy-peer-deps` (pre-existing `@storybook/nextjs` vs `next@16` peer conflict in this repo) — use it for the `html-to-image` install.
- Test and verify on the `dev` branch's Vercel Preview deployment, not local `npm run dev` — per the user's explicit request this session, local testing (geolocation, StrictMode double-invoke) has repeatedly cost debugging time this app doesn't need repeated here. Do not merge to `main` until verified on Preview.

---

### Task 1: Ticket download utils — time formatting and recovery URL

**Files:**
- Create: `lib/utils/ticket-download.ts`
- Test: `lib/utils/__tests__/ticket-download.test.ts`

**Interfaces:**
- Produces: `formatArrivalTime(isoString: string): string`, `buildRecoverUrl(params: { baseUrl: string; slug: string; customerName: string; code: string }): string`, `parseRecoverParams(searchParams: URLSearchParams): { name: string; code: string }`, exported constants `RECOVER_NAME_PARAM`, `RECOVER_CODE_PARAM`.

These three functions have no dependency on any other task — build and test them first, in isolation.

- [ ] **Step 1: Write the failing tests**

Create `lib/utils/__tests__/ticket-download.test.ts`:

```ts
import { describe, expect, it } from "vitest"
import {
    buildRecoverUrl,
    formatArrivalTime,
    parseRecoverParams,
} from "@/lib/utils/ticket-download"

describe("formatArrivalTime", () => {
    it("formats an ISO timestamp as HH:MM", () => {
        const iso = new Date(Date.UTC(2026, 6, 24, 14, 32, 0)).toISOString()
        expect(formatArrivalTime(iso)).toMatch(/^\d{2}:\d{2}$/)
    })
})

describe("buildRecoverUrl", () => {
    it("builds a /{slug}/retrouver URL with the name and code as query params", () => {
        const url = buildRecoverUrl({
            baseUrl: "https://waitlight.app",
            slug: "testa-crousty",
            customerName: "Jean-Paul",
            code: "4F2K",
        })
        expect(url).toBe(
            "https://waitlight.app/testa-crousty/retrouver?name=Jean-Paul&code=4F2K",
        )
    })

    it("encodes special characters in the customer name", () => {
        const url = buildRecoverUrl({
            baseUrl: "https://waitlight.app",
            slug: "test",
            customerName: "Anaïs & Léo",
            code: "AB12",
        })
        expect(url).toContain("name=Ana%C3%AFs+%26+L%C3%A9o")
    })
})

describe("parseRecoverParams", () => {
    it("reads name and code from the URL search params", () => {
        const params = new URLSearchParams("name=Jean&code=4F2K")
        expect(parseRecoverParams(params)).toEqual({ name: "Jean", code: "4F2K" })
    })

    it("defaults to empty strings when params are absent", () => {
        expect(parseRecoverParams(new URLSearchParams(""))).toEqual({
            name: "",
            code: "",
        })
    })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run lib/utils/__tests__/ticket-download.test.ts`
Expected: FAIL — `Cannot find module '@/lib/utils/ticket-download'`

- [ ] **Step 3: Write the implementation**

Create `lib/utils/ticket-download.ts`:

```ts
/**
 * @module utils/ticket-download
 * @category Utils
 *
 * Pure helpers for the downloadable queue ticket: formatting the arrival
 * time shown on the ticket, and building/parsing the recovery URL encoded
 * in its QR code. Building and parsing live together so the two query
 * param names can only ever go out of sync in one place.
 */

/** Query param names for the pre-filled /retrouver link. */
export const RECOVER_NAME_PARAM = "name"
export const RECOVER_CODE_PARAM = "code"

/**
 * Formats an ISO timestamp as a short local time, e.g. "14:32". Uses the
 * runtime's local timezone (correct for a client-rendered ticket — the
 * runtime is the customer's own device) and the French locale to match the
 * rest of the app's copy.
 */
export function formatArrivalTime(isoString: string): string {
    return new Intl.DateTimeFormat("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(isoString))
}

/**
 * Builds the /{slug}/retrouver URL pre-filled with the customer's name and
 * recovery code, encoded into the ticket's QR code. Scanning it opens the
 * existing recovery form already filled in — the customer still has to
 * confirm and submit; nothing here auto-submits on their behalf.
 */
export function buildRecoverUrl(params: {
    baseUrl: string
    slug: string
    customerName: string
    code: string
}): string {
    const query = new URLSearchParams({
        [RECOVER_NAME_PARAM]: params.customerName,
        [RECOVER_CODE_PARAM]: params.code,
    })
    return `${params.baseUrl}/${params.slug}/retrouver?${query.toString()}`
}

/**
 * Reads the pre-fill values a scanned ticket QR code may have put in the
 * URL. Missing params come back as empty strings, matching the recovery
 * form's own empty-input default.
 */
export function parseRecoverParams(searchParams: URLSearchParams): {
    name: string
    code: string
} {
    return {
        name: searchParams.get(RECOVER_NAME_PARAM) ?? "",
        code: searchParams.get(RECOVER_CODE_PARAM) ?? "",
    }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run lib/utils/__tests__/ticket-download.test.ts`
Expected: PASS — 5 tests

- [ ] **Step 5: Typecheck and lint**

Run: `npx tsc --noEmit && npx eslint lib/utils/ticket-download.ts lib/utils/__tests__/ticket-download.test.ts`
Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add lib/utils/ticket-download.ts lib/utils/__tests__/ticket-download.test.ts
git commit -m "feat(ticket): add time formatting and recover-URL helpers"
git push origin dev
```

---

### Task 2: Install html-to-image

**Files:**
- Modify: `package.json`, `package-lock.json`

**Interfaces:**
- Produces: the `toPng` export from the `html-to-image` package, used by Task 6.

- [ ] **Step 1: Install**

Run: `npm install html-to-image --legacy-peer-deps`
Expected: `package.json` gains `"html-to-image": "^1.11.13"` (or newer patch) under `dependencies`.

- [ ] **Step 2: Verify the install resolves cleanly**

Run: `node -e "console.log(require('html-to-image/package.json').version)"`
Expected: prints a version string, e.g. `1.11.13`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add html-to-image for client-side ticket export"
git push origin dev
```

---

### Task 3: TicketDownloadCard component

**Files:**
- Create: `components/composed/TicketDownloadCard.tsx`
- Create: `stories/composed/TicketDownloadCard.stories.tsx`

**Interfaces:**
- Consumes: `formatArrivalTime` from `@/lib/utils/ticket-download` (Task 1), `cn` from `@/lib/utils/cn`, `QRCodeCanvas` from `qrcode.react`.
- Produces: `TicketDownloadCard` — a `forwardRef<HTMLDivElement, TicketDownloadCardProps>` component; `type TicketDownloadCardProps` with fields `merchantName: string`, `merchantLogoUrl: string | null`, `merchantBrandColor: string | null`, `customerName: string`, `position: number | null`, `arrivalTimeIso: string`, `recoveryCode: string`, `recoverUrl: string`, `className?: string`. The forwarded ref attaches to the card's root `<div>` — Task 6 uses it as the capture target for `html-to-image`.

No network calls, no internal state — pure presentation, so it's safe to capture identically wherever it's mounted.

- [ ] **Step 1: Write the component**

Create `components/composed/TicketDownloadCard.tsx`:

```tsx
"use client"

import { forwardRef } from "react"
import { QRCodeCanvas } from "qrcode.react"
import { cn } from "@/lib/utils/cn"
import { formatArrivalTime } from "@/lib/utils/ticket-download"

type TicketDownloadCardProps = {
    merchantName: string
    merchantLogoUrl: string | null
    /** Falls back to the app's own brand color when the merchant has none set. */
    merchantBrandColor: string | null
    customerName: string
    /**
     * Live queue position at the moment the ticket was saved — a snapshot,
     * never updated after. Null when unavailable (e.g. the ticket has
     * already been called, when position is no longer meaningful).
     */
    position: number | null
    arrivalTimeIso: string
    recoveryCode: string
    /** Full URL encoded in the QR code — see buildRecoverUrl. */
    recoverUrl: string
    className?: string
}

const DEFAULT_BRAND_COLOR = "#6366f1"

/**
 * The visual captured to PNG when a customer downloads their ticket. Pure
 * presentation — no state, no network calls — so it renders identically
 * whether shown live in a dialog or captured off-screen.
 */
const TicketDownloadCard = forwardRef<HTMLDivElement, TicketDownloadCardProps>(function TicketDownloadCard(
    {
        merchantName,
        merchantLogoUrl,
        merchantBrandColor,
        customerName,
        position,
        arrivalTimeIso,
        recoveryCode,
        recoverUrl,
        className,
    },
    ref,
) {
    const brandColor = merchantBrandColor ?? DEFAULT_BRAND_COLOR

    return (
        <div
            ref={ref}
            className={cn(
                // max-w rather than a fixed width: the ticket must still fit
                // the Dialog's own width on a narrow phone (Dialog caps at
                // calc(100%-2rem), ~288px on a 320px-wide screen) — a hard
                // 340px would overflow there. html-to-image captures whatever
                // size actually rendered, so shrinking here is harmless.
                "flex w-full max-w-[340px] flex-col overflow-hidden rounded-2xl border border-border-default bg-surface-card",
                className,
            )}
        >
            <div
                className="flex items-center gap-3 p-5"
                style={{ backgroundColor: brandColor }}
            >
                {merchantLogoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={merchantLogoUrl}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-lg object-cover"
                    />
                ) : (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/20 text-lg font-bold text-white">
                        {merchantName.trim().charAt(0).toUpperCase() || "?"}
                    </span>
                )}
                <span className="truncate text-lg font-bold text-white">
                    {merchantName}
                </span>
            </div>

            <div className="flex flex-col gap-4 p-5">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 flex-col">
                        <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                            Client
                        </span>
                        <span className="truncate text-base font-bold text-text-primary">
                            {customerName}
                        </span>
                    </div>
                    {position !== null ? (
                        <div className="flex shrink-0 flex-col items-end">
                            <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                                Position
                            </span>
                            <span className="text-base font-bold text-text-primary">
                                #{position}
                            </span>
                        </div>
                    ) : null}
                </div>

                <div className="flex flex-col">
                    <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                        Arrivée
                    </span>
                    <span className="text-base font-bold text-text-primary">
                        {formatArrivalTime(arrivalTimeIso)}
                    </span>
                </div>

                <div className="my-1 border-t border-dashed border-border-default" />

                <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                            Code de suivi
                        </span>
                        <span className="font-mono text-2xl font-bold tracking-[0.25em] text-text-primary">
                            {recoveryCode}
                        </span>
                        <span className="text-[11px] text-text-secondary">
                            Prénom + code sur waitlight.app
                        </span>
                    </div>
                    <QRCodeCanvas value={recoverUrl} size={84} />
                </div>
            </div>
        </div>
    )
})

export { TicketDownloadCard, type TicketDownloadCardProps }
```

- [ ] **Step 2: Write the Storybook story**

This is how the design spec's "render with/without logo" check is satisfied: this
codebase has no `@testing-library/react` and zero `*.test.tsx` files anywhere —
every existing composed component (`MerchantsMap`, `AddressAutocomplete`) is
verified visually via a Storybook story, not a render test. `Default` (no logo)
and `WithLogo` below cover that spec line the same way.

Create `stories/composed/TicketDownloadCard.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react"
import { TicketDownloadCard } from "@/components/composed/TicketDownloadCard"
import { buildRecoverUrl } from "@/lib/utils/ticket-download"

const meta = {
    title: "Composed/TicketDownloadCard",
    component: TicketDownloadCard,
    tags: ["autodocs"],
    parameters: { layout: "centered" },
    args: {
        merchantName: "TESTA CROUSTY",
        merchantLogoUrl: null,
        merchantBrandColor: "#EA580C",
        customerName: "Alex",
        position: 3,
        arrivalTimeIso: new Date().toISOString(),
        recoveryCode: "4F2K",
        recoverUrl: buildRecoverUrl({
            baseUrl: "https://waitlight.app",
            slug: "testa-crousty",
            customerName: "Alex",
            code: "4F2K",
        }),
    },
} satisfies Meta<typeof TicketDownloadCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithLogo: Story = {
    args: {
        merchantLogoUrl: "https://picsum.photos/seed/waitlight/80/80",
    },
}

export const NoPosition: Story = {
    args: { position: null },
}

export const LongNames: Story = {
    args: {
        merchantName: "Boulangerie-Pâtisserie de la Grande Place du Village",
        customerName: "Anne-Charlotte",
    },
}
```

- [ ] **Step 3: Typecheck and lint**

Run: `npx tsc --noEmit && npx eslint components/composed/TicketDownloadCard.tsx`
Expected: no errors

- [ ] **Step 4: Verify the app↔storybook contract check passes**

Run: `node scripts/check-app-storybook-contract.mjs`
Expected: `✅ [contract] App ↔ design system contract OK`

- [ ] **Step 5: Commit**

```bash
git add components/composed/TicketDownloadCard.tsx stories/composed/TicketDownloadCard.stories.tsx
git commit -m "feat(ticket): add TicketDownloadCard presentational component"
git push origin dev
```

---

### Task 4: Pre-fill /retrouver from a scanned ticket QR code

**Files:**
- Modify: `app/[slug]/retrouver/RecoverClient.tsx`

**Interfaces:**
- Consumes: `parseRecoverParams` from `@/lib/utils/ticket-download` (Task 1).

Independent of Tasks 2–3 — only depends on Task 1's pure helper. Reads `window.location.search` in a mount-only effect rather than the `useSearchParams()` hook, which avoids Next.js's Suspense-boundary requirement for that hook and any hydration-mismatch risk from differing server/client initial state.

- [ ] **Step 1: Add the pre-fill effect**

In `app/[slug]/retrouver/RecoverClient.tsx`, update the imports:

```tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { StatusBanner } from "@/components/composed/StatusBanner"
import { findTicketByRecoveryCodeAction } from "@/lib/actions/queue"
import { parseRecoverParams } from "@/lib/utils/ticket-download"
import { Search } from "lucide-react"
```

Then, right after the existing `useState` declarations (`customerName`, `code`, `error`, `isLoading`), add:

```tsx
    // Pre-fill from a scanned ticket QR code (see buildRecoverUrl / TicketDownloadCard).
    // Read directly from window.location rather than useSearchParams(), which
    // avoids that hook's Suspense-boundary requirement and any hydration
    // mismatch from differing server/client initial state — this runs once,
    // client-side only, after the form's normal empty state has mounted.
    useEffect(() => {
        const { name, code: prefillCode } = parseRecoverParams(
            new URLSearchParams(window.location.search),
        )
        if (name) setCustomerName(name)
        if (prefillCode) setCode(prefillCode)
        // Only ever want this once, on mount, to seed from a scanned link.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
```

- [ ] **Step 2: Verify what's tested where**

The design spec's "RecoverClient pre-fill, no auto-submit, unchanged when params
are absent" line splits across two layers, neither of which is a new automated
test here: the *parsing* logic is already covered by Task 1's `parseRecoverParams`
tests (empty-params case included). The *integration* behavior — that scanning a
real ticket QR actually lands on a pre-filled, not-yet-submitted form — can't be
unit-tested without introducing `@testing-library/react`, which doesn't exist
anywhere in this codebase; it's covered by Task 7's manual verification (step 6),
consistent with how this codebase verifies component behavior throughout.

Run: `npx tsc --noEmit && npx eslint app/[slug]/retrouver/RecoverClient.tsx`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add "app/[slug]/retrouver/RecoverClient.tsx"
git commit -m "feat(retrouver): pre-fill name and code from a scanned ticket QR"
git push origin dev
```

---

### Task 5: Fetch merchant logo and brand color for the wait page

**Files:**
- Modify: `app/[slug]/wait/[ticketId]/page.tsx:26-57`
- Modify: `app/[slug]/wait/[ticketId]/WaitClient.tsx:23-42`

**Interfaces:**
- Produces: the `Merchant` type in `WaitClient.tsx` gains `logo_url: string | null` and `brand_color: string | null`, populated from the `merchants` table (columns already exist — no migration needed).

Pure data plumbing — no behavior change yet. Task 6 consumes these two new fields.

- [ ] **Step 1: Add the columns to the server-side select**

In `app/[slug]/wait/[ticketId]/page.tsx`, replace lines 24–57:

```tsx
    const { data } = await supabase
        .from("merchants")
        .select(`
            id, name, slug, background_url, default_prep_time_min, calculated_avg_prep_time,
            business_type, logo_url, brand_color,
            settings!inner(
                notification_channels,
                notification_sound,
                approaching_position_enabled,
                approaching_position_threshold,
                approaching_time_enabled,
                approaching_time_threshold_min,
                thank_you_title,
                thank_you_message
            )
        `)
        .eq("slug", slug)
        .single()

    if (!data) {
        notFound()
    }

    // Pass everything correctly formatted to the client
    const merchant = {
        id: data.id,
        name: data.name,
        slug: data.slug,
        background_url: data.background_url,
        business_type: data.business_type,
        default_prep_time_min: data.default_prep_time_min,
        calculated_avg_prep_time: data.calculated_avg_prep_time,
        logo_url: data.logo_url,
        brand_color: data.brand_color,
        settings: Array.isArray(data.settings) ? data.settings[0] : data.settings
    }
```

- [ ] **Step 2: Add the fields to the client-side Merchant type**

In `app/[slug]/wait/[ticketId]/WaitClient.tsx`, update the `Merchant` type (lines 23-42):

```tsx
type Merchant = {
    id: string
    name: string
    slug: string
    background_url: string | null
    business_type: string
    default_prep_time_min: number
    /** Auto-computed average prep time. null = not enough data, fall back to default. */
    calculated_avg_prep_time: number | null
    logo_url: string | null
    brand_color: string | null
    settings: {
        notification_channels: NotificationChannels
        notification_sound: SoundChoice
        approaching_position_enabled: boolean
        approaching_position_threshold: number
        approaching_time_enabled: boolean
        approaching_time_threshold_min: number
        thank_you_title: string | null
        thank_you_message: string | null
    }
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add "app/[slug]/wait/[ticketId]/page.tsx" "app/[slug]/wait/[ticketId]/WaitClient.tsx"
git commit -m "feat(wait): fetch merchant logo and brand color"
git push origin dev
```

---

### Task 6: Wire the download button into the wait page

**Files:**
- Modify: `app/[slug]/wait/[ticketId]/WaitClient.tsx:1-14` (imports), `:358-390` (JSX)

**Interfaces:**
- Consumes: `TicketDownloadCard` (Task 3), `buildRecoverUrl` (Task 1), `toPng` from `html-to-image` (Task 2), the `Merchant.logo_url`/`Merchant.brand_color` fields (Task 5).

This is the integration task — everything else was built and verified independently. `NEXT_PUBLIC_BASE_URL` is read the same way the existing join-QR code already does in `components/composed/QRCodeDisplay.tsx:45`, for consistency and because it's the SSR-safe way to get the app's own origin (`window.location.origin` would crash during this component's server render pass).

- [ ] **Step 1: Update imports**

In `app/[slug]/wait/[ticketId]/WaitClient.tsx`, replace the import block (lines 1-14):

```tsx
"use client"

import { useEffect, useState, useRef } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { CustomerWaitView } from "@/components/sections/CustomerWaitView"
import { Spinner } from "@/components/ui/Spinner"
import { StatusBanner } from "@/components/composed/StatusBanner"
import { Dialog, DialogHeader, DialogContent, DialogFooter } from "@/components/ui/Dialog"
import { Button } from "@/components/ui/Button"
import { TicketDownloadCard } from "@/components/composed/TicketDownloadCard"
import { type ConnectionState } from "@/components/composed/ConnectionStatus"
import { BellRing, Smartphone, MessageSquare, AlertCircle, Download } from "lucide-react"
import { playHapticBuzz, playSound, unlockAudio, type SoundChoice } from "@/lib/utils/notifications"
import { getBusinessWording } from "@/lib/utils/business-wording"
import { buildRecoverUrl } from "@/lib/utils/ticket-download"
import { toPng } from "html-to-image"
```

- [ ] **Step 2: Add state and the download handler**

Directly after the existing state declarations (after the `alertsInitialized` `useState` block, around line 81), add:

```tsx
    const [ticketDialogOpen, setTicketDialogOpen] = useState(false)
    const [isDownloading, setIsDownloading] = useState(false)
    const [downloadError, setDownloadError] = useState<string | null>(null)
    const ticketCardRef = useRef<HTMLDivElement>(null)

    async function handleDownloadTicket() {
        if (!ticketCardRef.current) return
        setIsDownloading(true)
        setDownloadError(null)
        try {
            const dataUrl = await toPng(ticketCardRef.current, { pixelRatio: 2 })
            const link = document.createElement("a")
            link.href = dataUrl
            link.download = `ticket-${merchant.slug}.png`
            link.click()
        } catch (err) {
            console.error("[WaitClient] Ticket image export failed:", err)
            setDownloadError(
                "Impossible de générer l'image. Notez le code ci-dessus pour retrouver votre place.",
            )
        } finally {
            setIsDownloading(false)
        }
    }
```

- [ ] **Step 3: Derive the shared visibility condition and the recover URL**

Directly before the `return (` statement (around line 358, where `showModerationWarning` is derived), add:

```tsx
    // Same lifecycle as the recovery-code card just below: a ticket can be
    // saved while it's still active, not once it's done or cancelled.
    const canDownloadTicket =
        (ticket.status === "waiting" || ticket.status === "called") && !!ticket.recovery_code

    const recoverUrl = ticket.recovery_code
        ? buildRecoverUrl({
              baseUrl: process.env.NEXT_PUBLIC_BASE_URL ?? "https://waitlight.app",
              slug: merchant.slug,
              customerName: ticket.customer_name,
              code: ticket.recovery_code,
          })
        : ""
```

- [ ] **Step 4: Add the button and dialog to the JSX**

In `app/[slug]/wait/[ticketId]/WaitClient.tsx`, right after the existing recovery-code card block (ends at line 390, just before the `{ticket.status === "called" && !calledReminderAcknowledged && (` block), insert:

```tsx
            {canDownloadTicket && (
                <Button
                    variant="secondary"
                    onClick={() => {
                        setDownloadError(null)
                        setTicketDialogOpen(true)
                    }}
                >
                    <Download size={16} aria-hidden="true" />
                    Enregistrer mon ticket
                </Button>
            )}

            {canDownloadTicket && (
                <Dialog open={ticketDialogOpen} onClose={() => setTicketDialogOpen(false)}>
                    <DialogHeader>Votre ticket</DialogHeader>
                    <DialogContent>
                        <div className="flex flex-col items-center gap-4">
                            <TicketDownloadCard
                                ref={ticketCardRef}
                                merchantName={merchant.name}
                                merchantLogoUrl={merchant.logo_url}
                                merchantBrandColor={merchant.brand_color}
                                customerName={ticket.customer_name}
                                position={ticket.status === "waiting" ? (position ?? null) : null}
                                arrivalTimeIso={ticket.joined_at}
                                recoveryCode={ticket.recovery_code ?? ""}
                                recoverUrl={recoverUrl}
                            />
                            {downloadError ? (
                                <p className="text-sm text-feedback-error" role="alert">
                                    {downloadError}
                                </p>
                            ) : null}
                        </div>
                    </DialogContent>
                    <DialogFooter>
                        <Button onClick={handleDownloadTicket} isLoading={isDownloading}>
                            <Download size={16} aria-hidden="true" />
                            Télécharger l&apos;image
                        </Button>
                    </DialogFooter>
                </Dialog>
            )}
```

- [ ] **Step 5: Typecheck and lint**

Run: `npx tsc --noEmit && npx eslint "app/[slug]/wait/[ticketId]/WaitClient.tsx"`
Expected: no errors

- [ ] **Step 6: Run the full test suite**

Run: `npm run test`
Expected: all tests pass (including the new ones from Task 1), no regressions

- [ ] **Step 7: Verify the app↔storybook and dead-exports checks**

Run: `node scripts/check-app-storybook-contract.mjs && node scripts/check-dead-exports.mjs`
Expected: contract check passes; no new dead exports reported

- [ ] **Step 8: Commit**

```bash
git add "app/[slug]/wait/[ticketId]/WaitClient.tsx"
git commit -m "feat(wait): add downloadable ticket button and dialog"
git push origin dev
```

---

### Task 7: Verify on the dev Preview deployment

**Files:** none — manual verification only.

This task has no automated test; it is the actual product verification the earlier tasks' unit tests can't reach (rendering, image export, QR scan). Per this session's constraint, do this on the `dev` branch's Vercel Preview URL, not local `npm run dev`.

- [ ] **Step 1: Get the Preview URL**

After Task 6's push, run:

```bash
gh pr checks <dev-branch-PR-number> 2>&1 | grep -i vercel
```

Or, if no PR is open yet against `main`, find the latest Preview deployment for the `dev` branch:

```bash
gh api repos/Atesta103/waitlight/deployments --jq '.[] | select(.environment=="Preview") | "\(.id) \(.created_at)"' | head -1
```

then fetch its URL via the deployment's statuses API, or simply check the Vercel dashboard for the `dev` branch's latest deployment.

- [ ] **Step 2: Walk the flow end to end**

On the Preview URL, as a customer:
1. Scan/open a merchant's join QR (or navigate directly to `/{slug}/join`) and join the queue.
2. On `/{slug}/wait/{ticketId}`, confirm the **Enregistrer mon ticket** button appears below the recovery-code card.
3. Click it — confirm the dialog opens showing the ticket: merchant name/logo/brand color, customer name, position, arrival time, recovery code, QR code.
4. Click **Télécharger l'image** — confirm a PNG downloads (check the browser's downloads).
5. Open the downloaded PNG — confirm it visually matches the dialog preview, with all fields legible.
6. Scan the ticket's QR code with a phone camera (or another device) — confirm it opens `/{slug}/retrouver` with the name and code fields **pre-filled but not submitted**.
7. Submit the pre-filled form — confirm it lands back on `/{slug}/wait/{ticketId}`, the same ticket.
8. On a narrow viewport (browser DevTools device toolbar, ~320px wide, or an actual small phone) — confirm the ticket card fits inside the dialog without horizontal overflow.
9. Let the merchant call the ticket (or simulate it) — confirm the **Position** row disappears from a freshly-opened ticket dialog (since `position` is only computed while `status === "waiting"`), and the rest of the ticket still renders correctly.
10. Let the ticket reach `done`/`cancelled` — confirm the **Enregistrer mon ticket** button disappears.

- [ ] **Step 3: Report back**

Note any visual or behavioral issues found. Do not open a PR to `main` until this task's flow is confirmed working.

---

## Post-plan: merging to main

Once Task 7 is confirmed, open a PR from `dev` to `main` following the same pattern used for the `/carte` feature this session (`gh pr create --base main --head dev ...`), summarizing the ticket feature and linking back to this plan and its design doc (`docs/superpowers/specs/2026-07-24-ticket-download-design.md`).
