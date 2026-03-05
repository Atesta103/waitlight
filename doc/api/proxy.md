[**Wait-Light Backend API**](README.md)

***

[Wait-Light Backend API](README.md) / proxy

# proxy

## Functions

### proxy()

```ts
function proxy(request): Promise<NextResponse<unknown>>;
```

Defined in: [proxy.ts:34](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/proxy.ts#L34)

Next.js Proxy (formerly Middleware) — runs on every matching request.

Responsibilities:
 1. Refresh the Supabase session cookie so Server Components always see
    the latest auth state.
 2. Protect the (dashboard) routes — redirect unauthenticated users to /login.
 3. Redirect authenticated users away from (auth) pages to /dashboard.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `request` | `NextRequest` |

#### Returns

`Promise`\<`NextResponse`\<`unknown`\>\>

## Variables

### config

```ts
const config: {
  matcher: string[];
};
```

Defined in: [proxy.ts:73](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/proxy.ts#L73)

#### Type Declaration

| Name | Type | Defined in |
| ------ | ------ | ------ |
| <a id="property-matcher"></a> `matcher` | `string`[] | [proxy.ts:74](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/proxy.ts#L74) |
