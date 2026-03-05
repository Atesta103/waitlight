# Feature 10: Multichannel Authentication (Google/Apple SSO)

* **Type**: Conversion evolution (Evolution)
* **Dependencies**: [Feature 01: Authentication & Account Management](./01_merchant_auth.md)

**Description**: Simplify merchant registration with fast third-party authentication (Social Login). This reduces friction during sign-up and password fatigue.

## Integration sub-tasks

### Backend (Supabase)
- [ ] Enable Google and Apple providers in the **Supabase Auth** administration panel.
- [ ] Retrieve OAuth credentials from Google (Google Cloud Console) and Apple (Developer Portal) and link them to the Supabase project configuration securely.
- [ ] Ensure that the PostgreSQL database trigger that automatically creates the `merchants` profile upon user creation (`auth.users` insert trigger) natively handles users created via OAuth without breaking.

### Frontend (Next.js)
- [ ] Add highly visible "Continue with Google" and "Continue with Apple" branded buttons on the `/(auth)/login` and `/(auth)/register` pages beneath the email form.
- [ ] Link these buttons with the `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: 'http://localhost:3000/auth/callback' } })` client method.
- [ ] Handle authentication redirection parameters on return (e.g., catching errors if the user cancels the popup).

## Identified additional tasks

### Quality & robustness
- [ ] **Account Linking**: Handle the edge case where a user first creates an account with `john@example.com` + Password, and later clicks "Continue with Google" using the same email address. Supabase Auth must be configured to merge or link these cleanly.
- [ ] **Apple Private Relay**: If a user selects "Hide My Email" with Apple, ensure the temporary proxy email `...@privaterelay.appleid.com` is safely captured and they can still receive necessary Waitlight notifications.

### UX & accessibility
- [ ] **Design Guidelines**: Implement the SSO buttons strictly matching Google and Apple's brand guidelines (e.g., Apple button must be black or white with logo, specific corner radii, and padding).
- [ ] **Error Toasts**: If the OAuth exchange fails, use the `sonner` or `react-hot-toast` libraries to show a friendly error on the login page ("Google authentication cancelled.") instead of a blank screen.

### Security
- [ ] **Strict Redirect URIs**: Ensure the `Redirect URI` configuration in both Google/Apple and Supabase strictly whitelists the production domain (`https://wait-light.app/auth/callback`) to prevent open redirect vulnerabilities.
- [ ] **PKCE Flow**: Guarantee the Next.js implementation natively utilizes the PKCE (Proof Key for Code Exchange) flow required for secure Server-Side Rendering (SSR) applications in the `@supabase/ssr` library.

## Architecture Notes
- By relying entirely on Supabase's managed OAuth flow, the Next.js app never directly visualizes or processes Google/Apple access tokens. The frontend merely initiates a redirect and exchanges a short-lived `#code` for a secure Supabase JWT session cookie inside `middleware.ts` or the `/auth/callback` route.
