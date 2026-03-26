export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      merchants: {
        Row: {
          avg_prep_computed_at: string | null
          avg_wait_time: number | null
          bypass_paywall: boolean
          calculated_avg_prep_time: number | null
          created_at: string
          default_prep_time_min: number
          id: string
          is_open: boolean
          logo_url: string | null
          name: string
          slug: string
          slug_last_changed_at: string | null
        }
        Insert: {
          avg_prep_computed_at?: string | null
          avg_wait_time?: number | null
          bypass_paywall?: boolean
          calculated_avg_prep_time?: number | null
          created_at?: string
          default_prep_time_min?: number
          id: string
          is_open?: boolean
          logo_url?: string | null
          name: string
          slug: string
          slug_last_changed_at?: string | null
        }
        Update: {
          avg_prep_computed_at?: string | null
          avg_wait_time?: number | null
          bypass_paywall?: boolean
          calculated_avg_prep_time?: number | null
          created_at?: string
          default_prep_time_min?: number
          id?: string
          is_open?: boolean
          logo_url?: string | null
          name?: string
          slug?: string
          slug_last_changed_at?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          queue_item_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          queue_item_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          queue_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_queue_item_id_fkey"
            columns: ["queue_item_id"]
            isOneToOne: false
            referencedRelation: "queue_items"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          merchant_id: string
          nonce: string
          used: boolean
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          merchant_id: string
          nonce: string
          used?: boolean
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          merchant_id?: string
          nonce?: string
          used?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "qr_tokens_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      queue_items: {
        Row: {
          called_at: string | null
          customer_name: string
          done_at: string | null
          id: string
          joined_at: string
          merchant_id: string
          status: string
        }
        Insert: {
          called_at?: string | null
          customer_name: string
          done_at?: string | null
          id?: string
          joined_at?: string
          merchant_id: string
          status?: string
        }
        Update: {
          called_at?: string | null
          customer_name?: string
          done_at?: string | null
          id?: string
          joined_at?: string
          merchant_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "queue_items_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          auto_close_enabled: boolean
          max_capacity: number
          merchant_id: string
          notifications_enabled: boolean
          qr_regenerated_at: string | null
          welcome_message: string | null
        }
        Insert: {
          auto_close_enabled?: boolean
          max_capacity?: number
          merchant_id: string
          notifications_enabled?: boolean
          qr_regenerated_at?: string | null
          welcome_message?: string | null
        }
        Update: {
          auto_close_enabled?: boolean
          max_capacity?: number
          merchant_id?: string
          notifications_enabled?: boolean
          qr_regenerated_at?: string | null
          welcome_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "settings_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: true
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          id: string
          merchant_id: string
          status: string
          stripe_customer_id: string
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          trial_end: string | null
          updated_at: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          id?: string
          merchant_id: string
          status?: string
          stripe_customer_id: string
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          id?: string
          merchant_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      merchant_analytics_view: {
        Row: {
          avg_wait_minutes: number | null
          day_of_week: number | null
          hour: number | null
          merchant_id: string | null
          ticket_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "queue_items_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calculate_avg_prep: {
        Args: { p_merchant_id: string }
        Returns: undefined
      }
      check_slug_available: {
        Args: { p_exclude_merchant_id?: string; p_slug: string }
        Returns: boolean
      }
      cleanup_expired_qr_tokens: { Args: never; Returns: number }
      get_analytics: {
        Args: { p_merchant_id: string }
        Returns: {
          avg_wait_minutes: number
          day_of_week: number
          hour: number
          ticket_count: number
        }[]
      }
      get_analytics_range: {
        Args: { p_end?: string; p_merchant_id: string; p_start?: string }
        Returns: {
          avg_wait_minutes: number
          day_of_week: number
          hour: number
          ticket_count: number
        }[]
      }
      get_position: { Args: { ticket_id: string }; Returns: number }
      validate_qr_token: {
        Args: { p_nonce: string; p_slug: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
