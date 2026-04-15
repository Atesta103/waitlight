[**Wait-Light Backend API**](README.md)

***

[Wait-Light Backend API](README.md) / auth-callback

# auth-callback

## Functions

### GET()

```ts
function GET(request): Promise<NextResponse<unknown>>;
```

Defined in: [app/auth/callback/route.ts:44](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/app/auth/callback/route.ts#L44)

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
