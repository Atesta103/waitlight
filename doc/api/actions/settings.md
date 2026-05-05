[**WaitLight Backend API**](../README.md)

***

[WaitLight Backend API](../README.md) / actions/settings

# actions/settings

## Functions

### addBannedWordAction()

```ts
function addBannedWordAction(word): Promise<
  | {
  data: BannedWord;
}
  | {
  error: string;
}>;
```

Defined in: [lib/actions/settings.ts:521](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L521)

Add a banned word for the authenticated merchant.
Silently ignores duplicates (unique constraint on word+merchant_id).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `word` | `string` |

#### Returns

`Promise`\<
  \| \{
  `data`: [`BannedWord`](#bannedword);
\}
  \| \{
  `error`: `string`;
\}\>

***

### checkSlugAvailabilitySettingsAction()

```ts
function checkSlugAvailabilitySettingsAction(slug): Promise<boolean>;
```

Defined in: [lib/actions/settings.ts:417](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L417)

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

### deleteBackgroundAction()

```ts
function deleteBackgroundAction(): Promise<
  | {
  data: null;
}
  | {
  error: string;
}>;
```

Defined in: [lib/actions/settings.ts:751](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L751)

Remove the merchant's background image from Storage and clear `background_url`.

#### Returns

`Promise`\<
  \| \{
  `data`: `null`;
\}
  \| \{
  `error`: `string`;
\}\>

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

Defined in: [lib/actions/settings.ts:364](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L364)

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

### getBannedWordsAction()

```ts
function getBannedWordsAction(): Promise<
  | {
  data: BannedWord[];
}
  | {
  error: string;
}>;
```

Defined in: [lib/actions/settings.ts:491](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L491)

Fetch all banned words for the authenticated merchant.

#### Returns

`Promise`\<
  \| \{
  `data`: [`BannedWord`](#bannedword)[];
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

Defined in: [lib/actions/settings.ts:109](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L109)

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

### removeBannedWordAction()

```ts
function removeBannedWordAction(wordId): Promise<
  | {
  data: null;
}
  | {
  error: string;
}>;
```

Defined in: [lib/actions/settings.ts:569](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L569)

Remove a banned word by ID for the authenticated merchant.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `wordId` | `string` |

#### Returns

`Promise`\<
  \| \{
  `data`: `null`;
\}
  \| \{
  `error`: `string`;
\}\>

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

Defined in: [lib/actions/settings.ts:449](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L449)

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

Defined in: [lib/actions/settings.ts:221](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L221)

Update the merchant's display name, public slug, logo URL, and default prep time.

Enforces a **1-hour cooldown** on slug changes to prevent enumeration attacks.
Returns the new slug so the caller can refresh QR Code rendering.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `input` | \{ `border_radius?`: `"0px"` \| `"0.25rem"` \| `"0.5rem"` \| `"1rem"` \| `"9999px"` \| `null`; `brand_color`: `string` \| `null`; `business_type`: `"food"` \| `"healthcare"` \| `"retail"` \| `"public_service"`; `default_prep_time_min`: `number`; `font_family?`: `"Inter"` \| `"Roboto"` \| `"Open Sans"` \| `"Lato"` \| `"Poppins"` \| `null`; `logo_url?`: `string` \| `null`; `name`: `string`; `slug`: `string`; `theme_pattern?`: \| `"none"` \| `"dots"` \| `"grid"` \| `"glow"` \| `"food_burger"` \| `"food_pizza"` \| `"food_coffee"` \| `"food_cutlery"` \| `null`; \} | Merchant identity fields. Validated by [MerchantIdentitySchema](../validators/settings.md#merchantidentityschema). |
| `input.border_radius?` | `"0px"` \| `"0.25rem"` \| `"0.5rem"` \| `"1rem"` \| `"9999px"` \| `null` | - |
| `input.brand_color` | `string` \| `null` | - |
| `input.business_type` | `"food"` \| `"healthcare"` \| `"retail"` \| `"public_service"` | - |
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

### updateNotificationPreferencesAction()

```ts
function updateNotificationPreferencesAction(input): Promise<
  | {
  data: null;
}
  | {
  error: string;
}>;
```

Defined in: [lib/actions/settings.ts:710](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L710)

Update the merchant's notification preferences.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `input` | [`NotificationPreferencesInput`](#notificationpreferencesinput) |

#### Returns

`Promise`\<
  \| \{
  `data`: `null`;
\}
  \| \{
  `error`: `string`;
\}\>

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

Defined in: [lib/actions/settings.ts:315](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L315)

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

***

### updateScheduleAction()

```ts
function updateScheduleAction(schedule): Promise<
  | {
  data: null;
}
  | {
  error: string;
}>;
```

Defined in: [lib/actions/settings.ts:601](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L601)

Update the merchant's queue schedule (weekly + exception dates).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `schedule` | [`ScheduleData`](#scheduledata) \| `null` |

#### Returns

`Promise`\<
  \| \{
  `data`: `null`;
\}
  \| \{
  `error`: `string`;
\}\>

***

### updateThankYouMessageAction()

```ts
function updateThankYouMessageAction(message): Promise<
  | {
  data: null;
}
  | {
  error: string;
}>;
```

Defined in: [lib/actions/settings.ts:632](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L632)

Update the custom "thank you" message shown to clients when their ticket is completed.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `string` \| `null` |

#### Returns

`Promise`\<
  \| \{
  `data`: `null`;
\}
  \| \{
  `error`: `string`;
\}\>

***

### updateThankYouTitleAction()

```ts
function updateThankYouTitleAction(title): Promise<
  | {
  data: null;
}
  | {
  error: string;
}>;
```

Defined in: [lib/actions/settings.ts:661](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L661)

Update the custom title shown on the completed-ticket banner.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `title` | `string` \| `null` |

#### Returns

`Promise`\<
  \| \{
  `data`: `null`;
\}
  \| \{
  `error`: `string`;
\}\>

## Type Aliases

### BannedWord

```ts
type BannedWord = {
  created_at: string;
  id: string;
  word: string;
};
```

Defined in: [lib/actions/settings.ts:482](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L482)

#### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="created_at"></a> `created_at` | `string` | [lib/actions/settings.ts:485](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L485) |
| <a id="id"></a> `id` | `string` | [lib/actions/settings.ts:483](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L483) |
| <a id="word"></a> `word` | `string` | [lib/actions/settings.ts:484](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L484) |

***

### MerchantSettingsData

```ts
type MerchantSettingsData = {
  merchant: {
     avg_prep_computed_at: string | null;
     background_url: string | null;
     border_radius: string | null;
     brand_color: string | null;
     business_type: BusinessType;
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
     approaching_position_enabled: boolean;
     approaching_position_threshold: number;
     approaching_time_enabled: boolean;
     approaching_time_threshold_min: number;
     auto_close_enabled: boolean;
     max_capacity: number;
     notification_channels: NotificationChannels;
     notification_sound: string;
     notifications_enabled: boolean;
     qr_regenerated_at: string | null;
     schedule: ScheduleData | null;
     thank_you_message: string | null;
     thank_you_title: string | null;
     welcome_message: string | null;
  };
};
```

Defined in: [lib/actions/settings.ts:56](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L56)

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="merchant"></a> `merchant` | \{ `avg_prep_computed_at`: `string` \| `null`; `background_url`: `string` \| `null`; `border_radius`: `string` \| `null`; `brand_color`: `string` \| `null`; `business_type`: `BusinessType`; `calculated_avg_prep_time`: `number` \| `null`; `default_prep_time_min`: `number`; `font_family`: `string` \| `null`; `id`: `string`; `is_open`: `boolean`; `logo_url`: `string` \| `null`; `name`: `string`; `slug`: `string`; `theme_pattern`: `string` \| `null`; \} | - | [lib/actions/settings.ts:57](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L57) |
| `merchant.avg_prep_computed_at` | `string` \| `null` | UTC timestamp of the last `calculate_avg_prep()` run. | [lib/actions/settings.ts:73](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L73) |
| `merchant.background_url` | `string` \| `null` | - | [lib/actions/settings.ts:63](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L63) |
| `merchant.border_radius` | `string` \| `null` | - | [lib/actions/settings.ts:66](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L66) |
| `merchant.brand_color` | `string` \| `null` | - | [lib/actions/settings.ts:64](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L64) |
| `merchant.business_type` | `BusinessType` | - | [lib/actions/settings.ts:60](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L60) |
| `merchant.calculated_avg_prep_time` | `number` \| `null` | Auto-computed average prep time (IQR + EMA). `null` = not enough data yet. | [lib/actions/settings.ts:71](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L71) |
| `merchant.default_prep_time_min` | `number` | - | [lib/actions/settings.ts:68](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L68) |
| `merchant.font_family` | `string` \| `null` | - | [lib/actions/settings.ts:65](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L65) |
| `merchant.id` | `string` | - | [lib/actions/settings.ts:58](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L58) |
| `merchant.is_open` | `boolean` | - | [lib/actions/settings.ts:69](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L69) |
| `merchant.logo_url` | `string` \| `null` | - | [lib/actions/settings.ts:62](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L62) |
| `merchant.name` | `string` | - | [lib/actions/settings.ts:59](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L59) |
| `merchant.slug` | `string` | - | [lib/actions/settings.ts:61](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L61) |
| `merchant.theme_pattern` | `string` \| `null` | - | [lib/actions/settings.ts:67](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L67) |
| <a id="settings"></a> `settings` | \{ `approaching_position_enabled`: `boolean`; `approaching_position_threshold`: `number`; `approaching_time_enabled`: `boolean`; `approaching_time_threshold_min`: `number`; `auto_close_enabled`: `boolean`; `max_capacity`: `number`; `notification_channels`: [`NotificationChannels`](#notificationchannels); `notification_sound`: `string`; `notifications_enabled`: `boolean`; `qr_regenerated_at`: `string` \| `null`; `schedule`: [`ScheduleData`](#scheduledata) \| `null`; `thank_you_message`: `string` \| `null`; `thank_you_title`: `string` \| `null`; `welcome_message`: `string` \| `null`; \} | - | [lib/actions/settings.ts:75](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L75) |
| `settings.approaching_position_enabled` | `boolean` | - | [lib/actions/settings.ts:86](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L86) |
| `settings.approaching_position_threshold` | `number` | - | [lib/actions/settings.ts:87](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L87) |
| `settings.approaching_time_enabled` | `boolean` | - | [lib/actions/settings.ts:88](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L88) |
| `settings.approaching_time_threshold_min` | `number` | - | [lib/actions/settings.ts:89](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L89) |
| `settings.auto_close_enabled` | `boolean` | - | [lib/actions/settings.ts:82](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L82) |
| `settings.max_capacity` | `number` | - | [lib/actions/settings.ts:76](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L76) |
| `settings.notification_channels` | [`NotificationChannels`](#notificationchannels) | - | [lib/actions/settings.ts:84](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L84) |
| `settings.notification_sound` | `string` | - | [lib/actions/settings.ts:85](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L85) |
| `settings.notifications_enabled` | `boolean` | - | [lib/actions/settings.ts:81](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L81) |
| `settings.qr_regenerated_at` | `string` \| `null` | - | [lib/actions/settings.ts:80](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L80) |
| `settings.schedule` | [`ScheduleData`](#scheduledata) \| `null` | - | [lib/actions/settings.ts:83](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L83) |
| `settings.thank_you_message` | `string` \| `null` | - | [lib/actions/settings.ts:79](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L79) |
| `settings.thank_you_title` | `string` \| `null` | - | [lib/actions/settings.ts:78](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L78) |
| `settings.welcome_message` | `string` \| `null` | - | [lib/actions/settings.ts:77](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L77) |

***

### NotificationChannels

```ts
type NotificationChannels = {
  push: boolean;
  sound: boolean;
  toast: boolean;
  vibrate: boolean;
};
```

Defined in: [lib/actions/settings.ts:49](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L49)

#### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="push"></a> `push` | `boolean` | [lib/actions/settings.ts:53](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L53) |
| <a id="sound"></a> `sound` | `boolean` | [lib/actions/settings.ts:50](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L50) |
| <a id="toast"></a> `toast` | `boolean` | [lib/actions/settings.ts:52](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L52) |
| <a id="vibrate"></a> `vibrate` | `boolean` | [lib/actions/settings.ts:51](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L51) |

***

### NotificationPreferencesInput

```ts
type NotificationPreferencesInput = {
  approaching_position_enabled: boolean;
  approaching_position_threshold: number;
  approaching_time_enabled: boolean;
  approaching_time_threshold_min: number;
  notification_channels: NotificationChannels;
  notification_sound: string;
};
```

Defined in: [lib/actions/settings.ts:698](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L698)

#### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="approaching_position_enabled"></a> `approaching_position_enabled` | `boolean` | [lib/actions/settings.ts:701](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L701) |
| <a id="approaching_position_threshold"></a> `approaching_position_threshold` | `number` | [lib/actions/settings.ts:702](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L702) |
| <a id="approaching_time_enabled"></a> `approaching_time_enabled` | `boolean` | [lib/actions/settings.ts:703](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L703) |
| <a id="approaching_time_threshold_min"></a> `approaching_time_threshold_min` | `number` | [lib/actions/settings.ts:704](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L704) |
| <a id="notification_channels"></a> `notification_channels` | [`NotificationChannels`](#notificationchannels) | [lib/actions/settings.ts:699](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L699) |
| <a id="notification_sound"></a> `notification_sound` | `string` | [lib/actions/settings.ts:700](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L700) |

***

### ScheduleData

```ts
type ScheduleData = {
  exceptions: ScheduleException[];
  weekly: Record<string, WeeklyScheduleDay>;
};
```

Defined in: [lib/actions/settings.ts:44](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L44)

#### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="exceptions"></a> `exceptions` | [`ScheduleException`](#scheduleexception)[] | [lib/actions/settings.ts:46](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L46) |
| <a id="weekly"></a> `weekly` | `Record`\<`string`, [`WeeklyScheduleDay`](#weeklyscheduleday)\> | [lib/actions/settings.ts:45](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L45) |

***

### ScheduleException

```ts
type ScheduleException = {
  close?: string;
  closed?: boolean;
  date: string;
  open?: string;
};
```

Defined in: [lib/actions/settings.ts:37](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L37)

#### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="close"></a> `close?` | `string` | [lib/actions/settings.ts:41](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L41) |
| <a id="closed"></a> `closed?` | `boolean` | [lib/actions/settings.ts:39](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L39) |
| <a id="date"></a> `date` | `string` | [lib/actions/settings.ts:38](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L38) |
| <a id="open"></a> `open?` | `string` | [lib/actions/settings.ts:40](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L40) |

***

### WeeklyScheduleDay

```ts
type WeeklyScheduleDay =
  | {
  close: string;
  open: string;
}
  | null;
```

Defined in: [lib/actions/settings.ts:32](https://github.com/Atesta103/waitlight/blob/914be13e140824c8834a516e63f166105c33e322/lib/actions/settings.ts#L32)
