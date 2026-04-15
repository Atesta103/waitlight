[**Wait-Light Backend API**](../README.md)

***

[Wait-Light Backend API](../README.md) / validators/queue

# validators/queue

## Type Aliases

### JoinQueueInput

```ts
type JoinQueueInput = z.infer<typeof JoinQueueSchema>;
```

Defined in: [lib/validators/queue.ts:55](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/validators/queue.ts#L55)

***

### TicketIdInput

```ts
type TicketIdInput = z.infer<typeof TicketIdSchema>;
```

Defined in: [lib/validators/queue.ts:28](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/validators/queue.ts#L28)

***

### TicketStatus

```ts
type TicketStatus = z.infer<typeof TicketStatusSchema>;
```

Defined in: [lib/validators/queue.ts:19](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/validators/queue.ts#L19)

***

### ToggleQueueInput

```ts
type ToggleQueueInput = z.infer<typeof ToggleQueueSchema>;
```

Defined in: [lib/validators/queue.ts:37](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/validators/queue.ts#L37)

## Variables

### JoinQueueSchema

```ts
const JoinQueueSchema: ZodObject<{
  consent: ZodLiteral<true>;
  customerName: ZodString;
  slug: ZodString;
  token: ZodString;
}, $strip>;
```

Defined in: [lib/validators/queue.ts:42](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/validators/queue.ts#L42)

Schema for a customer joining the queue via QR code.

***

### TicketIdSchema

```ts
const TicketIdSchema: ZodObject<{
  id: ZodString;
}, $strip>;
```

Defined in: [lib/validators/queue.ts:24](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/validators/queue.ts#L24)

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

Defined in: [lib/validators/queue.ts:12](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/validators/queue.ts#L12)

Valid ticket status values for state-machine transitions.

***

### ToggleQueueSchema

```ts
const ToggleQueueSchema: ZodObject<{
  is_open: ZodBoolean;
}, $strip>;
```

Defined in: [lib/validators/queue.ts:33](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/validators/queue.ts#L33)

Schema for toggling the queue open/closed state.
