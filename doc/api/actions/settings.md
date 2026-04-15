[**Wait-Light Backend API**](../README.md)

***

[Wait-Light Backend API](../README.md) / actions/settings

# actions/settings

## Functions

### checkSlugAvailabilitySettingsAction()

```ts
function checkSlugAvailabilitySettingsAction(slug): Promise<boolean>;
```

Defined in: [lib/actions/settings.ts:395](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/actions/settings.ts#L395)

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

Defined in: [lib/actions/settings.ts:342](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/actions/settings.ts#L342)

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

Defined in: [lib/actions/settings.ts:71](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/actions/settings.ts#L71)

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

Defined in: [lib/actions/settings.ts:303](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/actions/settings.ts#L303)

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

### resetAvgPrepTimeAction()

```ts
function resetAvgPrepTimeAction(): Promise<
  | {
  data: null;
}
  | {
  error: string;
}>;
```

Defined in: [lib/actions/settings.ts:427](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/actions/settings.ts#L427)

Reset the auto-computed preparation time, returning the merchant to
manual mode (`default_prep_time_min`).

Sets `calculated_avg_prep_time = NULL` and `avg_prep_computed_at = NULL`.
The cron job will re-activate once enough new ticket data accumulates.

**Errors:**
| `error` string | Cause |
|---|---|
| `"Session expirée. Veuillez vous reconnecter."` | No authenticated user |
| `"Erreur lors de la réinitialisation. Veuillez réessayer."` | Supabase update failed |

#### Returns

`Promise`\<
  \| \{
  `data`: `null`;
\}
  \| \{
  `error`: `string`;
\}\>

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

Defined in: [lib/actions/settings.ts:160](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/actions/settings.ts#L160)

Update the merchant's display name, public slug, logo URL, and default prep time.

Enforces a **1-hour cooldown** on slug changes to prevent enumeration attacks.
Returns the new slug so the caller can refresh QR Code rendering.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `input` | \{ `border_radius?`: `"0px"` \| `"0.25rem"` \| `"0.5rem"` \| `"1rem"` \| `"9999px"` \| `null`; `brand_color`: `string` \| `null`; `default_prep_time_min`: `number`; `font_family?`: `"Inter"` \| `"Roboto"` \| `"Open Sans"` \| `"Lato"` \| `"Poppins"` \| `null`; `logo_url?`: `string` \| `null`; `name`: `string`; `slug`: `string`; `theme_pattern?`: \| `"none"` \| `"dots"` \| `"grid"` \| `"glow"` \| `"food_burger"` \| `"food_pizza"` \| `"food_coffee"` \| `"food_cutlery"` \| `null`; \} | Merchant identity fields. Validated by [MerchantIdentitySchema](../validators/settings.md#merchantidentityschema). |
| `input.border_radius?` | `"0px"` \| `"0.25rem"` \| `"0.5rem"` \| `"1rem"` \| `"9999px"` \| `null` | - |
| `input.brand_color` | `string` \| `null` | - |
| `input.default_prep_time_min` | `number` | - |
| `input.font_family?` | `"Inter"` \| `"Roboto"` \| `"Open Sans"` \| `"Lato"` \| `"Poppins"` \| `null` | - |
| `input.logo_url?` | `string` \| `null` | - |
| `input.name` | `string` | - |
| `input.slug` | `string` | - |
| `input.theme_pattern?` | \| `"none"` \| `"dots"` \| `"grid"` \| `"glow"` \| `"food_burger"` \| `"food_pizza"` \| `"food_coffee"` \| `"food_cutlery"` \| `null` | - |

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

Defined in: [lib/actions/settings.ts:253](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/actions/settings.ts#L253)

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
     avg_prep_computed_at: string | null;
     border_radius: string | null;
     brand_color: string | null;
     calculated_avg_prep_time: number | null;
     default_prep_time_min: number;
     font_family: string | null;
     id: string;
     is_open: boolean;
     logo_url: string | null;
     name: string;
     slug: string;
     theme_pattern: string | null;
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

Defined in: [lib/actions/settings.ts:29](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/actions/settings.ts#L29)

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="merchant"></a> `merchant` | \{ `avg_prep_computed_at`: `string` \| `null`; `border_radius`: `string` \| `null`; `brand_color`: `string` \| `null`; `calculated_avg_prep_time`: `number` \| `null`; `default_prep_time_min`: `number`; `font_family`: `string` \| `null`; `id`: `string`; `is_open`: `boolean`; `logo_url`: `string` \| `null`; `name`: `string`; `slug`: `string`; `theme_pattern`: `string` \| `null`; \} | - | [lib/actions/settings.ts:30](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/actions/settings.ts#L30) |
| `merchant.avg_prep_computed_at` | `string` \| `null` | UTC timestamp of the last `calculate_avg_prep()` run. | [lib/actions/settings.ts:44](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/actions/settings.ts#L44) |
| `merchant.border_radius` | `string` \| `null` | - | [lib/actions/settings.ts:37](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/actions/settings.ts#L37) |
| `merchant.brand_color` | `string` \| `null` | - | [lib/actions/settings.ts:35](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/actions/settings.ts#L35) |
| `merchant.calculated_avg_prep_time` | `number` \| `null` | Auto-computed average prep time (IQR + EMA). `null` = not enough data yet. | [lib/actions/settings.ts:42](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/actions/settings.ts#L42) |
| `merchant.default_prep_time_min` | `number` | - | [lib/actions/settings.ts:39](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/actions/settings.ts#L39) |
| `merchant.font_family` | `string` \| `null` | - | [lib/actions/settings.ts:36](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/actions/settings.ts#L36) |
| `merchant.id` | `string` | - | [lib/actions/settings.ts:31](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/actions/settings.ts#L31) |
| `merchant.is_open` | `boolean` | - | [lib/actions/settings.ts:40](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/actions/settings.ts#L40) |
| `merchant.logo_url` | `string` \| `null` | - | [lib/actions/settings.ts:34](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/actions/settings.ts#L34) |
| `merchant.name` | `string` | - | [lib/actions/settings.ts:32](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/actions/settings.ts#L32) |
| `merchant.slug` | `string` | - | [lib/actions/settings.ts:33](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/actions/settings.ts#L33) |
| `merchant.theme_pattern` | `string` \| `null` | - | [lib/actions/settings.ts:38](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/actions/settings.ts#L38) |
| <a id="settings"></a> `settings` | \{ `auto_close_enabled`: `boolean`; `max_capacity`: `number`; `notifications_enabled`: `boolean`; `qr_regenerated_at`: `string` \| `null`; `welcome_message`: `string` \| `null`; \} | - | [lib/actions/settings.ts:46](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/actions/settings.ts#L46) |
| `settings.auto_close_enabled` | `boolean` | - | [lib/actions/settings.ts:51](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/actions/settings.ts#L51) |
| `settings.max_capacity` | `number` | - | [lib/actions/settings.ts:47](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/actions/settings.ts#L47) |
| `settings.notifications_enabled` | `boolean` | - | [lib/actions/settings.ts:50](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/actions/settings.ts#L50) |
| `settings.qr_regenerated_at` | `string` \| `null` | - | [lib/actions/settings.ts:49](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/actions/settings.ts#L49) |
| `settings.welcome_message` | `string` \| `null` | - | [lib/actions/settings.ts:48](https://github.com/Atesta103/waitlight/blob/b5339e5337ff856d55f42aa7d8b642100c97c53f/lib/actions/settings.ts#L48) |
