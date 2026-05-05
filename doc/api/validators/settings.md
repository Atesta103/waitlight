[**WaitLight Backend API**](../README.md)

***

[WaitLight Backend API](../README.md) / validators/settings

# validators/settings

## Type Aliases

### MerchantIdentityInput

```ts
type MerchantIdentityInput = z.infer<typeof MerchantIdentitySchema>;
```

Defined in: [lib/validators/settings.ts:100](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/validators/settings.ts#L100)

***

### QueueSettingsInput

```ts
type QueueSettingsInput = z.infer<typeof QueueSettingsSchema>;
```

Defined in: [lib/validators/settings.ts:101](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/validators/settings.ts#L101)

***

### ThankYouTitleInput

```ts
type ThankYouTitleInput = z.infer<typeof ThankYouTitleSchema>;
```

Defined in: [lib/validators/settings.ts:102](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/validators/settings.ts#L102)

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
  business_type: ZodEnum<{
     food: "food";
     healthcare: "healthcare";
     public_service: "public_service";
     retail: "retail";
  }>;
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

Defined in: [lib/validators/settings.ts:15](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/validators/settings.ts#L15)

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

Defined in: [lib/validators/settings.ts:75](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/validators/settings.ts#L75)

Schema for updating the queue configuration section:
capacity, welcome message, and notification preferences.
Validated by updateQueueSettingsAction.

***

### ThankYouTitleSchema

```ts
const ThankYouTitleSchema: ZodOptional<ZodNullable<ZodString>>;
```

Defined in: [lib/validators/settings.ts:94](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/validators/settings.ts#L94)

Schema for updating the title shown on the completed-ticket banner.
Validated by updateThankYouTitleAction.
