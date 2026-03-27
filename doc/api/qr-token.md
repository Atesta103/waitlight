[**Wait-Light Backend API**](README.md)

***

[Wait-Light Backend API](README.md) / qr-token

# qr-token

## Example

```ts
// 10 s slots, 5 s grace window
isQrTokenValid(currentSlot())           // true  (current slot)
isQrTokenValid(currentSlot() - 1)       // true  (if within grace window)
isQrTokenValid(currentSlot() - 2)       // false (too old)
```

## Functions

### currentSlot()

```ts
function currentSlot(now?): number;
```

Defined in: [lib/utils/qr-token.ts:34](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/utils/qr-token.ts#L34)

Returns the current valid slot index.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `now` | `number` |

#### Returns

`number`

***

### isQrTokenValid()

```ts
function isQrTokenValid(token, now?): boolean;
```

Defined in: [lib/utils/qr-token.ts:48](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/utils/qr-token.ts#L48)

Returns true if the given token is valid at `now`.

Accepts:
 - The current slot (always valid)
 - The previous slot within the grace window

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `token` | `number` | The integer token parsed from the `?t=` query parameter. |
| `now` | `number` | Current timestamp in ms (injectable for testing). Defaults to Date.now(). |

#### Returns

`boolean`

## Variables

### QR\_GRACE\_MS

```ts
const QR_GRACE_MS: 5000 = 5_000;
```

Defined in: [lib/utils/qr-token.ts:29](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/utils/qr-token.ts#L29)

How long (ms) the previous token is still accepted after it expires.
Set to allow a full page load after scanning at the last second.

***

### QR\_REFRESH\_INTERVAL\_MS

```ts
const QR_REFRESH_INTERVAL_MS: 10000 = 10_000;
```

Defined in: [lib/utils/qr-token.ts:23](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/utils/qr-token.ts#L23)

Must stay in sync with QRCodeDisplay.tsx
