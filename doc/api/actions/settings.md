[**Wait-Light Backend API**](../README.md)

***

[Wait-Light Backend API](../README.md) / actions/settings

# actions/settings

## Functions

### checkSlugAvailabilitySettingsAction()

```ts
function checkSlugAvailabilitySettingsAction(slug): Promise<boolean>;
```

Defined in: [lib/actions/settings.ts:373](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/lib/actions/settings.ts#L373)

Check if a slug is available, **excluding the calling merchant's own slug**.

Used in the Settings context so a merchant can re-save their current slug
without it being reported as taken. Called client-side with a 500ms debounce.
Delegates to the `check_slug_available` RPC (`SECURITY DEFINER`).

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `slug` | `string` | The slug string to check. |

#### Returns

`Promise`\<`boolean`\>

`true` if available, `false` if taken or on any error (safe default).

***

### deleteLogoAction()

```ts
function deleteLogoAction(): Promise<
  | {
  data: null;
}
  | {
  error: string;
}>;
```

Defined in: [lib/actions/settings.ts:320](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/lib/actions/settings.ts#L320)

Remove the merchant's logo from Supabase Storage and clear `logo_url`.

Lists all files under `merchant-logos/{merchant_id}/` and removes them
(handles any file extension without needing to track the exact name).

**Errors:**
| `error` string | Cause |
|---|---|
| `"Session expirée. Veuillez vous reconnecter."` | No authenticated user |
| `"Erreur lors de la suppression du logo."` | Storage `list` or `remove` failed |
| `"Erreur lors de la mise à jour du profil."` | `merchants.logo_url` update failed |

#### Returns

`Promise`\<
  \| \{
  `data`: `null`;
\}
  \| \{
  `error`: `string`;
\}\>

***

### getMerchantSettingsAction()

```ts
function getMerchantSettingsAction(): Promise<
  | {
  data: MerchantSettingsData;
}
  | {
  error: string;
}>;
```

Defined in: [lib/actions/settings.ts:63](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/lib/actions/settings.ts#L63)

Fetch the current merchant profile and settings for the authenticated user.

Used by the settings Server Component to populate initial form values.

**Errors:**
| `error` string | Cause |
|---|---|
| `"Session expirée. Veuillez vous reconnecter."` | No authenticated user |
| `"Commerce introuvable."` | No `merchants` row found |
| `"Configuration introuvable."` | No `settings` row found |

#### Returns

`Promise`\<
  \| \{
  `data`: [`MerchantSettingsData`](#merchantsettingsdata);
\}
  \| \{
  `error`: `string`;
\}\>

***

### regenerateQRAction()

```ts
function regenerateQRAction(): Promise<
  | {
  data: {
     qr_regenerated_at: string;
  };
}
  | {
  error: string;
}>;
```

Defined in: [lib/actions/settings.ts:281](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/lib/actions/settings.ts#L281)

Trigger a visual QR Code re-render by bumping `qr_regenerated_at`.

Does **not** change the merchant slug or join URL. The `qr_regenerated_at`
timestamp is used client-side as a React key to force the QR component to remount.

#### Returns

`Promise`\<
  \| \{
  `data`: \{
     `qr_regenerated_at`: `string`;
  \};
\}
  \| \{
  `error`: `string`;
\}\>

ISO 8601 timestamp of the bump — used as a React key to force QR remount.

**Errors:**
| `error` string | Cause |
|---|---|
| `"Session expirée. Veuillez vous reconnecter."` | No authenticated user |
| `"Erreur lors de la régénération du QR Code."` | Supabase update failed |

***

### updateMerchantIdentityAction()

```ts
function updateMerchantIdentityAction(input): Promise<
  | {
  data: {
     slug: string;
  };
}
  | {
  error: string;
}>;
```

Defined in: [lib/actions/settings.ts:142](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/lib/actions/settings.ts#L142)

Update the merchant's display name, public slug, logo URL, and default prep time.

Enforces a **1-hour cooldown** on slug changes to prevent enumeration attacks.
Returns the new slug so the caller can refresh QR Code rendering.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `input` | \{ `default_prep_time_min`: `number`; `logo_url?`: `string` \| `null`; `name`: `string`; `slug`: `string`; \} | Merchant identity fields. Validated by [MerchantIdentitySchema](../validators/settings.md#merchantidentityschema). |
| `input.default_prep_time_min` | `number` | - |
| `input.logo_url?` | `string` \| `null` | - |
| `input.name` | `string` | - |
| `input.slug` | `string` | - |

#### Returns

`Promise`\<
  \| \{
  `data`: \{
     `slug`: `string`;
  \};
\}
  \| \{
  `error`: `string`;
\}\>

The (potentially new) slug — use it to refresh QR Code rendering.

**Errors:**
| `error` string | Cause | Postgres code |
|---|---|---|
| Zod message or `"Données invalides."` | Validation failure | — |
| `"Session expirée. Veuillez vous reconnecter."` | No authenticated user | — |
| `"Commerce introuvable."` | Merchant row not found | — |
| `"Vous devez attendre encore {N} minute(s)..."` | Slug change cooldown (1 h) | — |
| `"Ce slug est déjà utilisé. Choisissez-en un autre."` | Slug uniqueness conflict | `23505` |
| `"Format du slug invalide."` | DB check constraint violation | `23514` |
| `"Erreur lors de la sauvegarde. Veuillez réessayer."` | Other Supabase error | — |

***

### updateQueueSettingsAction()

```ts
function updateQueueSettingsAction(input): Promise<
  | {
  data: null;
}
  | {
  error: string;
}>;
```

Defined in: [lib/actions/settings.ts:231](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/lib/actions/settings.ts#L231)

Update queue configuration: capacity, welcome message, and notification flags.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `input` | \{ `auto_close_enabled`: `boolean`; `max_capacity`: `number`; `notifications_enabled`: `boolean`; `welcome_message?`: `string` \| `null`; \} | Validated by [QueueSettingsSchema](../validators/settings.md#queuesettingsschema). **Errors:** | `error` string | Cause | |---|---| | Zod message or `"Données invalides."` | Validation failure | | `"Session expirée. Veuillez vous reconnecter."` | No authenticated user | | `"Erreur lors de la sauvegarde. Veuillez réessayer."` | Supabase update failed | |
| `input.auto_close_enabled` | `boolean` | - |
| `input.max_capacity` | `number` | - |
| `input.notifications_enabled` | `boolean` | - |
| `input.welcome_message?` | `string` \| `null` | - |

#### Returns

`Promise`\<
  \| \{
  `data`: `null`;
\}
  \| \{
  `error`: `string`;
\}\>

## Type Aliases

### MerchantSettingsData

```ts
type MerchantSettingsData = {
  merchant: {
     default_prep_time_min: number;
     id: string;
     is_open: boolean;
     logo_url: string | null;
     name: string;
     slug: string;
  };
  settings: {
     auto_close_enabled: boolean;
     max_capacity: number;
     notifications_enabled: boolean;
     qr_regenerated_at: string | null;
     welcome_message: string | null;
  };
};
```

Defined in: [lib/actions/settings.ts:29](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/lib/actions/settings.ts#L29)

#### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="merchant"></a> `merchant` | \{ `default_prep_time_min`: `number`; `id`: `string`; `is_open`: `boolean`; `logo_url`: `string` \| `null`; `name`: `string`; `slug`: `string`; \} | [lib/actions/settings.ts:30](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/lib/actions/settings.ts#L30) |
| `merchant.default_prep_time_min` | `number` | [lib/actions/settings.ts:35](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/lib/actions/settings.ts#L35) |
| `merchant.id` | `string` | [lib/actions/settings.ts:31](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/lib/actions/settings.ts#L31) |
| `merchant.is_open` | `boolean` | [lib/actions/settings.ts:36](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/lib/actions/settings.ts#L36) |
| `merchant.logo_url` | `string` \| `null` | [lib/actions/settings.ts:34](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/lib/actions/settings.ts#L34) |
| `merchant.name` | `string` | [lib/actions/settings.ts:32](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/lib/actions/settings.ts#L32) |
| `merchant.slug` | `string` | [lib/actions/settings.ts:33](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/lib/actions/settings.ts#L33) |
| <a id="settings"></a> `settings` | \{ `auto_close_enabled`: `boolean`; `max_capacity`: `number`; `notifications_enabled`: `boolean`; `qr_regenerated_at`: `string` \| `null`; `welcome_message`: `string` \| `null`; \} | [lib/actions/settings.ts:38](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/lib/actions/settings.ts#L38) |
| `settings.auto_close_enabled` | `boolean` | [lib/actions/settings.ts:43](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/lib/actions/settings.ts#L43) |
| `settings.max_capacity` | `number` | [lib/actions/settings.ts:39](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/lib/actions/settings.ts#L39) |
| `settings.notifications_enabled` | `boolean` | [lib/actions/settings.ts:42](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/lib/actions/settings.ts#L42) |
| `settings.qr_regenerated_at` | `string` \| `null` | [lib/actions/settings.ts:41](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/lib/actions/settings.ts#L41) |
| `settings.welcome_message` | `string` \| `null` | [lib/actions/settings.ts:40](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/lib/actions/settings.ts#L40) |
