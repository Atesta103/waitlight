# Feature 13: Billing & Stripe (Subscription Paywall)

* **Type**: Monetisation (Core)
* **Dependencies**: [Feature 01: Auth](./01_merchant_auth.md), [Feature 02: Settings](./02_merchant_settings.md)
* **Status**: ✅ Implemented (2026-03-06)

**Description**: Every merchant must hold an active paid subscription to use the SaaS. After completing onboarding, the merchant is immediately redirected to a pricing/checkout page. If the payment fails or the subscription lapses, all dashboard routes become inaccessible and the merchant is redirected to `/subscribe`. An internal admin page (`/admin`) lets the Wait-Light team view all clients, subscription statuses, payments, and invoices without exposing sensitive data to merchant accounts.

---

## User Flows

### A — New merchant (happy path)

```
/register → email confirmed → /onboarding → (onboarding complete)
    → redirect to /subscribe
    → Stripe Checkout (14-day free trial, card required)
    → Stripe redirects to /billing-success?session_id=…
    → /billing-success upserts subscription row → redirect to /dashboard
```

### B — Payment declined at checkout

```
/subscribe → Stripe Checkout → card declined
    → Stripe redirects to /subscribe?error=payment_failed
    → Banner shown: "Votre paiement a échoué. Réessayez ou utilisez une autre carte."
    → Merchant cannot access /dashboard
```

### C — Subscription lapses (webhook or renewal failure)

```
Stripe fires `invoice.payment_failed` or `customer.subscription.deleted`
    → Webhook handler upserts subscription.status = 'past_due' | 'canceled'
    → Next dashboard request → layout.tsx subscription check → redirect /subscribe
    → Merchant sees: "Votre abonnement est inactif. Veuillez mettre à jour votre paiement."
```

### D — Merchant manages billing (Customer Portal)

```
/dashboard/settings → "Gérer l'abonnement" button
    → createPortalSessionAction → Stripe Billing Portal URL
    → Merchant updates card / cancels / views invoices
    → Returns to /dashboard/settings
```

### E — Admin views clients

```
/admin → ADMIN_EMAILS guard (server-side) → AdminDashboard
    → Tabs: Clients | Paiements | Factures
    → Data: all merchants from Supabase + Stripe charges + Stripe invoices
```

---

## Integration Sub-tasks

### Database (Supabase)

- [ ] Create `subscriptions` table — migration `supabase/migrations/20260306000001_billing.sql`:

  ```sql
  CREATE TABLE public.subscriptions (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id          UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    stripe_customer_id   TEXT NOT NULL,
    stripe_subscription_id TEXT,
    stripe_price_id      TEXT,
    status               TEXT NOT NULL DEFAULT 'incomplete',
    -- active | trialing | past_due | canceled | incomplete | incomplete_expired | unpaid
    trial_end            TIMESTAMPTZ,
    current_period_end   TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- Only one subscription row per merchant
  CREATE UNIQUE INDEX subscriptions_merchant_id_key ON public.subscriptions(merchant_id);

  -- RLS: merchant can only read their own row; writes are service_role only
  ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "merchant_read_own_subscription"
    ON public.subscriptions FOR SELECT
    USING (auth.uid() = merchant_id);

  -- No INSERT / UPDATE / DELETE policy for authenticated role.
  -- All writes go through the service_role admin client (webhook + billing-success page).

  -- Auto-update updated_at
  CREATE TRIGGER set_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);
  ```

- [ ] Add `subscriptions` type to `types/database.ts`.

### Stripe Setup

- [ ] Create product + price in Stripe dashboard (monthly recurring, e.g. €29/month).
- [ ] Enable 14-day free trial on the price (or pass `trial_period_days: 14` in Checkout params).
- [ ] Configure Stripe webhook endpoint: `POST /api/webhooks/stripe` → select events below.
- [ ] Save webhook signing secret as `STRIPE_WEBHOOK_SECRET` in `.env.local`.

**Required webhook events:**

| Event | Action |
|---|---|
| `checkout.session.completed` | Upsert subscription row with `stripe_customer_id`, `stripe_subscription_id`, `status` |
| `customer.subscription.updated` | Update `status`, `current_period_end`, `cancel_at_period_end` |
| `customer.subscription.deleted` | Set `status = 'canceled'` |
| `invoice.payment_succeeded` | Update `status = 'active'`, refresh `current_period_end` |
| `invoice.payment_failed` | Set `status = 'past_due'` |

### Server-side Stripe Client (`lib/stripe.ts`)

```ts
import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set")
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-01-27.acacia",
})

export const ACTIVE_STATUSES = ["active", "trialing"] as const
export type ActiveStatus = (typeof ACTIVE_STATUSES)[number]

export const STATUS_LABELS: Record<string, string> = {
  active: "Actif",
  trialing: "Période d'essai",
  past_due: "Paiement en retard",
  canceled: "Annulé",
  incomplete: "Incomplet",
  incomplete_expired: "Expiré",
  unpaid: "Impayé",
}
```

> `lib/stripe.ts` is **server-only**. Never import it in a Client Component or expose it via a `NEXT_PUBLIC_` variable.

