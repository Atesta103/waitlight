# 15. Merchant Branding (Colors, Typography & Border Radius)

## 1. Metadata

- Feature: Merchant Branding
- Owner: Founding Team
- Status: `implemented`
- Last updated: 2026-03-27
- Value to user: 4
- Strategic priority: 4
- Time to code: 2
- Readiness score: 100/100

## Business Value
Allows merchants to customize the color, typography, and border radius of their public-facing queue page (`[slug]/wait/[ticketId]`) and the merchant dashboard slightly, enhancing visual continuity with their brand.

## Definition of Done
- Database schema updated (add `brand_color`, `font_family`, `border_radius` fields to `merchants` table).
- Zod validators updated in `lib/validators/settings.ts` to accept valid hex codes, web-safe predefined fonts, and specific border radius values.
- TRPC / Server Actions updated to save and fetch the brand preferences.
- CSS Variables dynamically injected into the Next.js `[slug]` layout to apply the correct color, `--font-brand`, and `--radius-brand`.
- Settings UI updated with a color picker component, a typography selector (with limited web-optimized choice like Inter, Roboto, Open Sans), and a border radius selector (none, small, medium, full).

## Technical Details
### Database
```sql
ALTER TABLE merchants ADD COLUMN brand_color TEXT DEFAULT '#4F46E5'; -- Default Waitlight brand color
ALTER TABLE merchants ADD COLUMN font_family TEXT DEFAULT 'Inter'; -- Restricted e.g. 'Inter', 'Roboto', 'Playfair Display'
ALTER TABLE merchants ADD COLUMN border_radius TEXT DEFAULT '0.5rem'; -- Restricted e.g. '0px', '0.25rem', '0.5rem', '9999px'
```

### Injection Strategy
In `app/[slug]/layout.tsx` (for the customer view) and potentially dashboard, read branding settings (`brand_color`, `font_family`, `border_radius`) from DB and set them as inline CSS variables:
`--color-brand-primary: ${color}`
`--font-brand: ${font_family}`
`--radius-brand: ${border_radius}`

Given we use Tailwind CSS, our `tailwind.config.ts` or `globals.css` must map these CSS variables to Tailwind classes instead of hardcoded values. Wait-Light provides only web-optimized typography to avoid performance degradation.

### Constraints
- Typography choices must be explicitly limited by the platform (e.g. 5-10 pre-selected, web-safe, Next.js optimized Google fonts using `next/font/google`). Custom font uploads are not allowed.
- Border radius must be limited to a set of predefined scales (e.g. 0px, 4px, 8px, 12px, 16px, or full/9999px) rather than arbitrary pixel values to maintain UI consistency.
- Ensure proper contrast (e.g. use a library like `polished` or `colord` to compute text color based on background luminance, ensuring readability for visually impaired users).
- Default to current brand hue/font if not provided.
