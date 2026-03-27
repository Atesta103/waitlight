[**Wait-Light Backend API**](README.md)

***

[Wait-Light Backend API](README.md) / qr-config

# qr-config

## Variables

### QR\_MAX\_TOKENS\_PER\_MINUTE

```ts
const QR_MAX_TOKENS_PER_MINUTE: 10 = 10;
```

Defined in: [lib/utils/qr-config.ts:22](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/utils/qr-config.ts#L22)

Max token generations per minute per merchant before rate-limiting.

***

### QR\_MAX\_VALID\_TOKENS

```ts
const QR_MAX_VALID_TOKENS: 2 = 2;
```

Defined in: [lib/utils/qr-config.ts:19](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/utils/qr-config.ts#L19)

Maximum number of valid tokens simultaneously per merchant.
Current (15s interval) + Previous (still within 30s TTL) = 2.

***

### QR\_ROTATION\_INTERVAL\_MS

```ts
const QR_ROTATION_INTERVAL_MS: 15000 = 15_000;
```

Defined in: [lib/utils/qr-config.ts:10](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/utils/qr-config.ts#L10)

Milliseconds between QR code rotations on the display screen.

***

### QR\_TOKEN\_TTL\_SECONDS

```ts
const QR_TOKEN_TTL_SECONDS: 30 = 30;
```

Defined in: [lib/utils/qr-config.ts:13](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/utils/qr-config.ts#L13)

Seconds a token remains valid in the database (30s grace window).
