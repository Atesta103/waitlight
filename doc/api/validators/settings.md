[**Wait-Light Backend API**](../README.md)

***

[Wait-Light Backend API](../README.md) / validators/settings

# validators/settings

## Type Aliases

### MerchantIdentityInput

```ts
type MerchantIdentityInput = z.infer<typeof MerchantIdentitySchema>;
```

Defined in: [lib/validators/settings.ts:79](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/validators/settings.ts#L79)

***

### QueueSettingsInput

```ts
type QueueSettingsInput = z.infer<typeof QueueSettingsSchema>;
```

Defined in: [lib/validators/settings.ts:80](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/validators/settings.ts#L80)

## Variables

### MerchantIdentitySchema

```ts
const MerchantIdentitySchema: ZodObject<{
  border_radius: ZodNullable<ZodOptional<ZodDefault<ZodEnum<{
     0.25rem: "0.25rem";
     0.5rem: "0.5rem";
     0px: "0px";
     1rem: "1rem";
     9999px: "9999px";
  }>>>>;
  brand_color: ZodDefault<ZodOptional<ZodNullable<ZodString>>>;
  default_prep_time_min: ZodNumber;
  font_family: ZodNullable<ZodOptional<ZodDefault<ZodEnum<{
     Inter: "Inter";
     Lato: "Lato";
     Open Sans: "Open Sans";
     Poppins: "Poppins";
     Roboto: "Roboto";
  }>>>>;
  logo_url: ZodOptional<ZodNullable<ZodString>>;
  name: ZodString;
  slug: ZodString;
  theme_pattern: ZodNullable<ZodOptional<ZodDefault<ZodEnum<{
     dots: "dots";
     food_burger: "food_burger";
     food_coffee: "food_coffee";
     food_cutlery: "food_cutlery";
     food_pizza: "food_pizza";
     glow: "glow";
     grid: "grid";
     none: "none";
  }>>>>;
}, $strip>;
```

Defined in: [lib/validators/settings.ts:14](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/validators/settings.ts#L14)

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

Defined in: [lib/validators/settings.ts:64](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/validators/settings.ts#L64)

Schema for updating the queue configuration section:
capacity, welcome message, and notification preferences.
Validated by updateQueueSettingsAction.
