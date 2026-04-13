# 15. Merchant Color Theme (Branding)

## 1. Metadata

- Feature: Merchant Color Theme
- Owner: Founding Team
- Status: `proposed`
- Last updated: 2026-03-24
- Value to user: 4
- Strategic priority: 4
- Time to code: 2
- Readiness score: 0/100

## Business Value
Allows merchants on pro/premium plans to customize the color of their public-facing queue page (`[slug]/wait/[ticketId]`) and the merchant dashboard slightly, enhancing visual continuity with their brand.

## Definition of Done
- Database schema updated (add `brand_color` string field to `merchants` table).
- Zod validators updated in `lib/validators/settings.ts` to accept valid hex codes.
- TRPC / Server Actions updated to save and fetch the color.
- CSS Variables dynamically injected into the Next.js `[slug]` layout to apply the correct color.
- Settings UI updated with a color picker component (e.g. standard hex input or react-colorful).

## Technical Details
### Database
```sql
ALTER TABLE merchants ADD COLUMN brand_color TEXT DEFAULT '#4F46E5'; -- Default Waitlight brand color
```

### Injection Strategy
In `app/[slug]/layout.tsx` (for the customer view) and potentially dashboard, read `brand_color` from DB and set it as an inline CSS variable (e.g., `--color-brand-primary: ${color}`).
Given we use Tailwind CSS, our `tailwind.config.ts` or `globals.css` must be adapted to use this CSS variable instead of a hardcoded value if it isn't already.

### Constraints
- Ensure proper contrast (e.g. use a library like `polished` or `colord` to compute text color based on background luminance, ensuring readability for visually impaired users).
- Default to current brand hue if not provided.
