# Feature 01: Authentication & Account Management (Merchant Auth)

- **Type**: Core application (Core)
- **Dependencies**: None

**Description**: Allow merchants to create a secure account (sign up/sign in/sign out) to access and manage their Waitlight space privately. This is the essential foundation to isolate the data of each business (RLS).

## Integration sub-tasks

### Backend (Supabase)

- [x] Configure Supabase Auth (Email / Password) — project connected via `.env.local`.
- [x] Supabase environment variables configured (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- [x] Create the `merchants` table in Supabase (public profile of the business linked to `auth.uid()`).
- [x] Set up RLS rules on `merchants` (the merchant can only modify their own profile).

### Frontend (Next.js)

- [x] Public views `/(auth)/login`, `/(auth)/register`, `/(auth)/forgot-password`, `/(auth)/reset-password`.
- [x] Server Actions validated with Zod (`loginAction`, `registerAction`, `forgotPasswordAction`, `resetPasswordAction`, `signOutAction`) in `lib/actions/auth.ts`.
- [x] Zod schemas in `lib/validators/auth.ts` (`LoginSchema`, `RegisterSchema`, `ForgotPasswordSchema`, `ResetPasswordSchema`).
- [x] Separate Supabase clients: `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (server), `lib/supabase/middleware.ts` (proxy).
- [x] `proxy.ts` (Next.js 15) — redirects unauthenticated users away from `/(dashboard)` and vice versa. Handles `/` → `/login` or `/dashboard` based on auth state.
- [x] `/auth/callback` route for PKCE exchange (email confirmation + reset password).
- [x] "Log out" button accessible via the `UserMenu` dropdown in the dashboard header (avatar → "Se déconnecter").
- [x] Redirection `/` → `/login` or `/dashboard` (handled in `proxy.ts`).
- [x] Network error handling in Server Actions (catch `TypeError: fetch failed`).
- [x] Success/error banners post-redirect on `/login` (`?reset=success`, `?error=auth_callback_error`).
- [x] "Check your mailbox" state after successful registration in `RegisterForm`.

### To do

- [x] Enable email confirmation in the Supabase dashboard (Auth → Email → "Confirm email").
- [x] Configure authorized URLs in Supabase (`Site URL` + `Redirect URLs` → `http://localhost:3000/auth/callback`).
- [x] Create the `merchants` table and associated RLS policies — migration in `supabase/migrations/20260302000000_initial_schema.sql`.
- [x] Link `auth.uid()` to the `merchants` table on first connection — implemented via `/onboarding` (`lib/actions/onboarding.ts`).
- [x] Improve the design of the password input (green or red depending on password strength as well as telling what to add to have a strong password)
- [x] Suggest a strong password to the user during registration
- [x] Add a "Forgot password" link to the login page
- [ ] Suggest a message of Welcome
- [ ] Add step skippable to modified settings
