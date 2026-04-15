[**Wait-Light Backend API**](README.md)

***

[Wait-Light Backend API](README.md) / proxy

# proxy

## Functions

### proxy()

```ts
function proxy(request): Promise<NextResponse<unknown>>;
```

Defined in: [proxy.ts:34](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/proxy.ts#L34)

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

Defined in: [proxy.ts:82](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/proxy.ts#L82)

#### Type Declaration

| Name | Type | Defined in |
| ------ | ------ | ------ |
| <a id="property-matcher"></a> `matcher` | `string`[] | [proxy.ts:83](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/proxy.ts#L83) |
