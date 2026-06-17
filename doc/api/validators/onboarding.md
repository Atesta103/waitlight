[**WaitLight Backend API**](../README.md)

***

[WaitLight Backend API](../README.md) / validators/onboarding

# validators/onboarding

## Type Aliases

### OnboardingInput

```ts
type OnboardingInput = z.infer<typeof OnboardingSchema>;
```

Defined in: [lib/validators/onboarding.ts:32](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/validators/onboarding.ts#L32)

## Variables

### OnboardingSchema

```ts
const OnboardingSchema: ZodObject<{
  business_type: ZodEnum<{
     food: "food";
     healthcare: "healthcare";
     public_service: "public_service";
     retail: "retail";
  }>;
  max_capacity: ZodNumber;
  name: ZodString;
  slug: ZodString;
  welcome_message: ZodOptional<ZodString>;
}, $strip>;
```

Defined in: [lib/validators/onboarding.ts:10](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/validators/onboarding.ts#L10)
