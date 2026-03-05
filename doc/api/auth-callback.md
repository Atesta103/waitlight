[**Wait-Light Backend API**](README.md)

***

[Wait-Light Backend API](README.md) / auth-callback

# auth-callback

## Functions

### GET()

```ts
function GET(request): Promise<NextResponse<unknown>>;
```

Defined in: [app/auth/callback/route.ts:43](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/app/auth/callback/route.ts#L43)

Auth callback Route Handler.

Supabase redirects here after:
  - Email confirmation (sign-up)
  - Password reset (magic link)
  - OAuth provider sign-in (Google, Apple)

The `code` query param is exchanged for a session cookie via PKCE.
The browser is then redirected to `next` (defaults to /dashboard).

Error cases handled:
  - `?error=access_denied` — user cancelled the OAuth consent screen
  - `?error=*` — any other provider-level OAuth error
  - Missing/invalid code — expired link or tampered URL

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `request` | `NextRequest` |

#### Returns

`Promise`\<`NextResponse`\<`unknown`\>\>
