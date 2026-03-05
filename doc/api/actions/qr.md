[**Wait-Light Backend API**](../README.md)

***

[Wait-Light Backend API](../README.md) / actions/qr

# actions/qr

## Functions

### generateQrTokenAction()

```ts
function generateQrTokenAction(): Promise<
  | {
  data: {
     expiresAt: string;
     nonce: string;
  };
}
  | {
  error: string;
}>;
```

Defined in: [lib/actions/qr.ts:40](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/lib/actions/qr.ts#L40)

Generate a cryptographic one-time token for the authenticated merchant's
rotating QR code.

**Nonce construction:** `{randomUUID}-{HMAC-SHA256(secret, uuid) as hex}`
(~256 bits of entropy). Stored in `qr_tokens` with a 30-second TTL.

**Rate limit:** max [QR\_MAX\_TOKENS\_PER\_MINUTE](../qr-config.md#qr_max_tokens_per_minute) generations per merchant
per 60-second window.

The generated nonce is embedded in the QR URL as `/{slug}/join?token={nonce}`.
On scan, the join page calls the `validate_qr_token` RPC to atomically verify
and mark the token as used.

#### Returns

`Promise`\<
  \| \{
  `data`: \{
     `expiresAt`: `string`;
     `nonce`: `string`;
  \};
\}
  \| \{
  `error`: `string`;
\}\>

`expiresAt` is an ISO 8601 timestamp (now + [QR\_TOKEN\_TTL\_SECONDS](../qr-config.md#qr_token_ttl_seconds) s).

**Errors:**
| `error` string | Cause |
|---|---|
| `"Session expirée. Veuillez vous reconnecter."` | No authenticated user |
| `"Erreur lors de la vérification des limites."` | Rate-limit count query failed |
| `"Trop de QR codes générés. Veuillez patienter une minute."` | ≥10 tokens in last 60 s |
| `"Impossible de générer le QR Code. Veuillez réessayer."` | DB insert failed |