### Admin Supabase Client (`lib/supabase/admin.ts`)

```ts
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

// service_role bypasses RLS — only used server-side in webhook + admin pages
export const adminSupabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)
```

### Server Actions (`lib/actions/billing.ts`)

#### `getSubscriptionAction()`

- Server Action (no input).
- Uses `createClient()` (server) to call `supabase.from("subscriptions").select(…).eq("merchant_id", user.id).maybeSingle()`.
- Returns `{ data: Subscription | null } | { error: string }`.

#### `createCheckoutSessionAction()`

- Validates: user must be authenticated + no existing active subscription.
- Creates or retrieves a Stripe Customer (store `stripe_customer_id` on the subscription row via `adminSupabase`).
- Creates a Stripe Checkout Session:
  ```ts
  stripe.checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId,
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    subscription_data: { trial_period_days: 14 },
    success_url: `${origin}/billing-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/subscribe?error=cancelled`,
    allow_promotion_codes: true,
    metadata: { merchant_id: user.id },
  })
  ```
- Returns `{ data: { url: string } } | { error: string }`.
- **Never** redirect inside the Server Action — return the URL and let the client redirect.

#### `createPortalSessionAction()`

- Requires active subscription with a `stripe_customer_id`.
- Creates a Stripe Billing Portal session:
  ```ts
  stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${origin}/dashboard/settings`,
  })
  ```
- Returns `{ data: { url: string } } | { error: string }`.

### Webhook Route (`app/api/webhooks/stripe/route.ts`)

```ts
// POST /api/webhooks/stripe
// Stripe sends raw body — must disable Next.js body parsing.
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get("stripe-signature")!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return new Response("Webhook signature verification failed", { status: 400 })
  }

  // Handle each event type — always return 200 quickly to avoid Stripe retries.
  // Write to DB via adminSupabase (service_role, bypasses RLS).
  switch (event.type) {
    case "checkout.session.completed": …
    case "customer.subscription.updated": …
    case "customer.subscription.deleted": …
    case "invoice.payment_succeeded": …
    case "invoice.payment_failed": …
  }

  return new Response(null, { status: 200 })
}
```

**Idempotency**: every upsert uses `.upsert(…, { onConflict: "merchant_id" })` so replayed webhooks are safe.

### Subscription Gate — `app/(dashboard)/layout.tsx`

After the merchant check, add a subscription check **before** rendering children:

```ts
const { data: subscription } = await supabase
  .from("subscriptions")
  .select("status")
  .eq("merchant_id", user.id)
  .maybeSingle()

const isActive =
  subscription?.status === "active" || subscription?.status === "trialing"

if (!isActive) {
  redirect("/subscribe")
}
```

This is the **only authoritative gate** — it runs server-side on every dashboard request.

### `/subscribe` Page (`app/subscribe/`)

- **`page.tsx`** (Server Component): reads `?error` query param; fetches existing subscription to show current status if past_due.
- **`SubscribeClient.tsx`** (Client Component):
  - Displays pricing card (price, features list, trial badge).
  - CTA button "Commencer l'essai gratuit de 14 jours" → calls `createCheckoutSessionAction()` → redirects to returned URL.
  - If `?error=cancelled`: info banner "Vous avez annulé le paiement. Votre essai gratuit vous attend."
  - If `?error=payment_failed`: error banner "Votre paiement a échoué. Réessayez avec une autre carte."
  - If subscription `status = 'past_due'`: warning banner "Votre paiement a échoué. Mettez à jour votre mode de paiement pour réactiver l'accès." + portal button.
  - Uses design tokens: `brand-primary` for CTA, `feedback-error` for error banner, `surface-card` for pricing card.

### `/billing-success` Page (`app/billing-success/page.tsx`)

- Server Component.
- Reads `?session_id` from query.
- Fetches Checkout Session from Stripe API (server-side).
- Upserts subscription row via `adminSupabase` (does not wait for webhook — avoids race condition):
  ```ts
  await adminSupabase.from("subscriptions").upsert({
    merchant_id: session.metadata!.merchant_id,
    stripe_customer_id: session.customer as string,
    stripe_subscription_id: session.subscription as string,
    status: subscriptionObject.status,
    trial_end: …,
    current_period_end: …,
  }, { onConflict: "merchant_id" })
  ```
- Redirects to `/dashboard` on success.
- Shows error page if `session_id` is missing or Stripe fetch fails.

### Proxy — `proxy.ts`

Add `/subscribe` and `/billing-success` to protected routes (require auth), and whitelist the webhook:

```ts
const isProtectedPage =
  pathname.startsWith("/dashboard") ||
  pathname.startsWith("/onboarding") ||
  pathname.startsWith("/subscribe") ||
  pathname.startsWith("/billing-success")

// Webhook must never be redirected — add to exclusion list
// Already excluded by the matcher pattern if needed, but explicit is safer:
const isWebhook = pathname.startsWith("/api/webhooks/stripe")
if (isWebhook) return supabaseResponse
```

### Admin Page (`app/admin/`)

**Access control (server-side only):**

```ts
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "").split(",").map(e => e.trim())

