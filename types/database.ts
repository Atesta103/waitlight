/**
 * Supabase database types — auto-generated via:
 *   supabase gen types typescript --project-id <ref> > types/database.ts
 *
 * Until the Supabase project is connected, this file provides a minimal
 * placeholder so all helpers and actions compile correctly.
 *
 * TODO: replace with generated types once the Supabase project is set up.
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
                    created_at: string
                }
                Insert: {
                    id: string
                    name: string
                    slug: string
                    is_open?: boolean
                    avg_wait_time?: number | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    slug?: string
                    is_open?: boolean
                    avg_wait_time?: number | null
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
                }
                Insert: {
                    merchant_id: string
                    max_capacity?: number
                    welcome_message?: string | null
                    qr_regenerated_at?: string | null
                }
                Update: {
                    merchant_id?: string
                    max_capacity?: number
                    welcome_message?: string | null
                    qr_regenerated_at?: string | null
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
        Views: Record<string, never>
        Functions: {
            get_position: {
                Args: { ticket_id: string }
                Returns: number
            }
        }
        Enums: Record<string, never>
        CompositeTypes: Record<string, never>
    }
}
