[**Wait-Light Backend API**](../README.md)

***

[Wait-Light Backend API](../README.md) / actions/onboarding

# actions/onboarding

## Functions

### checkSlugAvailabilityAction()

```ts
function checkSlugAvailabilityAction(slug): Promise<boolean>;
```

Defined in: [lib/actions/onboarding.ts:25](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/lib/actions/onboarding.ts#L25)

Check whether a slug is already taken (no merchant exclusion).

Used during onboarding before a merchant row exists. For the settings
context (where the merchant's own slug must be excluded), use
`checkSlugAvailabilitySettingsAction` instead.

Called client-side from `SlugInput` with a **500ms debounce**.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `slug` | `string` | Slug string to check. |

#### Returns

`Promise`\<`boolean`\>

`true` if available, `false` if taken.

***

### createMerchantAction()

```ts
function createMerchantAction(formData): Promise<{
  error: string;
}>;
```

Defined in: [lib/actions/onboarding.ts:60](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/lib/actions/onboarding.ts#L60)

Create the `merchants` and `settings` rows for the authenticated user.
Final step of the onboarding wizard.

On success, redirects to `/dashboard`. If a merchant row already exists
(e.g. duplicate submission), skips creation and redirects directly.

**Transaction note:** two sequential inserts with manual rollback — if
`settings.insert` fails, the `merchants` row is deleted to stay consistent.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `formData` | \{ `maxCapacity`: `number`; `name`: `string`; `slug`: `string`; `welcomeMessage`: `string`; \} | Mapped to [OnboardingSchema](../validators/onboarding.md#onboardingschema) before validation. |
| `formData.maxCapacity` | `number` | - |
| `formData.name` | `string` | - |
| `formData.slug` | `string` | - |
| `formData.welcomeMessage` | `string` | - |

#### Returns

`Promise`\<\{
  `error`: `string`;
\}\>

Redirects to `/dashboard` on success.

**Errors:**
| `error` string | Cause | Postgres code |
|---|---|---|
| Zod message or `"Données invalides."` | Validation failure | — |
| `"Session expirée. Veuillez vous reconnecter."` | No session | — |
| `"Ce slug est déjà utilisé. Choisissez-en un autre."` | Slug uniqueness conflict | `23505` |
| `"Erreur lors de la création. Veuillez réessayer."` | `merchants.insert` failed | — |
| `"Erreur lors de la configuration. Veuillez réessayer."` | `settings.insert` failed (+ rollback) | — |
