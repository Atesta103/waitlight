[**Wait-Light Backend API**](../README.md)

***

[Wait-Light Backend API](../README.md) / validators/onboarding

# validators/onboarding

## Type Aliases

### OnboardingInput

```ts
type OnboardingInput = z.infer<typeof OnboardingSchema>;
```

Defined in: [lib/validators/onboarding.ts:30](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/lib/validators/onboarding.ts#L30)

## Variables

### OnboardingSchema

```ts
const OnboardingSchema: ZodObject<{
  max_capacity: ZodNumber;
  name: ZodString;
  slug: ZodString;
  welcome_message: ZodOptional<ZodString>;
}, $strip>;
```

Defined in: [lib/validators/onboarding.ts:9](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/lib/validators/onboarding.ts#L9)
