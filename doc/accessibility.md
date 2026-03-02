# Accessibility & Inclusivity — Wait-Light

> Part of the Wait-Light engineering rules. See [`AGENTS.md`](../AGENTS.md) for the full context.
> **Accessibility is not a bonus feature — it is a baseline requirement.**
> Target: **WCAG 2.1 Level AA** across all pages. Both user surfaces (merchant + customer).

---

## Guiding Principle

Wait-Light serves _any_ customer of _any_ merchant — including people who are blind, deaf, motor-impaired, cognitively challenged, or simply non-native French speakers. A person who cannot use the app cannot join the queue: that is a discriminatory failure, not a UX inconvenience.

---

## Internationalisation (i18n)

### Languages

- **French** is the default and primary language.
- **English** is the first mandatory additional locale.
- The architecture must support adding further locales without code changes.

### Implementation

- Use **`next-intl`** for all user-facing strings. No hardcoded French text in JSX — ever.
- Translation files live in `messages/fr.json` and `messages/en.json`.
- The locale is detected from the browser's `Accept-Language` header on first visit, stored in a cookie, and overridable by the user via a language switcher in the page footer.
- Locale-specific routes: `/fr/[slug]`, `/en/[slug]` — managed by the `next-intl` middleware.
- All Zod validation error messages must also be translated (use `next-intl` inside Server Actions).

### Content rules

- Units and time formats must be locale-aware: use `Intl.DateTimeFormat` and `Intl.RelativeTimeFormat` — never hardcoded `"min"` or `"h"` strings.
- Never use flags as language selectors. Use the language name written in the language itself: `Français`, `English`.

---

## Visual Accessibility

### Colour contrast

- **Text on background**: minimum contrast ratio of **4.5:1** (WCAG AA).
- **Large text (≥ 18pt or ≥ 14pt bold)**: minimum **3:1**.
- **Status indicators** (`status-called`, `status-waiting`, etc.): must **never rely on colour alone** — always pair with an icon or text label.
- Token `status-called` in particular must pass contrast both in light and dark mode.
- Use the [APCA contrast algorithm](https://www.myndex.com/APCA/) as a secondary check for body text.

### Text sizing

- Base font size: **16px minimum** on all body text — never below.
- No fixed `px` font sizes on user-facing text. Use `rem` so the user's browser font-size preference is respected.
- Line height: minimum `1.5` for body text, `1.2` for headings.

### Motion & animations

- All Framer Motion animations must respect `prefers-reduced-motion`:
    ```ts
    // lib/utils/motion.ts
    export const reducedMotion = {
        initial: false,
        animate: false,
        transition: { duration: 0 },
    }
    // In components:
    const prefersReduced = useReducedMotion() // framer-motion hook
    const transition = prefersReduced ? reducedMotion : standardTransition
    ```
- No flashing content above **3 flashes per second** (seizure risk — WCAG 2.3.1).
- Screen Wake Lock video polyfill (1×1px) must have `aria-hidden="true"` and `role="presentation"`.

---

## Motor & Keyboard Accessibility

- **All interactive elements are reachable and operable by keyboard alone.** Tab order must follow visual reading order.
- Focus ring: use the `border-focus` token. Never `outline: none` without a visible alternative.
- Touch targets: **minimum 44×44px** on all interactive elements (`min-h-11 min-w-11` in Tailwind). Prefer 48×48px on primary actions.
- No time limits on user actions (e.g. filling the join form). If a timeout exists elsewhere in the UI, provide a warning and an extension mechanism.
- Drag-and-drop interactions (if any) must have a keyboard equivalent.

---

## Screen Reader & Semantic HTML

- Use **semantic HTML** first (`<button>`, `<nav>`, `<main>`, `<h1>`…`<h6>`, `<ul>`/`<li>`). Add ARIA only when semantics are insufficient.
- Every page must have exactly **one `<h1>`**.
- Every image must have a meaningful `alt` attribute. Decorative images: `alt=""` + `role="presentation"`.
- Dynamic content (queue position change, status update) must announce itself to screen readers:
    ```tsx
    <div aria-live="polite" aria-atomic="true">
        {/* queue position or status message */}
    </div>
    ```
    Use `aria-live="assertive"` only for urgent alerts (e.g. "C'est votre tour !").
- Forms: every `<input>` must have a visible `<label>` associated via `htmlFor`. Never use `placeholder` as a substitute for a label.
- Error messages must be linked to their field via `aria-describedby`.
- Modal dialogs: trap focus inside, restore focus on close, `role="dialog"` with `aria-labelledby`.
- Buttons that only contain an icon must have `aria-label`.

---

## Customer Surface — Specific Rules (`/[slug]/wait/[ticketId]`)

This page may be viewed by someone who:

- Cannot see the screen (blind user — screen reader on phone).
- Cannot hear the notification (deaf user).
- Has a flicker sensitivity (animations).
- Cannot read the language (tourist customer).

Mandatory on this page:

- The position is announced via `aria-live="polite"` on every change.
- The "C'est votre tour !" alert uses `aria-live="assertive"` + a **visible, high-contrast full-screen banner** (not just a small badge).
- Sound alert: provide a distinct audio cue using `AudioContext` (not just an icon).
- Visual alert for deaf users: large animated colour change + vibration (`navigator.vibrate`).
- All text on the page is translatable — no hardcoded French strings.

---

## Testing Checklist

Run before marking any customer-facing feature as done:

- [ ] Page navigable with **keyboard only** (Tab, Enter, Space, Escape).
- [ ] Page announced correctly with **VoiceOver (iOS)** and **TalkBack (Android)**.
- [ ] All text contrast passes **4.5:1** — verified with browser DevTools or axe.
- [ ] Page tested with `prefers-reduced-motion: reduce` enabled in OS settings.
- [ ] Page tested at **200% browser zoom** — no content overflow or hidden elements.
- [ ] All user-facing strings present in `fr.json` and `en.json`.
- [ ] `axe-core` (via `@axe-core/react` in dev mode) reports **zero critical violations**.
