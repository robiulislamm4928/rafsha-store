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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          text: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          text: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          text?: string
        }
        Relationships: []
      }
      banners: {
        Row: {
          created_at: string
          cta_label: string | null
          cta_link: string | null
          desktop_image_url: string
          display_order: number
          heading: string | null
          id: string
          is_active: boolean
          mobile_image_url: string | null
          subtext: string | null
          type: string
        }
        Insert: {
          created_at?: string
          cta_label?: string | null
          cta_link?: string | null
          desktop_image_url: string
          display_order?: number
          heading?: string | null
          id?: string
          is_active?: boolean
          mobile_image_url?: string | null
          subtext?: string | null
          type: string
        }
        Update: {
          created_at?: string
          cta_label?: string | null
          cta_link?: string | null
          desktop_image_url?: string
          display_order?: number
          heading?: string | null
          id?: string
          is_active?: boolean
          mobile_image_url?: string | null
          subtext?: string | null
          type?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          display_order: number
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          parent_id: string | null
          slug: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          parent_id?: string | null
          slug: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          parent_id?: string | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      incomplete_orders: {
        Row: {
          cart_snapshot: Json | null
          created_at: string
          id: string
          phone: string | null
          total_value: number | null
        }
        Insert: {
          cart_snapshot?: Json | null
          created_at?: string
          id?: string
          phone?: string | null
          total_value?: number | null
        }
        Update: {
          cart_snapshot?: Json | null
          created_at?: string
          id?: string
          phone?: string | null
          total_value?: number | null
        }
        Relationships: []
      }
      login_sessions: {
        Row: {
          browser: string | null
          device_type: string
          id: string
          ip_address: string | null
          is_active: boolean
          last_seen_at: string | null
          location_info: string | null
          logged_out_at: string | null
          login_at: string
          login_success: boolean
          user_agent: string | null
          user_email: string
          user_id: string
        }
        Insert: {
          browser?: string | null
          device_type?: string
          id?: string
          ip_address?: string | null
          is_active?: boolean
          last_seen_at?: string | null
          location_info?: string | null
          logged_out_at?: string | null
          login_at?: string
          login_success?: boolean
          user_agent?: string | null
          user_email: string
          user_id: string
        }
        Update: {
          browser?: string | null
          device_type?: string
          id?: string
          ip_address?: string | null
          is_active?: boolean
          last_seen_at?: string | null
          location_info?: string | null
          logged_out_at?: string | null
          login_at?: string
          login_success?: boolean
          user_agent?: string | null
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          item_total: number
          order_id: string
          product_id: string
          product_name_snapshot: string
          quantity: number
          unit_price_snapshot: number
          variant_label_snapshot: string | null
        }
        Insert: {
          id?: string
          item_total: number
          order_id: string
          product_id: string
          product_name_snapshot: string
          quantity: number
          unit_price_snapshot: number
          variant_label_snapshot?: string | null
        }
        Update: {
          id?: string
          item_total?: number
          order_id?: string
          product_id?: string
          product_name_snapshot?: string
          quantity?: number
          unit_price_snapshot?: number
          variant_label_snapshot?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_at: string
          id: string
          note: string | null
          order_id: string
          status: string
        }
        Insert: {
          changed_at?: string
          id?: string
          note?: string | null
          order_id: string
          status: string
        }
        Update: {
          changed_at?: string
          id?: string
          note?: string | null
          order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          admin_note: string | null
          advance_paid: number
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          delivery_address: string
          delivery_charge: number
          delivery_note: string | null
          discount_amount: number
          district: string
          due_on_delivery: number
          id: string
          order_number: string
          order_status: string
          payment_method: string
          payment_status: string
          subtotal: number
          total_amount: number
          uddoktapay_transaction_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_note?: string | null
          advance_paid?: number
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          delivery_address: string
          delivery_charge?: number
          delivery_note?: string | null
          discount_amount?: number
          district: string
          due_on_delivery: number
          id?: string
          order_number: string
          order_status?: string
          payment_method: string
          payment_status?: string
          subtotal: number
          total_amount: number
          uddoktapay_transaction_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_note?: string | null
          advance_paid?: number
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          delivery_address?: string
          delivery_charge?: number
          delivery_note?: string | null
          discount_amount?: number
          district?: string
          due_on_delivery?: number
          id?: string
          order_number?: string
          order_status?: string
          payment_method?: string
          payment_status?: string
          subtotal?: number
          total_amount?: number
          uddoktapay_transaction_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      page_views: {
        Row: {
          created_at: string
          event_type: string
          id: string
          ip_hash: string | null
          page_path: string
          referrer: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          event_type?: string
          id?: string
          ip_hash?: string | null
          page_path?: string
          referrer?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          ip_hash?: string | null
          page_path?: string
          referrer?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      product_images: {
        Row: {
          created_at: string
          display_order: number
          id: string
          image_url: string
          product_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          product_id: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          price_adjustment: number
          product_id: string
          stock_quantity: number
          variant_label: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          price_adjustment?: number
          product_id: string
          stock_quantity?: number
          variant_label: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          price_adjustment?: number
          product_id?: string
          stock_quantity?: number
          variant_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string
          full_description: string | null
          id: string
          is_active: boolean
          is_featured: boolean
          name: string
          regular_price: number
          sale_price: number | null
          short_description: string | null
          sku: string | null
          slug: string
          stock_quantity: number
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          full_description?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          name: string
          regular_price: number
          sale_price?: number | null
          short_description?: string | null
          sku?: string | null
          slug: string
          stock_quantity?: number
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          full_description?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          name?: string
          regular_price?: number
          sale_price?: number | null
          short_description?: string | null
          sku?: string | null
          slug?: string
          stock_quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          created_at: string
          id: string
          is_approved: boolean
          product_id: string
          rating: number
          review_text: string | null
          reviewer_location: string | null
          reviewer_name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_approved?: boolean
          product_id: string
          rating: number
          review_text?: string | null
          reviewer_location?: string | null
          reviewer_name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_approved?: boolean
          product_id?: string
          rating?: number
          review_text?: string | null
          reviewer_location?: string | null
          reviewer_name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_zones: {
        Row: {
          created_at: string
          delivery_charge: number
          id: string
          is_active: boolean
          zone_name: string
        }
        Insert: {
          created_at?: string
          delivery_charge?: number
          id?: string
          is_active?: boolean
          zone_name: string
        }
        Update: {
          created_at?: string
          delivery_charge?: number
          id?: string
          is_active?: boolean
          zone_name?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value?: string
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          default_address: string | null
          default_district: string | null
          email: string
          full_name: string
          id: string
          is_blocked: boolean
          phone: string | null
        }
        Insert: {
          created_at?: string
          default_address?: string | null
          default_district?: string | null
          email: string
          full_name: string
          id: string
          is_blocked?: boolean
          phone?: string | null
        }
        Update: {
          created_at?: string
          default_address?: string | null
          default_district?: string | null
          email?: string
          full_name?: string
          id?: string
          is_blocked?: boolean
          phone?: string | null
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_order: {
        Args: {
          p_customer_email: string
          p_customer_name: string
          p_customer_phone: string
          p_delivery_address: string
          p_delivery_note: string
          p_district: string
          p_items: Json
          p_payment_method: string
          p_user_id: string
        }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      track_order: {
        Args: { p_order_number: string; p_phone: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "user" | "moderator"
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
  public: {
    Enums: {
      app_role: ["admin", "user", "moderator"],
    },
  },
} as const
