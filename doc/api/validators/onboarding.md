[**Wait-Light Backend API**](../README.md)

***

[Wait-Light Backend API](../README.md) / validators/onboarding

# validators/onboarding

## Type Aliases

### OnboardingInput

```ts
type OnboardingInput = z.infer<typeof OnboardingSchema>;
```

Defined in: [lib/validators/onboarding.ts:30](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/validators/onboarding.ts#L30)

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

Defined in: [lib/validators/onboarding.ts:9](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/validators/onboarding.ts#L9)
