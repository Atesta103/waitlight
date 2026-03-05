[**Wait-Light Backend API**](README.md)

***

[Wait-Light Backend API](README.md) / database

# database

## Remarks

TODO: replace with generated types once the Supabase project is set up.

## Type Aliases

### Database

```ts
type Database = {
  public: {
     CompositeTypes: Record<string, never>;
     Enums: Record<string, never>;
     Functions: {
        check_slug_available: {
           Args: {
              p_exclude_merchant_id?: string;
              p_slug: string;
           };
           Returns: boolean;
        };
        get_position: {
           Args: {
              ticket_id: string;
           };
           Returns: number;
        };
        validate_qr_token: {
           Args: {
              p_nonce: string;
              p_slug: string;
           };
           Returns: boolean;
        };
     };
     Tables: {
        merchants: {
           Insert: {
              avg_wait_time?: number | null;
              created_at?: string;
              default_prep_time_min?: number;
              id: string;
              is_open?: boolean;
              logo_url?: string | null;
              name: string;
              slug: string;
              slug_last_changed_at?: string | null;
           };
           Relationships: [];
           Row: {
              avg_wait_time: number | null;
              created_at: string;
              default_prep_time_min: number;
              id: string;
              is_open: boolean;
              logo_url: string | null;
              name: string;
              slug: string;
              slug_last_changed_at: string | null;
           };
           Update: {
              avg_wait_time?: number | null;
              created_at?: string;
              default_prep_time_min?: number;
              id?: string;
              is_open?: boolean;
              logo_url?: string | null;
              name?: string;
              slug?: string;
              slug_last_changed_at?: string | null;
           };
        };
        push_subscriptions: {
           Insert: {
              auth: string;
              created_at?: string;
              endpoint: string;
              id?: string;
              p256dh: string;
              queue_item_id: string;
           };
           Relationships: [{
              columns: ["queue_item_id"];
              foreignKeyName: "push_subscriptions_queue_item_id_fkey";
              referencedColumns: ["id"];
              referencedRelation: "queue_items";
           }];
           Row: {
              auth: string;
              created_at: string;
              endpoint: string;
              id: string;
              p256dh: string;
              queue_item_id: string;
           };
           Update: {
              auth?: string;
              created_at?: string;
              endpoint?: string;
              id?: string;
              p256dh?: string;
              queue_item_id?: string;
           };
        };
        qr_tokens: {
           Insert: {
              created_at?: string;
              expires_at?: string;
              id?: string;
              merchant_id: string;
              nonce: string;
              used?: boolean;
           };
           Relationships: [{
              columns: ["merchant_id"];
              foreignKeyName: "qr_tokens_merchant_id_fkey";
              referencedColumns: ["id"];
              referencedRelation: "merchants";
           }];
           Row: {
              created_at: string;
              expires_at: string;
              id: string;
              merchant_id: string;
              nonce: string;
              used: boolean;
           };
           Update: {
              created_at?: string;
              expires_at?: string;
              id?: string;
              merchant_id?: string;
              nonce?: string;
              used?: boolean;
           };
        };
        queue_items: {
           Insert: {
              called_at?: string | null;
              customer_name: string;
              done_at?: string | null;
              id?: string;
              joined_at?: string;
              merchant_id: string;
              status?: "waiting" | "called" | "done" | "cancelled";
           };
           Relationships: [{
              columns: ["merchant_id"];
              foreignKeyName: "queue_items_merchant_id_fkey";
              referencedColumns: ["id"];
              referencedRelation: "merchants";
           }];
           Row: {
              called_at: string | null;
              customer_name: string;
              done_at: string | null;
              id: string;
              joined_at: string;
              merchant_id: string;
              status: "waiting" | "called" | "done" | "cancelled";
           };
           Update: {
              called_at?: string | null;
              customer_name?: string;
              done_at?: string | null;
              id?: string;
              joined_at?: string;
              merchant_id?: string;
              status?: "waiting" | "called" | "done" | "cancelled";
           };
        };
        settings: {
           Insert: {
              auto_close_enabled?: boolean;
              max_capacity?: number;
              merchant_id: string;
              notifications_enabled?: boolean;
              qr_regenerated_at?: string | null;
              welcome_message?: string | null;
           };
           Relationships: [{
              columns: ["merchant_id"];
              foreignKeyName: "settings_merchant_id_fkey";
              referencedColumns: ["id"];
              referencedRelation: "merchants";
           }];
           Row: {
              auto_close_enabled: boolean;
              max_capacity: number;
              merchant_id: string;
              notifications_enabled: boolean;
              qr_regenerated_at: string | null;
              welcome_message: string | null;
           };
           Update: {
              auto_close_enabled?: boolean;
              max_capacity?: number;
              merchant_id?: string;
              notifications_enabled?: boolean;
              qr_regenerated_at?: string | null;
              welcome_message?: string | null;
           };
        };
     };
     Views: Record<string, never>;
  };
};
```

Defined in: [types/database.ts:15](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L15)

#### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="public"></a> `public` | \{ `CompositeTypes`: `Record`\<`string`, `never`\>; `Enums`: `Record`\<`string`, `never`\>; `Functions`: \{ `check_slug_available`: \{ `Args`: \{ `p_exclude_merchant_id?`: `string`; `p_slug`: `string`; \}; `Returns`: `boolean`; \}; `get_position`: \{ `Args`: \{ `ticket_id`: `string`; \}; `Returns`: `number`; \}; `validate_qr_token`: \{ `Args`: \{ `p_nonce`: `string`; `p_slug`: `string`; \}; `Returns`: `boolean`; \}; \}; `Tables`: \{ `merchants`: \{ `Insert`: \{ `avg_wait_time?`: `number` \| `null`; `created_at?`: `string`; `default_prep_time_min?`: `number`; `id`: `string`; `is_open?`: `boolean`; `logo_url?`: `string` \| `null`; `name`: `string`; `slug`: `string`; `slug_last_changed_at?`: `string` \| `null`; \}; `Relationships`: \[\]; `Row`: \{ `avg_wait_time`: `number` \| `null`; `created_at`: `string`; `default_prep_time_min`: `number`; `id`: `string`; `is_open`: `boolean`; `logo_url`: `string` \| `null`; `name`: `string`; `slug`: `string`; `slug_last_changed_at`: `string` \| `null`; \}; `Update`: \{ `avg_wait_time?`: `number` \| `null`; `created_at?`: `string`; `default_prep_time_min?`: `number`; `id?`: `string`; `is_open?`: `boolean`; `logo_url?`: `string` \| `null`; `name?`: `string`; `slug?`: `string`; `slug_last_changed_at?`: `string` \| `null`; \}; \}; `push_subscriptions`: \{ `Insert`: \{ `auth`: `string`; `created_at?`: `string`; `endpoint`: `string`; `id?`: `string`; `p256dh`: `string`; `queue_item_id`: `string`; \}; `Relationships`: \[\{ `columns`: \[`"queue_item_id"`\]; `foreignKeyName`: `"push_subscriptions_queue_item_id_fkey"`; `referencedColumns`: \[`"id"`\]; `referencedRelation`: `"queue_items"`; \}\]; `Row`: \{ `auth`: `string`; `created_at`: `string`; `endpoint`: `string`; `id`: `string`; `p256dh`: `string`; `queue_item_id`: `string`; \}; `Update`: \{ `auth?`: `string`; `created_at?`: `string`; `endpoint?`: `string`; `id?`: `string`; `p256dh?`: `string`; `queue_item_id?`: `string`; \}; \}; `qr_tokens`: \{ `Insert`: \{ `created_at?`: `string`; `expires_at?`: `string`; `id?`: `string`; `merchant_id`: `string`; `nonce`: `string`; `used?`: `boolean`; \}; `Relationships`: \[\{ `columns`: \[`"merchant_id"`\]; `foreignKeyName`: `"qr_tokens_merchant_id_fkey"`; `referencedColumns`: \[`"id"`\]; `referencedRelation`: `"merchants"`; \}\]; `Row`: \{ `created_at`: `string`; `expires_at`: `string`; `id`: `string`; `merchant_id`: `string`; `nonce`: `string`; `used`: `boolean`; \}; `Update`: \{ `created_at?`: `string`; `expires_at?`: `string`; `id?`: `string`; `merchant_id?`: `string`; `nonce?`: `string`; `used?`: `boolean`; \}; \}; `queue_items`: \{ `Insert`: \{ `called_at?`: `string` \| `null`; `customer_name`: `string`; `done_at?`: `string` \| `null`; `id?`: `string`; `joined_at?`: `string`; `merchant_id`: `string`; `status?`: `"waiting"` \| `"called"` \| `"done"` \| `"cancelled"`; \}; `Relationships`: \[\{ `columns`: \[`"merchant_id"`\]; `foreignKeyName`: `"queue_items_merchant_id_fkey"`; `referencedColumns`: \[`"id"`\]; `referencedRelation`: `"merchants"`; \}\]; `Row`: \{ `called_at`: `string` \| `null`; `customer_name`: `string`; `done_at`: `string` \| `null`; `id`: `string`; `joined_at`: `string`; `merchant_id`: `string`; `status`: `"waiting"` \| `"called"` \| `"done"` \| `"cancelled"`; \}; `Update`: \{ `called_at?`: `string` \| `null`; `customer_name?`: `string`; `done_at?`: `string` \| `null`; `id?`: `string`; `joined_at?`: `string`; `merchant_id?`: `string`; `status?`: `"waiting"` \| `"called"` \| `"done"` \| `"cancelled"`; \}; \}; `settings`: \{ `Insert`: \{ `auto_close_enabled?`: `boolean`; `max_capacity?`: `number`; `merchant_id`: `string`; `notifications_enabled?`: `boolean`; `qr_regenerated_at?`: `string` \| `null`; `welcome_message?`: `string` \| `null`; \}; `Relationships`: \[\{ `columns`: \[`"merchant_id"`\]; `foreignKeyName`: `"settings_merchant_id_fkey"`; `referencedColumns`: \[`"id"`\]; `referencedRelation`: `"merchants"`; \}\]; `Row`: \{ `auto_close_enabled`: `boolean`; `max_capacity`: `number`; `merchant_id`: `string`; `notifications_enabled`: `boolean`; `qr_regenerated_at`: `string` \| `null`; `welcome_message`: `string` \| `null`; \}; `Update`: \{ `auto_close_enabled?`: `boolean`; `max_capacity?`: `number`; `merchant_id?`: `string`; `notifications_enabled?`: `boolean`; `qr_regenerated_at?`: `string` \| `null`; `welcome_message?`: `string` \| `null`; \}; \}; \}; `Views`: `Record`\<`string`, `never`\>; \} | [types/database.ts:16](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L16) |
| `public.CompositeTypes` | `Record`\<`string`, `never`\> | [types/database.ts:210](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L210) |
| `public.Enums` | `Record`\<`string`, `never`\> | [types/database.ts:209](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L209) |
| `public.Functions` | \{ `check_slug_available`: \{ `Args`: \{ `p_exclude_merchant_id?`: `string`; `p_slug`: `string`; \}; `Returns`: `boolean`; \}; `get_position`: \{ `Args`: \{ `ticket_id`: `string`; \}; `Returns`: `number`; \}; `validate_qr_token`: \{ `Args`: \{ `p_nonce`: `string`; `p_slug`: `string`; \}; `Returns`: `boolean`; \}; \} | [types/database.ts:195](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L195) |
| `public.Functions.check_slug_available` | \{ `Args`: \{ `p_exclude_merchant_id?`: `string`; `p_slug`: `string`; \}; `Returns`: `boolean`; \} | [types/database.ts:200](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L200) |
| `public.Functions.check_slug_available.Args` | \{ `p_exclude_merchant_id?`: `string`; `p_slug`: `string`; \} | [types/database.ts:201](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L201) |
| `public.Functions.check_slug_available.Args.p_exclude_merchant_id?` | `string` | [types/database.ts:201](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L201) |
| `public.Functions.check_slug_available.Args.p_slug` | `string` | [types/database.ts:201](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L201) |
| `public.Functions.check_slug_available.Returns` | `boolean` | [types/database.ts:202](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L202) |
| `public.Functions.get_position` | \{ `Args`: \{ `ticket_id`: `string`; \}; `Returns`: `number`; \} | [types/database.ts:196](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L196) |
| `public.Functions.get_position.Args` | \{ `ticket_id`: `string`; \} | [types/database.ts:197](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L197) |
| `public.Functions.get_position.Args.ticket_id` | `string` | [types/database.ts:197](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L197) |
| `public.Functions.get_position.Returns` | `number` | [types/database.ts:198](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L198) |
| `public.Functions.validate_qr_token` | \{ `Args`: \{ `p_nonce`: `string`; `p_slug`: `string`; \}; `Returns`: `boolean`; \} | [types/database.ts:204](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L204) |
| `public.Functions.validate_qr_token.Args` | \{ `p_nonce`: `string`; `p_slug`: `string`; \} | [types/database.ts:205](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L205) |
| `public.Functions.validate_qr_token.Args.p_nonce` | `string` | [types/database.ts:205](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L205) |
| `public.Functions.validate_qr_token.Args.p_slug` | `string` | [types/database.ts:205](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L205) |
| `public.Functions.validate_qr_token.Returns` | `boolean` | [types/database.ts:206](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L206) |
| `public.Tables` | \{ `merchants`: \{ `Insert`: \{ `avg_wait_time?`: `number` \| `null`; `created_at?`: `string`; `default_prep_time_min?`: `number`; `id`: `string`; `is_open?`: `boolean`; `logo_url?`: `string` \| `null`; `name`: `string`; `slug`: `string`; `slug_last_changed_at?`: `string` \| `null`; \}; `Relationships`: \[\]; `Row`: \{ `avg_wait_time`: `number` \| `null`; `created_at`: `string`; `default_prep_time_min`: `number`; `id`: `string`; `is_open`: `boolean`; `logo_url`: `string` \| `null`; `name`: `string`; `slug`: `string`; `slug_last_changed_at`: `string` \| `null`; \}; `Update`: \{ `avg_wait_time?`: `number` \| `null`; `created_at?`: `string`; `default_prep_time_min?`: `number`; `id?`: `string`; `is_open?`: `boolean`; `logo_url?`: `string` \| `null`; `name?`: `string`; `slug?`: `string`; `slug_last_changed_at?`: `string` \| `null`; \}; \}; `push_subscriptions`: \{ `Insert`: \{ `auth`: `string`; `created_at?`: `string`; `endpoint`: `string`; `id?`: `string`; `p256dh`: `string`; `queue_item_id`: `string`; \}; `Relationships`: \[\{ `columns`: \[`"queue_item_id"`\]; `foreignKeyName`: `"push_subscriptions_queue_item_id_fkey"`; `referencedColumns`: \[`"id"`\]; `referencedRelation`: `"queue_items"`; \}\]; `Row`: \{ `auth`: `string`; `created_at`: `string`; `endpoint`: `string`; `id`: `string`; `p256dh`: `string`; `queue_item_id`: `string`; \}; `Update`: \{ `auth?`: `string`; `created_at?`: `string`; `endpoint?`: `string`; `id?`: `string`; `p256dh?`: `string`; `queue_item_id?`: `string`; \}; \}; `qr_tokens`: \{ `Insert`: \{ `created_at?`: `string`; `expires_at?`: `string`; `id?`: `string`; `merchant_id`: `string`; `nonce`: `string`; `used?`: `boolean`; \}; `Relationships`: \[\{ `columns`: \[`"merchant_id"`\]; `foreignKeyName`: `"qr_tokens_merchant_id_fkey"`; `referencedColumns`: \[`"id"`\]; `referencedRelation`: `"merchants"`; \}\]; `Row`: \{ `created_at`: `string`; `expires_at`: `string`; `id`: `string`; `merchant_id`: `string`; `nonce`: `string`; `used`: `boolean`; \}; `Update`: \{ `created_at?`: `string`; `expires_at?`: `string`; `id?`: `string`; `merchant_id?`: `string`; `nonce?`: `string`; `used?`: `boolean`; \}; \}; `queue_items`: \{ `Insert`: \{ `called_at?`: `string` \| `null`; `customer_name`: `string`; `done_at?`: `string` \| `null`; `id?`: `string`; `joined_at?`: `string`; `merchant_id`: `string`; `status?`: `"waiting"` \| `"called"` \| `"done"` \| `"cancelled"`; \}; `Relationships`: \[\{ `columns`: \[`"merchant_id"`\]; `foreignKeyName`: `"queue_items_merchant_id_fkey"`; `referencedColumns`: \[`"id"`\]; `referencedRelation`: `"merchants"`; \}\]; `Row`: \{ `called_at`: `string` \| `null`; `customer_name`: `string`; `done_at`: `string` \| `null`; `id`: `string`; `joined_at`: `string`; `merchant_id`: `string`; `status`: `"waiting"` \| `"called"` \| `"done"` \| `"cancelled"`; \}; `Update`: \{ `called_at?`: `string` \| `null`; `customer_name?`: `string`; `done_at?`: `string` \| `null`; `id?`: `string`; `joined_at?`: `string`; `merchant_id?`: `string`; `status?`: `"waiting"` \| `"called"` \| `"done"` \| `"cancelled"`; \}; \}; `settings`: \{ `Insert`: \{ `auto_close_enabled?`: `boolean`; `max_capacity?`: `number`; `merchant_id`: `string`; `notifications_enabled?`: `boolean`; `qr_regenerated_at?`: `string` \| `null`; `welcome_message?`: `string` \| `null`; \}; `Relationships`: \[\{ `columns`: \[`"merchant_id"`\]; `foreignKeyName`: `"settings_merchant_id_fkey"`; `referencedColumns`: \[`"id"`\]; `referencedRelation`: `"merchants"`; \}\]; `Row`: \{ `auto_close_enabled`: `boolean`; `max_capacity`: `number`; `merchant_id`: `string`; `notifications_enabled`: `boolean`; `qr_regenerated_at`: `string` \| `null`; `welcome_message`: `string` \| `null`; \}; `Update`: \{ `auto_close_enabled?`: `boolean`; `max_capacity?`: `number`; `merchant_id?`: `string`; `notifications_enabled?`: `boolean`; `qr_regenerated_at?`: `string` \| `null`; `welcome_message?`: `string` \| `null`; \}; \}; \} | [types/database.ts:17](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L17) |
| `public.Tables.merchants` | \{ `Insert`: \{ `avg_wait_time?`: `number` \| `null`; `created_at?`: `string`; `default_prep_time_min?`: `number`; `id`: `string`; `is_open?`: `boolean`; `logo_url?`: `string` \| `null`; `name`: `string`; `slug`: `string`; `slug_last_changed_at?`: `string` \| `null`; \}; `Relationships`: \[\]; `Row`: \{ `avg_wait_time`: `number` \| `null`; `created_at`: `string`; `default_prep_time_min`: `number`; `id`: `string`; `is_open`: `boolean`; `logo_url`: `string` \| `null`; `name`: `string`; `slug`: `string`; `slug_last_changed_at`: `string` \| `null`; \}; `Update`: \{ `avg_wait_time?`: `number` \| `null`; `created_at?`: `string`; `default_prep_time_min?`: `number`; `id?`: `string`; `is_open?`: `boolean`; `logo_url?`: `string` \| `null`; `name?`: `string`; `slug?`: `string`; `slug_last_changed_at?`: `string` \| `null`; \}; \} | [types/database.ts:18](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L18) |
| `public.Tables.merchants.Insert` | \{ `avg_wait_time?`: `number` \| `null`; `created_at?`: `string`; `default_prep_time_min?`: `number`; `id`: `string`; `is_open?`: `boolean`; `logo_url?`: `string` \| `null`; `name`: `string`; `slug`: `string`; `slug_last_changed_at?`: `string` \| `null`; \} | [types/database.ts:30](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L30) |
| `public.Tables.merchants.Insert.avg_wait_time?` | `number` \| `null` | [types/database.ts:35](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L35) |
| `public.Tables.merchants.Insert.created_at?` | `string` | [types/database.ts:39](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L39) |
| `public.Tables.merchants.Insert.default_prep_time_min?` | `number` | [types/database.ts:37](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L37) |
| `public.Tables.merchants.Insert.id` | `string` | [types/database.ts:31](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L31) |
| `public.Tables.merchants.Insert.is_open?` | `boolean` | [types/database.ts:34](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L34) |
| `public.Tables.merchants.Insert.logo_url?` | `string` \| `null` | [types/database.ts:36](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L36) |
| `public.Tables.merchants.Insert.name` | `string` | [types/database.ts:32](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L32) |
| `public.Tables.merchants.Insert.slug` | `string` | [types/database.ts:33](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L33) |
| `public.Tables.merchants.Insert.slug_last_changed_at?` | `string` \| `null` | [types/database.ts:38](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L38) |
| `public.Tables.merchants.Relationships` | \[\] | [types/database.ts:52](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L52) |
| `public.Tables.merchants.Row` | \{ `avg_wait_time`: `number` \| `null`; `created_at`: `string`; `default_prep_time_min`: `number`; `id`: `string`; `is_open`: `boolean`; `logo_url`: `string` \| `null`; `name`: `string`; `slug`: `string`; `slug_last_changed_at`: `string` \| `null`; \} | [types/database.ts:19](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L19) |
| `public.Tables.merchants.Row.avg_wait_time` | `number` \| `null` | [types/database.ts:24](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L24) |
| `public.Tables.merchants.Row.created_at` | `string` | [types/database.ts:28](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L28) |
| `public.Tables.merchants.Row.default_prep_time_min` | `number` | [types/database.ts:26](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L26) |
| `public.Tables.merchants.Row.id` | `string` | [types/database.ts:20](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L20) |
| `public.Tables.merchants.Row.is_open` | `boolean` | [types/database.ts:23](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L23) |
| `public.Tables.merchants.Row.logo_url` | `string` \| `null` | [types/database.ts:25](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L25) |
| `public.Tables.merchants.Row.name` | `string` | [types/database.ts:21](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L21) |
| `public.Tables.merchants.Row.slug` | `string` | [types/database.ts:22](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L22) |
| `public.Tables.merchants.Row.slug_last_changed_at` | `string` \| `null` | [types/database.ts:27](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L27) |
| `public.Tables.merchants.Update` | \{ `avg_wait_time?`: `number` \| `null`; `created_at?`: `string`; `default_prep_time_min?`: `number`; `id?`: `string`; `is_open?`: `boolean`; `logo_url?`: `string` \| `null`; `name?`: `string`; `slug?`: `string`; `slug_last_changed_at?`: `string` \| `null`; \} | [types/database.ts:41](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L41) |
| `public.Tables.merchants.Update.avg_wait_time?` | `number` \| `null` | [types/database.ts:46](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L46) |
| `public.Tables.merchants.Update.created_at?` | `string` | [types/database.ts:50](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L50) |
| `public.Tables.merchants.Update.default_prep_time_min?` | `number` | [types/database.ts:48](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L48) |
| `public.Tables.merchants.Update.id?` | `string` | [types/database.ts:42](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L42) |
| `public.Tables.merchants.Update.is_open?` | `boolean` | [types/database.ts:45](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L45) |
| `public.Tables.merchants.Update.logo_url?` | `string` \| `null` | [types/database.ts:47](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L47) |
| `public.Tables.merchants.Update.name?` | `string` | [types/database.ts:43](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L43) |
| `public.Tables.merchants.Update.slug?` | `string` | [types/database.ts:44](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L44) |
| `public.Tables.merchants.Update.slug_last_changed_at?` | `string` \| `null` | [types/database.ts:49](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L49) |
| `public.Tables.push_subscriptions` | \{ `Insert`: \{ `auth`: `string`; `created_at?`: `string`; `endpoint`: `string`; `id?`: `string`; `p256dh`: `string`; `queue_item_id`: `string`; \}; `Relationships`: \[\{ `columns`: \[`"queue_item_id"`\]; `foreignKeyName`: `"push_subscriptions_queue_item_id_fkey"`; `referencedColumns`: \[`"id"`\]; `referencedRelation`: `"queue_items"`; \}\]; `Row`: \{ `auth`: `string`; `created_at`: `string`; `endpoint`: `string`; `id`: `string`; `p256dh`: `string`; `queue_item_id`: `string`; \}; `Update`: \{ `auth?`: `string`; `created_at?`: `string`; `endpoint?`: `string`; `id?`: `string`; `p256dh?`: `string`; `queue_item_id?`: `string`; \}; \} | [types/database.ts:159](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L159) |
| `public.Tables.push_subscriptions.Insert` | \{ `auth`: `string`; `created_at?`: `string`; `endpoint`: `string`; `id?`: `string`; `p256dh`: `string`; `queue_item_id`: `string`; \} | [types/database.ts:168](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L168) |
| `public.Tables.push_subscriptions.Insert.auth` | `string` | [types/database.ts:173](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L173) |
| `public.Tables.push_subscriptions.Insert.created_at?` | `string` | [types/database.ts:174](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L174) |
| `public.Tables.push_subscriptions.Insert.endpoint` | `string` | [types/database.ts:171](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L171) |
| `public.Tables.push_subscriptions.Insert.id?` | `string` | [types/database.ts:169](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L169) |
| `public.Tables.push_subscriptions.Insert.p256dh` | `string` | [types/database.ts:172](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L172) |
| `public.Tables.push_subscriptions.Insert.queue_item_id` | `string` | [types/database.ts:170](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L170) |
| `public.Tables.push_subscriptions.Relationships` | \[\{ `columns`: \[`"queue_item_id"`\]; `foreignKeyName`: `"push_subscriptions_queue_item_id_fkey"`; `referencedColumns`: \[`"id"`\]; `referencedRelation`: `"queue_items"`; \}\] | [types/database.ts:184](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L184) |
| `public.Tables.push_subscriptions.Row` | \{ `auth`: `string`; `created_at`: `string`; `endpoint`: `string`; `id`: `string`; `p256dh`: `string`; `queue_item_id`: `string`; \} | [types/database.ts:160](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L160) |
| `public.Tables.push_subscriptions.Row.auth` | `string` | [types/database.ts:165](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L165) |
| `public.Tables.push_subscriptions.Row.created_at` | `string` | [types/database.ts:166](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L166) |
| `public.Tables.push_subscriptions.Row.endpoint` | `string` | [types/database.ts:163](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L163) |
| `public.Tables.push_subscriptions.Row.id` | `string` | [types/database.ts:161](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L161) |
| `public.Tables.push_subscriptions.Row.p256dh` | `string` | [types/database.ts:164](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L164) |
| `public.Tables.push_subscriptions.Row.queue_item_id` | `string` | [types/database.ts:162](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L162) |
| `public.Tables.push_subscriptions.Update` | \{ `auth?`: `string`; `created_at?`: `string`; `endpoint?`: `string`; `id?`: `string`; `p256dh?`: `string`; `queue_item_id?`: `string`; \} | [types/database.ts:176](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L176) |
| `public.Tables.push_subscriptions.Update.auth?` | `string` | [types/database.ts:181](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L181) |
| `public.Tables.push_subscriptions.Update.created_at?` | `string` | [types/database.ts:182](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L182) |
| `public.Tables.push_subscriptions.Update.endpoint?` | `string` | [types/database.ts:179](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L179) |
| `public.Tables.push_subscriptions.Update.id?` | `string` | [types/database.ts:177](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L177) |
| `public.Tables.push_subscriptions.Update.p256dh?` | `string` | [types/database.ts:180](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L180) |
| `public.Tables.push_subscriptions.Update.queue_item_id?` | `string` | [types/database.ts:178](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L178) |
| `public.Tables.qr_tokens` | \{ `Insert`: \{ `created_at?`: `string`; `expires_at?`: `string`; `id?`: `string`; `merchant_id`: `string`; `nonce`: `string`; `used?`: `boolean`; \}; `Relationships`: \[\{ `columns`: \[`"merchant_id"`\]; `foreignKeyName`: `"qr_tokens_merchant_id_fkey"`; `referencedColumns`: \[`"id"`\]; `referencedRelation`: `"merchants"`; \}\]; `Row`: \{ `created_at`: `string`; `expires_at`: `string`; `id`: `string`; `merchant_id`: `string`; `nonce`: `string`; `used`: `boolean`; \}; `Update`: \{ `created_at?`: `string`; `expires_at?`: `string`; `id?`: `string`; `merchant_id?`: `string`; `nonce?`: `string`; `used?`: `boolean`; \}; \} | [types/database.ts:125](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L125) |
| `public.Tables.qr_tokens.Insert` | \{ `created_at?`: `string`; `expires_at?`: `string`; `id?`: `string`; `merchant_id`: `string`; `nonce`: `string`; `used?`: `boolean`; \} | [types/database.ts:134](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L134) |
| `public.Tables.qr_tokens.Insert.created_at?` | `string` | [types/database.ts:139](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L139) |
| `public.Tables.qr_tokens.Insert.expires_at?` | `string` | [types/database.ts:140](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L140) |
| `public.Tables.qr_tokens.Insert.id?` | `string` | [types/database.ts:135](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L135) |
| `public.Tables.qr_tokens.Insert.merchant_id` | `string` | [types/database.ts:136](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L136) |
| `public.Tables.qr_tokens.Insert.nonce` | `string` | [types/database.ts:137](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L137) |
| `public.Tables.qr_tokens.Insert.used?` | `boolean` | [types/database.ts:138](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L138) |
| `public.Tables.qr_tokens.Relationships` | \[\{ `columns`: \[`"merchant_id"`\]; `foreignKeyName`: `"qr_tokens_merchant_id_fkey"`; `referencedColumns`: \[`"id"`\]; `referencedRelation`: `"merchants"`; \}\] | [types/database.ts:150](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L150) |
| `public.Tables.qr_tokens.Row` | \{ `created_at`: `string`; `expires_at`: `string`; `id`: `string`; `merchant_id`: `string`; `nonce`: `string`; `used`: `boolean`; \} | [types/database.ts:126](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L126) |
| `public.Tables.qr_tokens.Row.created_at` | `string` | [types/database.ts:131](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L131) |
| `public.Tables.qr_tokens.Row.expires_at` | `string` | [types/database.ts:132](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L132) |
| `public.Tables.qr_tokens.Row.id` | `string` | [types/database.ts:127](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L127) |
| `public.Tables.qr_tokens.Row.merchant_id` | `string` | [types/database.ts:128](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L128) |
| `public.Tables.qr_tokens.Row.nonce` | `string` | [types/database.ts:129](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L129) |
| `public.Tables.qr_tokens.Row.used` | `boolean` | [types/database.ts:130](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L130) |
| `public.Tables.qr_tokens.Update` | \{ `created_at?`: `string`; `expires_at?`: `string`; `id?`: `string`; `merchant_id?`: `string`; `nonce?`: `string`; `used?`: `boolean`; \} | [types/database.ts:142](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L142) |
| `public.Tables.qr_tokens.Update.created_at?` | `string` | [types/database.ts:147](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L147) |
| `public.Tables.qr_tokens.Update.expires_at?` | `string` | [types/database.ts:148](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L148) |
| `public.Tables.qr_tokens.Update.id?` | `string` | [types/database.ts:143](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L143) |
| `public.Tables.qr_tokens.Update.merchant_id?` | `string` | [types/database.ts:144](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L144) |
| `public.Tables.qr_tokens.Update.nonce?` | `string` | [types/database.ts:145](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L145) |
| `public.Tables.qr_tokens.Update.used?` | `boolean` | [types/database.ts:146](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L146) |
| `public.Tables.queue_items` | \{ `Insert`: \{ `called_at?`: `string` \| `null`; `customer_name`: `string`; `done_at?`: `string` \| `null`; `id?`: `string`; `joined_at?`: `string`; `merchant_id`: `string`; `status?`: `"waiting"` \| `"called"` \| `"done"` \| `"cancelled"`; \}; `Relationships`: \[\{ `columns`: \[`"merchant_id"`\]; `foreignKeyName`: `"queue_items_merchant_id_fkey"`; `referencedColumns`: \[`"id"`\]; `referencedRelation`: `"merchants"`; \}\]; `Row`: \{ `called_at`: `string` \| `null`; `customer_name`: `string`; `done_at`: `string` \| `null`; `id`: `string`; `joined_at`: `string`; `merchant_id`: `string`; `status`: `"waiting"` \| `"called"` \| `"done"` \| `"cancelled"`; \}; `Update`: \{ `called_at?`: `string` \| `null`; `customer_name?`: `string`; `done_at?`: `string` \| `null`; `id?`: `string`; `joined_at?`: `string`; `merchant_id?`: `string`; `status?`: `"waiting"` \| `"called"` \| `"done"` \| `"cancelled"`; \}; \} | [types/database.ts:54](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L54) |
| `public.Tables.queue_items.Insert` | \{ `called_at?`: `string` \| `null`; `customer_name`: `string`; `done_at?`: `string` \| `null`; `id?`: `string`; `joined_at?`: `string`; `merchant_id`: `string`; `status?`: `"waiting"` \| `"called"` \| `"done"` \| `"cancelled"`; \} | [types/database.ts:64](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L64) |
| `public.Tables.queue_items.Insert.called_at?` | `string` \| `null` | [types/database.ts:70](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L70) |
| `public.Tables.queue_items.Insert.customer_name` | `string` | [types/database.ts:67](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L67) |
| `public.Tables.queue_items.Insert.done_at?` | `string` \| `null` | [types/database.ts:71](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L71) |
| `public.Tables.queue_items.Insert.id?` | `string` | [types/database.ts:65](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L65) |
| `public.Tables.queue_items.Insert.joined_at?` | `string` | [types/database.ts:69](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L69) |
| `public.Tables.queue_items.Insert.merchant_id` | `string` | [types/database.ts:66](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L66) |
| `public.Tables.queue_items.Insert.status?` | `"waiting"` \| `"called"` \| `"done"` \| `"cancelled"` | [types/database.ts:68](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L68) |
| `public.Tables.queue_items.Relationships` | \[\{ `columns`: \[`"merchant_id"`\]; `foreignKeyName`: `"queue_items_merchant_id_fkey"`; `referencedColumns`: \[`"id"`\]; `referencedRelation`: `"merchants"`; \}\] | [types/database.ts:82](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L82) |
| `public.Tables.queue_items.Row` | \{ `called_at`: `string` \| `null`; `customer_name`: `string`; `done_at`: `string` \| `null`; `id`: `string`; `joined_at`: `string`; `merchant_id`: `string`; `status`: `"waiting"` \| `"called"` \| `"done"` \| `"cancelled"`; \} | [types/database.ts:55](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L55) |
| `public.Tables.queue_items.Row.called_at` | `string` \| `null` | [types/database.ts:61](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L61) |
| `public.Tables.queue_items.Row.customer_name` | `string` | [types/database.ts:58](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L58) |
| `public.Tables.queue_items.Row.done_at` | `string` \| `null` | [types/database.ts:62](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L62) |
| `public.Tables.queue_items.Row.id` | `string` | [types/database.ts:56](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L56) |
| `public.Tables.queue_items.Row.joined_at` | `string` | [types/database.ts:60](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L60) |
| `public.Tables.queue_items.Row.merchant_id` | `string` | [types/database.ts:57](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L57) |
| `public.Tables.queue_items.Row.status` | `"waiting"` \| `"called"` \| `"done"` \| `"cancelled"` | [types/database.ts:59](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L59) |
| `public.Tables.queue_items.Update` | \{ `called_at?`: `string` \| `null`; `customer_name?`: `string`; `done_at?`: `string` \| `null`; `id?`: `string`; `joined_at?`: `string`; `merchant_id?`: `string`; `status?`: `"waiting"` \| `"called"` \| `"done"` \| `"cancelled"`; \} | [types/database.ts:73](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L73) |
| `public.Tables.queue_items.Update.called_at?` | `string` \| `null` | [types/database.ts:79](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L79) |
| `public.Tables.queue_items.Update.customer_name?` | `string` | [types/database.ts:76](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L76) |
| `public.Tables.queue_items.Update.done_at?` | `string` \| `null` | [types/database.ts:80](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L80) |
| `public.Tables.queue_items.Update.id?` | `string` | [types/database.ts:74](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L74) |
| `public.Tables.queue_items.Update.joined_at?` | `string` | [types/database.ts:78](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L78) |
| `public.Tables.queue_items.Update.merchant_id?` | `string` | [types/database.ts:75](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L75) |
| `public.Tables.queue_items.Update.status?` | `"waiting"` \| `"called"` \| `"done"` \| `"cancelled"` | [types/database.ts:77](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L77) |
| `public.Tables.settings` | \{ `Insert`: \{ `auto_close_enabled?`: `boolean`; `max_capacity?`: `number`; `merchant_id`: `string`; `notifications_enabled?`: `boolean`; `qr_regenerated_at?`: `string` \| `null`; `welcome_message?`: `string` \| `null`; \}; `Relationships`: \[\{ `columns`: \[`"merchant_id"`\]; `foreignKeyName`: `"settings_merchant_id_fkey"`; `referencedColumns`: \[`"id"`\]; `referencedRelation`: `"merchants"`; \}\]; `Row`: \{ `auto_close_enabled`: `boolean`; `max_capacity`: `number`; `merchant_id`: `string`; `notifications_enabled`: `boolean`; `qr_regenerated_at`: `string` \| `null`; `welcome_message`: `string` \| `null`; \}; `Update`: \{ `auto_close_enabled?`: `boolean`; `max_capacity?`: `number`; `merchant_id?`: `string`; `notifications_enabled?`: `boolean`; `qr_regenerated_at?`: `string` \| `null`; `welcome_message?`: `string` \| `null`; \}; \} | [types/database.ts:91](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L91) |
| `public.Tables.settings.Insert` | \{ `auto_close_enabled?`: `boolean`; `max_capacity?`: `number`; `merchant_id`: `string`; `notifications_enabled?`: `boolean`; `qr_regenerated_at?`: `string` \| `null`; `welcome_message?`: `string` \| `null`; \} | [types/database.ts:100](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L100) |
| `public.Tables.settings.Insert.auto_close_enabled?` | `boolean` | [types/database.ts:106](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L106) |
| `public.Tables.settings.Insert.max_capacity?` | `number` | [types/database.ts:102](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L102) |
| `public.Tables.settings.Insert.merchant_id` | `string` | [types/database.ts:101](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L101) |
| `public.Tables.settings.Insert.notifications_enabled?` | `boolean` | [types/database.ts:105](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L105) |
| `public.Tables.settings.Insert.qr_regenerated_at?` | `string` \| `null` | [types/database.ts:104](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L104) |
| `public.Tables.settings.Insert.welcome_message?` | `string` \| `null` | [types/database.ts:103](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L103) |
| `public.Tables.settings.Relationships` | \[\{ `columns`: \[`"merchant_id"`\]; `foreignKeyName`: `"settings_merchant_id_fkey"`; `referencedColumns`: \[`"id"`\]; `referencedRelation`: `"merchants"`; \}\] | [types/database.ts:116](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L116) |
| `public.Tables.settings.Row` | \{ `auto_close_enabled`: `boolean`; `max_capacity`: `number`; `merchant_id`: `string`; `notifications_enabled`: `boolean`; `qr_regenerated_at`: `string` \| `null`; `welcome_message`: `string` \| `null`; \} | [types/database.ts:92](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L92) |
| `public.Tables.settings.Row.auto_close_enabled` | `boolean` | [types/database.ts:98](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L98) |
| `public.Tables.settings.Row.max_capacity` | `number` | [types/database.ts:94](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L94) |
| `public.Tables.settings.Row.merchant_id` | `string` | [types/database.ts:93](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L93) |
| `public.Tables.settings.Row.notifications_enabled` | `boolean` | [types/database.ts:97](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L97) |
| `public.Tables.settings.Row.qr_regenerated_at` | `string` \| `null` | [types/database.ts:96](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L96) |
| `public.Tables.settings.Row.welcome_message` | `string` \| `null` | [types/database.ts:95](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L95) |
| `public.Tables.settings.Update` | \{ `auto_close_enabled?`: `boolean`; `max_capacity?`: `number`; `merchant_id?`: `string`; `notifications_enabled?`: `boolean`; `qr_regenerated_at?`: `string` \| `null`; `welcome_message?`: `string` \| `null`; \} | [types/database.ts:108](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L108) |
| `public.Tables.settings.Update.auto_close_enabled?` | `boolean` | [types/database.ts:114](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L114) |
| `public.Tables.settings.Update.max_capacity?` | `number` | [types/database.ts:110](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L110) |
| `public.Tables.settings.Update.merchant_id?` | `string` | [types/database.ts:109](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L109) |
| `public.Tables.settings.Update.notifications_enabled?` | `boolean` | [types/database.ts:113](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L113) |
| `public.Tables.settings.Update.qr_regenerated_at?` | `string` \| `null` | [types/database.ts:112](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L112) |
| `public.Tables.settings.Update.welcome_message?` | `string` \| `null` | [types/database.ts:111](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L111) |
| `public.Views` | `Record`\<`string`, `never`\> | [types/database.ts:194](https://github.com/Atesta103/waitlight/blob/abf23b09a97421ec75e06e7b3316f9a069100e58/types/database.ts#L194) |
