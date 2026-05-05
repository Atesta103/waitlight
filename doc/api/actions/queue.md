[**WaitLight Backend API**](../README.md)

***

[WaitLight Backend API](../README.md) / actions/queue

# actions/queue

## Functions

### callTicketAction()

```ts
function callTicketAction(input): Promise<
  | {
  data: null;
}
  | {
  error: string;
}>;
```

Defined in: [lib/actions/queue.ts:189](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/queue.ts#L189)

Transition a ticket from `waiting` → `called`.

Sets `called_at` to the current UTC timestamp.
Silently no-ops if the ticket is already in `called`, `done`, or `cancelled` state
(idempotency guard via `.eq("status", "waiting")`).

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `input` | \{ `id`: `string`; \} | Validated by [TicketIdSchema](../validators/queue.md#ticketidschema). **Errors:** | `error` string | Cause | |---|---| | `"Données invalides."` or Zod message | Invalid UUID format | | `"Session expirée. Veuillez vous reconnecter."` | No authenticated user | | `"Impossible d'appeler ce client. Veuillez réessayer."` | Supabase update failed or ticket not in `waiting` | |
| `input.id` | `string` | - |

#### Returns

`Promise`\<
  \| \{
  `data`: `null`;
\}
  \| \{
  `error`: `string`;
\}\>

***

### cancelTicketAction()

```ts
function cancelTicketAction(input): Promise<
  | {
  data: null;
}
  | {
  error: string;
}>;
```

Defined in: [lib/actions/queue.ts:293](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/queue.ts#L293)

Transition a ticket to `cancelled` from either `waiting` or `called`.

Silently no-ops if the ticket is already `done` or `cancelled`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `input` | \{ `id`: `string`; \} | Validated by [TicketIdSchema](../validators/queue.md#ticketidschema). **Errors:** | `error` string | Cause | |---|---| | `"Données invalides."` or Zod message | Invalid UUID format | | `"Session expirée. Veuillez vous reconnecter."` | No authenticated user | | `"Impossible d'annuler ce ticket. Veuillez réessayer."` | Supabase update failed | |
| `input.id` | `string` | - |

#### Returns

`Promise`\<
  \| \{
  `data`: `null`;
\}
  \| \{
  `error`: `string`;
\}\>

***

### checkNameAction()

```ts
function checkNameAction(name, slug?): Promise<{
  isBanned: boolean;
}>;
```

Defined in: [lib/actions/queue.ts:542](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/queue.ts#L542)

Check if a customer name is banned for the given merchant.
Checks both merchant-specific bans and global bans (merchant_id IS NULL).

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `name` | `string` | The customer name to check. |
| `slug?` | `string` | The merchant slug, used to look up the merchant_id. |

#### Returns

`Promise`\<\{
  `isBanned`: `boolean`;
\}\>

***

### completeTicketAction()

```ts
function completeTicketAction(input): Promise<
  | {
  data: null;
}
  | {
  error: string;
}>;
```

Defined in: [lib/actions/queue.ts:241](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/queue.ts#L241)

Transition a ticket from `called` → `done`.

Sets `done_at` to the current UTC timestamp, which triggers the Postgres
function that recalculates `merchants.avg_wait_time`.
Only tickets in `called` state can be completed — use [callTicketAction](#callticketaction) first.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `input` | \{ `id`: `string`; \} | Validated by [TicketIdSchema](../validators/queue.md#ticketidschema). **Errors:** | `error` string | Cause | |---|---| | `"Données invalides."` or Zod message | Invalid UUID format | | `"Session expirée. Veuillez vous reconnecter."` | No authenticated user | | `"Impossible de terminer ce ticket. Veuillez réessayer."` | Supabase update failed or ticket not in `called` | |
| `input.id` | `string` | - |

#### Returns

`Promise`\<
  \| \{
  `data`: `null`;
\}
  \| \{
  `error`: `string`;
\}\>

***

### createManualTicketAction()

```ts
function createManualTicketAction(input): Promise<
  | {
  data: QueueItem;
}
  | {
  error: string;
}>;
```

Defined in: [lib/actions/queue.ts:89](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/queue.ts#L89)

Create a manual ticket from the merchant dashboard.
Validates input, enforces merchant ownership, and checks capacity.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | \{ `customerName`: `string`; \} |
| `input.customerName` | `string` |

#### Returns

`Promise`\<
  \| \{
  `data`: [`QueueItem`](#queueitem);
\}
  \| \{
  `error`: `string`;
\}\>

***

### getQueueAction()

```ts
function getQueueAction(): Promise<
  | {
  data: QueueItem[];
}
  | {
  error: string;
}>;
```

Defined in: [lib/actions/queue.ts:57](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/queue.ts#L57)

Fetch the active queue (status `waiting` and `called`) for the authenticated merchant.

Results are ordered by `joined_at ASC` (first joined, first shown).
Only active tickets are fetched to keep the dashboard performant.

#### Returns

`Promise`\<
  \| \{
  `data`: [`QueueItem`](#queueitem)[];
\}
  \| \{
  `error`: `string`;
\}\>

Empty array when the queue is empty.

**Errors:**
| `error` string | Cause |
|---|---|
| `"Session expirée. Veuillez vous reconnecter."` | No authenticated user |
| `"Impossible de charger la file d'attente."` | Supabase query failed |

***

### joinQueueAction()

```ts
function joinQueueAction(input): Promise<
  | {
  data: {
     merchantId: string;
     ticketId: string;
  };
}
  | {
  error: string;
}>;
```

Defined in: [lib/actions/queue.ts:379](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/queue.ts#L379)

Join the queue as an anonymous customer.
Validates the QR token, checks business state, and inserts a ticket.
No authentication required — customers are anonymous.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | \{ `consent`: `true`; `customerName`: `string`; `slug`: `string`; `token`: `string`; \} |
| `input.consent` | `true` |
| `input.customerName` | `string` |
| `input.slug` | `string` |
| `input.token` | `string` |

#### Returns

`Promise`\<
  \| \{
  `data`: \{
     `merchantId`: `string`;
     `ticketId`: `string`;
  \};
\}
  \| \{
  `error`: `string`;
\}\>

***

### reportTicketNameAction()

```ts
function reportTicketNameAction(ticketId, offendingName): Promise<
  | {
  data: {
     customer_name: string;
     id: string;
     name_flagged: boolean;
  };
}
  | {
  error: string;
}>;
```

Defined in: [lib/actions/queue.ts:472](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/queue.ts#L472)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `ticketId` | `string` |
| `offendingName` | `string` |

#### Returns

`Promise`\<
  \| \{
  `data`: \{
     `customer_name`: `string`;
     `id`: `string`;
     `name_flagged`: `boolean`;
  \};
\}
  \| \{
  `error`: `string`;
\}\>

***

### toggleQueueOpenAction()

```ts
function toggleQueueOpenAction(input): Promise<
  | {
  data: null;
}
  | {
  error: string;
}>;
```

Defined in: [lib/actions/queue.ts:343](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/queue.ts#L343)

Set the queue open/closed state for the authenticated merchant.

The `merchants.is_open` column is updated immediately. Customer-facing
pages (`/[slug]`) read this value to show a "Queue closed" banner.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `input` | \{ `is_open`: `boolean`; \} | Validated by [ToggleQueueSchema](../validators/queue.md#togglequeueschema). **Errors:** | `error` string | Cause | |---|---| | `"Données invalides."` | Non-boolean value | | `"Session expirée. Veuillez vous reconnecter."` | No authenticated user | | `"Impossible de modifier l'état de la file. Veuillez réessayer."` | Supabase update failed | |
| `input.is_open` | `boolean` | - |

#### Returns

`Promise`\<
  \| \{
  `data`: `null`;
\}
  \| \{
  `error`: `string`;
\}\>

## Type Aliases

### QueueItem

```ts
type QueueItem = {
  called_at: string | null;
  customer_name: string;
  done_at: string | null;
  entry_source: "qr" | "manual";
  id: string;
  joined_at: string;
  merchant_id: string;
  status: "waiting" | "called" | "done" | "cancelled";
};
```

Defined in: [lib/actions/queue.ts:28](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/queue.ts#L28)

A live ticket in the queue (only `waiting` and `called` statuses are returned
by [getQueueAction](#getqueueaction); `done` and `cancelled` are filtered out).

#### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="called_at"></a> `called_at` | `string` \| `null` | [lib/actions/queue.ts:35](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/queue.ts#L35) |
| <a id="customer_name"></a> `customer_name` | `string` | [lib/actions/queue.ts:31](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/queue.ts#L31) |
| <a id="done_at"></a> `done_at` | `string` \| `null` | [lib/actions/queue.ts:36](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/queue.ts#L36) |
| <a id="entry_source"></a> `entry_source` | `"qr"` \| `"manual"` | [lib/actions/queue.ts:32](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/queue.ts#L32) |
| <a id="id"></a> `id` | `string` | [lib/actions/queue.ts:29](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/queue.ts#L29) |
| <a id="joined_at"></a> `joined_at` | `string` | [lib/actions/queue.ts:34](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/queue.ts#L34) |
| <a id="merchant_id"></a> `merchant_id` | `string` | [lib/actions/queue.ts:30](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/queue.ts#L30) |
| <a id="status"></a> `status` | `"waiting"` \| `"called"` \| `"done"` \| `"cancelled"` | [lib/actions/queue.ts:33](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/queue.ts#L33) |
