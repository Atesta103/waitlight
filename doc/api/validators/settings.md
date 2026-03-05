[**Wait-Light Backend API**](../README.md)

***

[Wait-Light Backend API](../README.md) / validators/settings

# validators/settings

## Type Aliases

### MerchantIdentityInput

```ts
type MerchantIdentityInput = z.infer<typeof MerchantIdentitySchema>;
```

Defined in: [lib/validators/settings.ts:55](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/lib/validators/settings.ts#L55)

***

### QueueSettingsInput

```ts
type QueueSettingsInput = z.infer<typeof QueueSettingsSchema>;
```

Defined in: [lib/validators/settings.ts:56](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/lib/validators/settings.ts#L56)

## Variables

### MerchantIdentitySchema

```ts
const MerchantIdentitySchema: ZodObject<{
  default_prep_time_min: ZodNumber;
  logo_url: ZodOptional<ZodNullable<ZodString>>;
  name: ZodString;
  slug: ZodString;
}, $strip>;
```

Defined in: [lib/validators/settings.ts:14](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/lib/validators/settings.ts#L14)

Schema for updating the merchant identity section:
name, slug, logo, and default preparation time.
Validated by updateMerchantSettingsAction.

***

### QueueSettingsSchema

```ts
const QueueSettingsSchema: ZodObject<{
  auto_close_enabled: ZodBoolean;
  max_capacity: ZodNumber;
  notifications_enabled: ZodBoolean;
  welcome_message: ZodOptional<ZodNullable<ZodString>>;
}, $strip>;
```

Defined in: [lib/validators/settings.ts:40](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/lib/validators/settings.ts#L40)

Schema for updating the queue configuration section:
capacity, welcome message, and notification preferences.
Validated by updateQueueSettingsAction.
