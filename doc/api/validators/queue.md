[**Wait-Light Backend API**](../README.md)

***

[Wait-Light Backend API](../README.md) / validators/queue

# validators/queue

## Type Aliases

### TicketIdInput

```ts
type TicketIdInput = z.infer<typeof TicketIdSchema>;
```

Defined in: [lib/validators/queue.ts:28](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/lib/validators/queue.ts#L28)

***

### TicketStatus

```ts
type TicketStatus = z.infer<typeof TicketStatusSchema>;
```

Defined in: [lib/validators/queue.ts:19](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/lib/validators/queue.ts#L19)

***

### ToggleQueueInput

```ts
type ToggleQueueInput = z.infer<typeof ToggleQueueSchema>;
```

Defined in: [lib/validators/queue.ts:37](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/lib/validators/queue.ts#L37)

## Variables

### TicketIdSchema

```ts
const TicketIdSchema: ZodObject<{
  id: ZodString;
}, $strip>;
```

Defined in: [lib/validators/queue.ts:24](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/lib/validators/queue.ts#L24)

Schema for a single ticket ID — used by call, complete, cancel actions.

***

### TicketStatusSchema

```ts
const TicketStatusSchema: ZodEnum<{
  called: "called";
  cancelled: "cancelled";
  done: "done";
  waiting: "waiting";
}>;
```

Defined in: [lib/validators/queue.ts:12](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/lib/validators/queue.ts#L12)

Valid ticket status values for state-machine transitions.

***

### ToggleQueueSchema

```ts
const ToggleQueueSchema: ZodObject<{
  is_open: ZodBoolean;
}, $strip>;
```

Defined in: [lib/validators/queue.ts:33](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/lib/validators/queue.ts#L33)

Schema for toggling the queue open/closed state.
