# GitHub Copilot Instructions — Wait-Light

> This file configures GitHub Copilot's behavior for this workspace.
> Full engineering rules are in [`AGENTS.md`](../AGENTS.md) — read that file first.

## Project

Wait-Light is a Next.js 15 App Router + Supabase SaaS queue management app.
TypeScript strict mode. Tailwind CSS. TanStack Query. Framer Motion.

## Always

- Prefer Server Components. Add `"use client"` only when strictly needed.
- Validate all inputs with Zod before any DB call.
- Use `cn()` (clsx + tailwind-merge) for conditional Tailwind classes.
- Return `{ data } | { error: string }` from all Server Actions — never throw.
- Filter every Supabase Realtime channel by a scoped ID (merchant_id, ticket_id).
- Use the `get_position` RPC for queue position — never `SELECT COUNT(*)` client-side.
- Follow the component hierarchy: `components/ui/` (atoms) → `components/composed/` (molecules) → `components/sections/` (organisms).

## Never

- No `any` or `ts-ignore` without a dated justification comment.
- No `useEffect` for data fetching.
- No `style={{}}` props — use Tailwind utilities or CSS custom properties.
- No hardcoded color hex values — use design token class names from `doc/design-system.md`.
- No `SUPABASE_SERVICE_ROLE_KEY` in client-side code or `NEXT_PUBLIC_` variables.
- No raw Supabase error objects sent to the browser.
- No barrel `index.ts` files.

## File Structure Reference

```
app/(auth)/            → merchant auth pages
app/(dashboard)/       → protected merchant pages
app/[slug]/            → public customer pages
components/ui/         → atoms
components/composed/   → molecules
components/sections/   → organisms
lib/actions/           → Server Actions
lib/hooks/             → TanStack Query hooks
lib/validators/        → Zod schemas
lib/supabase/          → client / server / admin Supabase helpers
```

## Key docs

- Engineering rules: `AGENTS.md`
- Architecture patterns: `doc/architecture.md`
- Design System: `doc/design-system.md`
- Security rules: `doc/security.md`
- User flows: `FLOWS.md`
- Data model & RLS: `Spec.md`
