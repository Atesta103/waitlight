[**Wait-Light Backend API**](../README.md)

***

[Wait-Light Backend API](../README.md) / actions/auth

# actions/auth

## Functions

### forgotPasswordAction()

```ts
function forgotPasswordAction(formData): Promise<
  | {
  data: null;
}
  | {
  error: string;
}>;
```

Defined in: [lib/actions/auth.ts:206](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/actions/auth.ts#L206)

Send a password-reset email to the given address.

**Always** returns `{ data: null }` — even if the email does not exist —
to prevent user-enumeration attacks.

The reset link redirects to `/auth/callback?next=/reset-password`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `formData` | `FormData` | Validated by [ForgotPasswordSchema](../validators/auth.md#forgotpasswordschema). |

#### Returns

`Promise`\<
  \| \{
  `data`: `null`;
\}
  \| \{
  `error`: `string`;
\}\>

Always succeeds — even for unknown emails — to prevent enumeration.

**Errors:**
| `error` string | Cause |
|---|---|
| Zod issue message or `"Données invalides."` | Validation failure |

***

### loginAction()

```ts
function loginAction(formData): Promise<{
  error: string;
}>;
```

Defined in: [lib/actions/auth.ts:87](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/actions/auth.ts#L87)

Sign in an existing merchant with email and password.

On success, performs a server-side redirect to `/dashboard` — no value is returned.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `formData` | `FormData` | Validated by [LoginSchema](../validators/auth.md#loginschema). |

#### Returns

`Promise`\<\{
  `error`: `string`;
\}\>

Redirects to `/dashboard` on success.

**Errors:**
| `error` string | Cause | Supabase code |
|---|---|---|
| Zod issue message or `"Données invalides."` | Validation failure | — |
| `"E-mail ou mot de passe incorrect."` | Wrong credentials | `invalid_credentials` |
| `"Veuillez confirmer votre adresse e-mail avant de vous connecter."` | Unconfirmed email | `email_not_confirmed` |
| `"Une erreur est survenue. Veuillez réessayer."` | Unknown Supabase error | any |
| `"Impossible de contacter le serveur. Vérifiez votre connexion."` | Network failure | — |

***

### oauthSignInAction()

```ts
function oauthSignInAction(provider): Promise<
  | {
  data: {
     url: string;
  };
}
  | {
  error: string;
}>;
```

Defined in: [lib/actions/auth.ts:48](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/actions/auth.ts#L48)

Initiate an OAuth sign-in flow with a social provider.

Returns the Supabase authorization URL. The **caller is responsible** for
redirecting the browser to it. Providers must be enabled in the Supabase
Auth dashboard first.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `provider` | `"google"` \| `"apple"` | OAuth provider to use (`"google"` or `"apple"`) |

#### Returns

`Promise`\<
  \| \{
  `data`: \{
     `url`: `string`;
  \};
\}
  \| \{
  `error`: `string`;
\}\>

Authorization URL to redirect the browser to.

**Errors:**
| `error` string | Cause |
|---|---|
| `"Connexion {provider} échouée : {msg}"` | Supabase OAuth initiation failed |

***

### registerAction()

```ts
function registerAction(formData): Promise<
  | {
  data: null;
}
  | {
  error: string;
}>;
```

Defined in: [lib/actions/auth.ts:145](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/actions/auth.ts#L145)

Create a new merchant account with email and password.

On success returns `{ data: null }` — the UI should display a
"check your inbox" confirmation. No redirect is performed.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `formData` | `FormData` | Validated by [RegisterSchema](../validators/auth.md#registerschema). **Errors:** | `error` string | Cause | Supabase code | |---|---|---| | Zod issue message or `"Données invalides."` | Validation failure | — | | `"Un compte existe déjà pour cette adresse e-mail."` | Duplicate email | `user_already_exists` | | `"Inscription échouée. Veuillez réessayer."` | Unknown Supabase error | any | | `"Impossible de contacter le serveur. Vérifiez votre connexion."` | Network failure | — | |

#### Returns

`Promise`\<
  \| \{
  `data`: `null`;
\}
  \| \{
  `error`: `string`;
\}\>

***

### resetPasswordAction()

```ts
function resetPasswordAction(formData): Promise<{
  error: string;
}>;
```

Defined in: [lib/actions/auth.ts:246](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/actions/auth.ts#L246)

Update the authenticated user's password after the magic-link reset flow.

On success, performs a server-side redirect to `/login?reset=success`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `formData` | `FormData` | Validated by [ResetPasswordSchema](../validators/auth.md#resetpasswordschema). |

#### Returns

`Promise`\<\{
  `error`: `string`;
\}\>

Redirects to `/login?reset=success` on success.

**Errors:**
| `error` string | Cause |
|---|---|
| Zod issue message or `"Données invalides."` | Validation failure |
| `"Réinitialisation échouée. Le lien a peut-être expiré."` | Supabase `updateUser` failed or expired link |

***

### signOutAction()

```ts
function signOutAction(): Promise<void>;
```

Defined in: [lib/actions/auth.ts:282](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/actions/auth.ts#L282)

Sign out the current user.

Calls `supabase.auth.signOut()` to clear the session cookie, then
performs a server-side redirect to `/login`. Never returns an error.

#### Returns

`Promise`\<`void`\>
