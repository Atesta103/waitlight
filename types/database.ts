/**
 * @module database
 * @category Types
 *
 * Supabase database types — auto-generated via:
 * ```sh
 * supabase gen types typescript --project-id <ref> > types/database.ts
 * ```
 *
 * Until the Supabase project is connected, this file provides a minimal
 * placeholder so all helpers and actions compile correctly.
 *
 * @remarks TODO: replace with generated types once the Supabase project is set up.
 */
export type Database = {
    public: {
        Tables: {
            merchants: {
                Row: {
                    id: string
                    name: string
                    slug: string
                    is_open: boolean
                    avg_wait_time: number | null
                    logo_url: string | null
                    default_prep_time_min: number
                    slug_last_changed_at: string | null
                    created_at: string
                }
                Insert: {
                    id: string
                    name: string
                    slug: string
                    is_open?: boolean
                    avg_wait_time?: number | null
                    logo_url?: string | null
                    default_prep_time_min?: number
                    slug_last_changed_at?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    slug?: string
                    is_open?: boolean
                    avg_wait_time?: number | null
                    logo_url?: string | null
                    default_prep_time_min?: number
                    slug_last_changed_at?: string | null
                    created_at?: string
                }
                Relationships: []
            }
            queue_items: {
                Row: {
                    id: string
                    merchant_id: string
                    customer_name: string
                    status: "waiting" | "called" | "done" | "cancelled"
                    joined_at: string
                    called_at: string | null
                    done_at: string | null
                }
                Insert: {
                    id?: string
                    merchant_id: string
                    customer_name: string
                    status?: "waiting" | "called" | "done" | "cancelled"
                    joined_at?: string
                    called_at?: string | null
                    done_at?: string | null
                }
                Update: {
                    id?: string
                    merchant_id?: string
                    customer_name?: string
                    status?: "waiting" | "called" | "done" | "cancelled"
                    joined_at?: string
                    called_at?: string | null
                    done_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "queue_items_merchant_id_fkey"
                        columns: ["merchant_id"]
                        referencedRelation: "merchants"
                        referencedColumns: ["id"]
                    },
                ]
            }
            settings: {
                Row: {
                    merchant_id: string
                    max_capacity: number
                    welcome_message: string | null
                    qr_regenerated_at: string | null
                    notifications_enabled: boolean
                    auto_close_enabled: boolean
                }
                Insert: {
                    merchant_id: string
                    max_capacity?: number
                    welcome_message?: string | null
                    qr_regenerated_at?: string | null
                    notifications_enabled?: boolean
                    auto_close_enabled?: boolean
                }
                Update: {
                    merchant_id?: string
                    max_capacity?: number
                    welcome_message?: string | null
                    qr_regenerated_at?: string | null
                    notifications_enabled?: boolean
                    auto_close_enabled?: boolean
                }
                Relationships: [
                    {
                        foreignKeyName: "settings_merchant_id_fkey"
                        columns: ["merchant_id"]
                        referencedRelation: "merchants"
                        referencedColumns: ["id"]
                    },
                ]
            }
            qr_tokens: {
                Row: {
                    id: string
                    merchant_id: string
                    nonce: string
                    used: boolean
                    created_at: string
                    expires_at: string
                }
                Insert: {
                    id?: string
                    merchant_id: string
                    nonce: string
                    used?: boolean
                    created_at?: string
                    expires_at?: string
                }
                Update: {
                    id?: string
                    merchant_id?: string
                    nonce?: string
                    used?: boolean
                    created_at?: string
                    expires_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "qr_tokens_merchant_id_fkey"
                        columns: ["merchant_id"]
                        referencedRelation: "merchants"
                        referencedColumns: ["id"]
                    },
                ]
            }
            subscriptions: {
                Row: {
                    id: string
                    merchant_id: string
                    stripe_customer_id: string
                    stripe_subscription_id: string | null
                    stripe_price_id: string | null
                    status: string
                    trial_end: string | null
                    current_period_end: string | null
                    cancel_at_period_end: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    merchant_id: string
                    stripe_customer_id: string
                    stripe_subscription_id?: string | null
                    stripe_price_id?: string | null
                    status?: string
                    trial_end?: string | null
                    current_period_end?: string | null
                    cancel_at_period_end?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    merchant_id?: string
                    stripe_customer_id?: string
                    stripe_subscription_id?: string | null
                    stripe_price_id?: string | null
                    status?: string
                    trial_end?: string | null
                    current_period_end?: string | null
                    cancel_at_period_end?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "subscriptions_merchant_id_fkey"
                        columns: ["merchant_id"]
                        referencedRelation: "merchants"
                        referencedColumns: ["id"]
                    },
                ]
            }
            push_subscriptions: {
                Row: {
                    id: string
                    queue_item_id: string
                    endpoint: string
                    p256dh: string
                    auth: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    queue_item_id: string
                    endpoint: string
                    p256dh: string
                    auth: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    queue_item_id?: string
                    endpoint?: string
                    p256dh?: string
                    auth?: string
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "push_subscriptions_queue_item_id_fkey"
                        columns: ["queue_item_id"]
                        referencedRelation: "queue_items"
                        referencedColumns: ["id"]
                    },
                ]
            }
        }
        Views: {
            merchant_analytics_view: {
                Row: {
                    merchant_id: string
                    day_of_week: number
                    hour: number
                    ticket_count: number
                    avg_wait_minutes: number | null
                }
            }
        }
        Functions: {
            get_position: {
                Args: { ticket_id: string }
                Returns: number
            }
            check_slug_available: {
                Args: { p_slug: string; p_exclude_merchant_id?: string }
                Returns: boolean
            }
            validate_qr_token: {
                Args: { p_nonce: string; p_slug: string }
                Returns: boolean
            }
            get_analytics: {
                Args: { p_merchant_id: string }
                Returns: {
                    day_of_week: number
                    hour: number
                    ticket_count: number
                    avg_wait_minutes: number | null
                }[]
            }
            get_analytics_range: {
                Args: {
                    p_merchant_id: string
                    p_start?: string | null
                    p_end?: string | null
                }
                Returns: {
                    day_of_week: number
                    hour: number
                    ticket_count: number
                    avg_wait_minutes: number | null
                }[]
            }
        }
        Enums: Record<string, never>
        CompositeTypes: Record<string, never>
    }
}
