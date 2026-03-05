[**Wait-Light Backend API**](../README.md)

***

[Wait-Light Backend API](../README.md) / actions/queue

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

Defined in: [lib/actions/queue.ts:100](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/lib/actions/queue.ts#L100)

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

Defined in: [lib/actions/queue.ts:200](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/lib/actions/queue.ts#L200)

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

Defined in: [lib/actions/queue.ts:150](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/lib/actions/queue.ts#L150)

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

Defined in: [lib/actions/queue.ts:52](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/lib/actions/queue.ts#L52)

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

Defined in: [lib/actions/queue.ts:248](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/lib/actions/queue.ts#L248)

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
  id: string;
  joined_at: string;
  merchant_id: string;
  status: "waiting" | "called" | "done" | "cancelled";
};
```

Defined in: [lib/actions/queue.ts:24](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/lib/actions/queue.ts#L24)

A live ticket in the queue (only `waiting` and `called` statuses are returned
by [getQueueAction](#getqueueaction); `done` and `cancelled` are filtered out).

#### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="called_at"></a> `called_at` | `string` \| `null` | [lib/actions/queue.ts:30](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/lib/actions/queue.ts#L30) |
| <a id="customer_name"></a> `customer_name` | `string` | [lib/actions/queue.ts:27](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/lib/actions/queue.ts#L27) |
| <a id="done_at"></a> `done_at` | `string` \| `null` | [lib/actions/queue.ts:31](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/lib/actions/queue.ts#L31) |
| <a id="id"></a> `id` | `string` | [lib/actions/queue.ts:25](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/lib/actions/queue.ts#L25) |
| <a id="joined_at"></a> `joined_at` | `string` | [lib/actions/queue.ts:29](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/lib/actions/queue.ts#L29) |
| <a id="merchant_id"></a> `merchant_id` | `string` | [lib/actions/queue.ts:26](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/lib/actions/queue.ts#L26) |
| <a id="status"></a> `status` | `"waiting"` \| `"called"` \| `"done"` \| `"cancelled"` | [lib/actions/queue.ts:28](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/lib/actions/queue.ts#L28) |
