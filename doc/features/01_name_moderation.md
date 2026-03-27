# 16. Name Moderation (Profanity Filter)

## 1. Metadata

- Feature: Name Moderation
- Owner: Founding Team
- Status: `proposed`
- Last updated: 2026-03-24
- Value to user: 4
- Strategic priority: 5
- Time to code: 2
- Readiness score: 0/100

## Business Value
Some customers joining via QR enter offensive names, which may appear on the public dashboard or merchant screen. This feature automatically sanitizes input before creating a ticket.

## Definition of Done
- Install a lightweight profanity filter library (e.g., `bad-words` + French dictionary, or `leo-profanity`).
- `createTicket` Server Action intercepts names and applies masking (e.g. `f***`) or blocks submission entirely based on settings.
- E2E or Unit test verifies a profane name is correctly moderated.

## Technical Details
Since Waitlight is in French by default, we need a French profanity dictionary. The `bad-words` npm package allows custom lists.

### Validation Flow
- Use `lib/actions/queue.ts` (specifically `createTicket` action).
- After Zod schema parsing, run the `name` field through the filter.
- Return a validation error (`Nom invalide` or `Veuillez choisir un autre nom`) or silently sanitize (`***`).

### Bundle Size Impact
Server-side only dependency, so zero impact on client bundle size.

### Future Scope
Allow merchants to toggle strict blocking vs. silent masking in their Settings panel.
