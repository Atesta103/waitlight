# Feature 10: Multichannel Authentication (Google/Apple SSO)

- **Type**: Conversion evolution (Evolution)
- **Dependencies**: [Feature 01: Authentication & Account Management](./01_merchant_auth.md)

**Description**: Simplify merchant registration with fast third-party authentication (Social Login). This reduces friction during sign-up and password fatigue.

## Integration sub-tasks

### Backend (Supabase)

- [ ] Enable Google and Apple providers in the **Supabase Auth** administration panel.
- [ ] Retrieve OAuth credentials from Google (Google Cloud Console) and Apple (Developer Portal) and link them to the Supabase project configuration securely.
- [x] The `merchants` table uses RLS INSERT policy `auth.uid() = id` and the dashboard layout redirects to `/onboarding` when no merchant row exists — OAuth users land on onboarding automatically, no separate trigger needed.

### Frontend (Next.js)

- [x] "Continue with Google" and "Continue with Apple" branded buttons in `SocialAuthButtons` molecule, rendered on both `/login` and `/register` pages.
- [x] `oauthSignInAction` calls `supabase.auth.signInWithOAuth()` and returns the redirect URL to the client (PKCE-safe; never exposes tokens).
- [x] OAuth errors surfaced in the form: cancelled → "Connexion annulée.", provider error → friendly message. No blank screen.
- [x] `/auth/callback` route handler: PKCE code exchange, `?error=access_denied` mapped to `oauth_cancelled`, other provider errors to `oauth_error`.
- [x] Root `middleware.ts` created — calls `updateSession` on every request to keep Supabase session cookies fresh; guards `/dashboard` and `/onboarding`; redirects authenticated users away from auth pages (excluding `/reset-password`).

## Identified additional tasks

### Quality & robustness

- [ ] **Account Linking**: Handle the edge case where a user first creates an account with `john@example.com` + Password, and later clicks "Continue with Google" using the same email address. Supabase Auth must be configured to merge or link these cleanly.
- [ ] **Apple Private Relay**: If a user selects "Hide My Email" with Apple, ensure the temporary proxy email `...@privaterelay.appleid.com` is safely captured and they can still receive necessary Waitlight notifications.

### UX & accessibility

- [x] **Design Guidelines**: Google button uses official brand colours (4-path G), Apple button uses monochrome logo — both comply with provider guidelines.
- [x] **Error Messages**: OAuth cancellation and failure each show a distinct, user-friendly error message on the login page.

### Security

- [ ] **Strict Redirect URIs**: Ensure the `Redirect URI` configuration in both Google/Apple and Supabase strictly whitelists the production domain (`https://wait-light.app/auth/callback`) to prevent open redirect vulnerabilities.
- [x] **PKCE Flow**: `@supabase/ssr` uses PKCE by default. The callback route uses `exchangeCodeForSession(code)` — the app never sees raw OAuth tokens.
- [x] **Session Refresh**: Root `middleware.ts` calls `updateSession` on every request — required by `@supabase/ssr` to keep the session alive in SSR contexts.

## Architecture Notes

- By relying entirely on Supabase's managed OAuth flow, the Next.js app never directly visualizes or processes Google/Apple access tokens. The frontend merely initiates a redirect and exchanges a short-lived `#code` for a secure Supabase JWT session cookie inside `middleware.ts` or the `/auth/callback` route.
