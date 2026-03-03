# Wait-Light — Agent Engineering Rules

> **READ THIS ENTIRE FILE BEFORE WRITING A SINGLE LINE OF CODE.**
> Applies to every AI agent: GitHub Copilot, Claude, Gemini, ChatGPT, Cursor, and any future model.
> Sub-documents in `doc/` extend these rules — never contradict them.

---

## 0. Project Context

Wait-Light is a SaaS virtual queue app ("Scan & Go"). Two user surfaces:

- **Merchant** (authenticated) — manages the queue from `/dashboard`
- **Customer** (anonymous) — joins via QR Code, tracks position on `/[slug]/wait/[ticketId]`

Stack: **Next.js 15 App Router · Supabase (Postgres + Realtime + Auth + Edge Functions) · TanStack Query · Framer Motion · Tailwind CSS · TypeScript strict**

Full specs → [`Spec.md`](./Spec.md) · User flows → [`FLOWS.md`](./FLOWS.md)

---

## 1. Operational Rules

### 1.1 Before any task

- Re-read the relevant section of `Spec.md` and `FLOWS.md` before touching related code.
- Check `doc/architecture.md` for the file or pattern you are about to create.
- Check `doc/security.md` before any DB access, API route, or auth logic.
- If a requirement is ambiguous, **stop and ask** — never guess on security or data model.

### 1.2 Scope discipline

- **One task = one concern.** Never mix a bug fix with a refactor with a feature in the same edit.
- Never rename, move, or refactor a file unless that is the explicit task.
- Never add a dependency without stating its purpose and bundle-size impact.

### 1.3 Communication

- When completing a task, state **what changed**, **why**, and **what to verify manually**.
- When you cannot complete a task safely, explain the blocker clearly instead of producing broken code.

### 1.4 Living documentation in `doc/`

The `doc/` folder is the **single source of truth** for architecture decisions, patterns, and constraints. Keep it up to date as the project evolves.

**Create a new `doc/*.md` file when:**

- A new architectural pattern is established (e.g. a new data-fetching strategy, a new third-party integration).
- A non-obvious technical decision is made that future agents need to understand.
- A feature introduces constraints that affect multiple parts of the codebase (e.g. a new rate-limiting rule, a new RLS policy pattern).
- A recurring bug is solved in a way that must not be undone.

**Update an existing `doc/*.md` file when:**

- A feature changes the behaviour described in that file.
- A previously documented pattern is replaced or deprecated.
- A new edge case or constraint is discovered during implementation.

**`doc/` file rules:**

- One file per concern. Keep files **under 300 lines** — split when they grow beyond that.
- No implementation code in `doc/` files (pseudocode and SQL snippets are fine for illustration).
- File names are `kebab-case.md`.
- Every new `doc/` file must be linked in the **Reference Documents** table at the bottom of this file.

**Do NOT create a `doc/` file for:**

- Changes fully described by updated code comments.
- Trivial bug fixes with no broader implication.
- Temporary workarounds (document those in the **Lessons Learned** section instead).

---

## 2. Coding Standards

### 2.1 TypeScript

- `strict: true` is non-negotiable. No `any`, no `ts-ignore` without a dated comment explaining why.
- Prefer `type` over `interface` unless declaration merging is needed.
- All Supabase query results must be typed via the generated `Database` type (run `supabase gen types typescript`).
- Zod schemas are the single source of truth for all external inputs (forms, API bodies, URL params).

### 2.2 File & folder structure

```
app/
  (auth)/               # Route group — merchant auth pages
  (dashboard)/          # Route group — protected merchant pages
  [slug]/               # Public merchant pages
    page.tsx            # SSR landing
    join/page.tsx
    wait/[ticketId]/page.tsx
  api/                  # Route handlers (thin — delegate to lib/)
components/
  ui/                   # Atoms (Button, Input, Badge…)
  composed/             # Molecules (TicketCard, QueueRow…)
  sections/             # Organisms (QueueList, DashboardHeader…)
lib/
  supabase/             # Client, server, middleware helpers
  hooks/                # TanStack Query hooks (useQueue, useTicket…)
  actions/              # Server Actions (createTicket, callNext…)
  validators/           # Zod schemas
  utils/                # Pure functions (no side effects)
types/                  # Shared TypeScript types & Supabase DB types
```

- One component per file. Filename = PascalCase component name.
- Hooks files: `use[Name].ts` in `lib/hooks/`.
- No barrel `index.ts` files — import directly from the source file.

### 2.3 React & Next.js

- Default to **Server Components**. Add `"use client"` only when the component needs state, effects, or browser APIs.
- Never `fetch()` in a Client Component — use a Server Component parent or a TanStack Query hook.
- No `useEffect` for data fetching. Ever.
- Route handlers in `app/api/` must validate input with Zod before any DB call.
- Server Actions are preferred over Route Handlers for form mutations.

### 2.4 Supabase

- **Never use the `service_role` key on the client.** Only in Server Actions / Edge Functions.
- Always use filtered Realtime channels — see `doc/architecture.md`.
- All positions are computed via the `get_position` RPC — never via a client-side `SELECT COUNT(*)`.
- On error, surface a typed error message — never log raw Supabase error objects to the browser console.

### 2.5 Styling

- Tailwind only. No inline `style={{}}` props except for dynamic values that cannot be expressed as utilities (e.g. CSS custom properties for animations).
- Use `cn()` (from `lib/utils.ts`, wrapping `clsx` + `tailwind-merge`) for conditional class composition.
- Follow the design system token names defined in `doc/design-system.md`. Never hardcode color hex values.
- Framer Motion only for meaningful state transitions (queue position change, ticket status change). Not for decorative micro-animations.

### 2.6 Testing

- Every Zod validator must have a unit test covering at least one valid case and two invalid edge cases.
- Every Server Action that writes to the DB must have an integration test.
- E2E tests (Playwright) cover the 4 happy-path flows defined in `FLOWS.md`.

---

## 3. Memory & Lessons Learned

> This section is **append-only**. Add an entry when a non-obvious decision is made or a bug pattern is encountered.
> Format: `[YYYY-MM-DD] — Category — Description`
> Keep each entry to 2–3 lines maximum.

### Patterns

_(empty — populate as the project progresses)_

### Bugs & pitfalls

_(empty — populate as the project progresses)_

### Decisions

_(empty — populate as the project progresses)_

---

## 4. Reference Documents

| Document                                                                   | Purpose                                                              |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| [`Spec.md`](./Spec.md)                                                     | Full product specification, data model, RLS, SQL                     |
| [`FLOWS.md`](./FLOWS.md)                                                   | All 4 user flows in detail                                           |
| [`Jusification.md`](./Jusification.md)                                     | Technical choices rationale                                          |
| [`doc/design-system.md`](./doc/design-system.md)                           | Design tokens, atoms/molecules/organisms                             |
| [`doc/architecture.md`](./doc/architecture.md)                             | Next.js & Supabase patterns to follow                                |
| [`doc/security.md`](./doc/security.md)                                     | Security checklist for every layer                                   |
| [`doc/accessibility.md`](./doc/accessibility.md)                           | WCAG 2.1 AA rules, i18n, motion, screen readers                      |
| [`doc/features/11_i18n_next_intl.md`](./doc/features/11_i18n_next_intl.md) | i18n task: next-intl setup, component translation, language switcher |
