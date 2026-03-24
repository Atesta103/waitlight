# 17. Paywall Bypass (Trial & Early Access Logic)

## 1. Metadata

- Feature: Paywall Bypass
- Owner: Founding Team
- Status: `implemented`
- Last updated: 2026-03-24
- Value to user: 4
- Strategic priority: 5
- Time to code: 2
- Readiness score: 0/100

## Business Value
Enables beta users, early adopters, or special clients to bypass the Stripe billing/subscription paywall without requiring a valid credit card.

## Definition of Done
- [x] Add `is_lifetime_free` or `bypass_paywall` boolean to the `merchants` or `subscriptions` table.
- [x] The `SubscriptionCheck` middleware component/logic in `app/(dashboard)/layout.tsx` allows access if this flag is true.
- [x] Supabase Admin UI or a hidden admin route allows setting this flag.
- [x] Stripe Webhook gracefully handles accounts with this flag (prevents overriding to cancelled).

## Technical Details
### Database
```sql
ALTER TABLE merchants ADD COLUMN bypass_paywall BOOLEAN DEFAULT FALSE;
```

### Access Control (SubscriptionStatus hook)
Modify `lib/subscription-status.ts` to check `merchant.bypass_paywall`. If true, force return a "valid" state equivalent to an active subscription with no limits.

### Security
This field should NOT be editable by the merchant (enforced by RLS), and should only be modifiable by a Postgres `service_role` admin or directly in Supabase Studio.
- [x] Implementation merged to main
- [x] Relevant unit and integration tests added and passing
- [x] End-user or internal documentation updated
- [x] `.env.example` updated (if needed)
- [x] Dashboard layout and behavior visually validated

### Integration
Ensure the usage tracking mechanisms (like Analytics and ticket limits) do not accidentally freeze the account if the bypass flag is true.