const { data: { user } } = await supabase.auth.getUser()
if (!user || !ADMIN_EMAILS.includes(user.email!)) {
  redirect("/dashboard")
}
```

**`app/admin/layout.tsx`** — ADMIN_EMAILS guard, no nav chrome.

**`app/admin/page.tsx`** (Server Component):
- Fetches all merchants + subscriptions from Supabase via `adminSupabase`.
- Fetches recent charges from Stripe: `stripe.charges.list({ limit: 100 })`.
- Fetches recent invoices from Stripe: `stripe.invoices.list({ limit: 100 })`.
- Passes as `initialData` to `AdminDashboard`.

**`components/sections/AdminDashboard.tsx`** (Client Organism):
- Three tabs: **Clients** | **Paiements** | **Factures**.
- **Clients tab**: table of all merchants — name, email, subscription status badge, trial end, current period end, MRR contribution.
- **Paiements tab**: list of Stripe charges — amount, currency, status, merchant name, date.
- **Factures tab**: list of Stripe invoices — invoice number, amount_due, status, hosted_invoice_url (PDF link), merchant name, period.
- Status badges use design tokens: `feedback-success` for active, `status-called` for trialing, `feedback-error` for past_due/canceled.

---

## Edge Cases

| Scenario | Handling |
|---|---|
| Webhook arrives before `/billing-success` redirect | `/billing-success` upserts with `onConflict` — idempotent, last-write-wins on non-conflicting fields |
| `/billing-success` called with invalid/expired `session_id` | Stripe throws → catch → render error page with "Retourner à l'abonnement" link |
| Merchant deletes account while subscribed | `ON DELETE CASCADE` on `subscriptions.merchant_id` cleans up DB; Stripe subscription must be cancelled via webhook or admin action |
| Trial ends, no payment method on file | Stripe fires `customer.subscription.deleted` → webhook sets `status = 'canceled'` → gate kicks in |
| Stripe webhook delivery failure (Stripe retries up to 3 days) | All handlers are idempotent (upsert); duplicate events are safe |
| Admin email list is empty | `ADMIN_EMAILS` defaults to `""` → `split(",")` yields `[""]` → no one matches → all redirected (safe default) |
| Merchant already has active subscription and revisits `/subscribe` | Server Component detects `isActive = true` → redirects to `/dashboard` immediately |
| Subscription `incomplete` (checkout started, not completed) | Gate treats it as inactive → merchant redirected to `/subscribe`; Stripe auto-expires incomplete subscriptions after 23h |
| Card dispute / chargeback | Stripe fires `charge.dispute.created` → optional: set `status = 'past_due'` + notify admin; gate handles access revocation |
| Network error calling Stripe in Server Action | Catch → `return { error: "Impossible de contacter le serveur de paiement. Réessayez." }` |

---

## Security Rules

- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAILS` are **server-only** — never `NEXT_PUBLIC_`.
- Webhook handler always calls `stripe.webhooks.constructEvent` before any DB write — no forged events accepted.
- `adminSupabase` is only imported in server files (`lib/supabase/admin.ts`, webhook route, `/billing-success` page, `/admin` page) — never in Client Components.
- The subscription gate is enforced in the Server Component layout — it cannot be bypassed client-side.
- Admin page access is checked server-side against `ADMIN_EMAILS` — not a client-side guard.
- Stripe Customer ID stored in DB is used to look up payment history — the Stripe Secret Key is never sent to the browser.

---

## New Environment Variables

| Variable | Side | Notes |
|---|---|---|
| `STRIPE_SECRET_KEY` | Server only | Stripe dashboard → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | Server only | Generated when creating the webhook endpoint in Stripe |
| `STRIPE_PRICE_ID` | Server only | ID of the monthly recurring price (`price_xxx`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Supabase project → Settings → API → service_role key |
| `ADMIN_EMAILS` | Server only | Comma-separated list, e.g. `admin@waitlight.app,cto@waitlight.app` |

Add all to `.env.example` with empty values and inline documentation comments.

---

## Architecture Notes

- **No client-side subscription check.** The gate is exclusively in `app/(dashboard)/layout.tsx` (Server Component) — always runs server-side before rendering any dashboard page.
- **Webhook is the source of truth for ongoing subscription state.** `/billing-success` only handles the immediate post-checkout race; after that, all state transitions come from Stripe webhooks.
- **`adminSupabase` is the only path to write subscription rows.** The RLS table has no authenticated INSERT/UPDATE policy, making it impossible for a merchant to tamper with their own subscription status.
- **Pricing page is a Server Component** — the Stripe Price ID and amount are never hardcoded in the frontend; they are fetched from Stripe server-side to stay in sync with dashboard changes.
- **Stripe Billing Portal** handles all self-service billing changes (card update, cancellation, invoice download) — we never build custom billing forms.
- The `subscriptions` table intentionally stores a minimal copy of Stripe data (status, period dates) to avoid full Stripe API round-trips on every dashboard render. The webhook keeps it fresh.
