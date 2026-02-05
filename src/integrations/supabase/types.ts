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
  public: {
    Tables: {
      banners: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_active: boolean | null
          link_url: string | null
          sort_order: number | null
          subtitle: string | null
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean | null
          link_url?: string | null
          sort_order?: number | null
          subtitle?: string | null
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean | null
          link_url?: string | null
          sort_order?: number | null
          subtitle?: string | null
          title?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          benefits: string[] | null
          category_id: string | null
          created_at: string
          description: string | null
          discounted_price: number | null
          id: string
          image_url: string | null
          is_available: boolean | null
          is_bestseller: boolean | null
          is_veg: boolean | null
          name: string
          preparation_time: number | null
          price: number
          restaurant_id: string
          updated_at: string
        }
        Insert: {
          benefits?: string[] | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          discounted_price?: number | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_bestseller?: boolean | null
          is_veg?: boolean | null
          name: string
          preparation_time?: number | null
          price: number
          restaurant_id: string
          updated_at?: string
        }
        Update: {
          benefits?: string[] | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          discounted_price?: number | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_bestseller?: boolean | null
          is_veg?: boolean | null
          name?: string
          preparation_time?: number | null
          price?: number
          restaurant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          menu_item_id: string | null
          name: string
          notes: string | null
          order_id: string
          price: number
          quantity: number
          total: number
        }
        Insert: {
          id?: string
          menu_item_id?: string | null
          name: string
          notes?: string | null
          order_id: string
          price: number
          quantity?: number
          total: number
        }
        Update: {
          id?: string
          menu_item_id?: string | null
          name?: string
          notes?: string | null
          order_id?: string
          price?: number
          quantity?: number
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          delivered_at: string | null
          delivery_address: string
          delivery_city: string
          delivery_fee: number | null
          delivery_phone: string
          delivery_pincode: string | null
          discount: number | null
          estimated_delivery: string | null
          id: string
          notes: string | null
          order_number: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_status: string | null
          promo_code: string | null
          restaurant_id: string
          status: Database["public"]["Enums"]["order_status"] | null
          subtotal: number
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivered_at?: string | null
          delivery_address: string
          delivery_city: string
          delivery_fee?: number | null
          delivery_phone: string
          delivery_pincode?: string | null
          discount?: number | null
          estimated_delivery?: string | null
          id?: string
          notes?: string | null
          order_number: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_status?: string | null
          promo_code?: string | null
          restaurant_id: string
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal: number
          total: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivered_at?: string | null
          delivery_address?: string
          delivery_city?: string
          delivery_fee?: number | null
          delivery_phone?: string
          delivery_pincode?: string | null
          discount?: number | null
          estimated_delivery?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_status?: string | null
          promo_code?: string | null
          restaurant_id?: string
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          city: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          pincode: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          pincode?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          pincode?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          max_discount: number | null
          min_order_amount: number | null
          usage_limit: number | null
          used_count: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value: number
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          min_order_amount?: number | null
          usage_limit?: number | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          min_order_amount?: number | null
          usage_limit?: number | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      restaurants: {
        Row: {
          address: string
          city: string
          closes_at: string | null
          cover_image_url: string | null
          created_at: string
          cuisine_type: string[] | null
          delivery_fee: number | null
          delivery_time_max: number | null
          delivery_time_min: number | null
          description: string | null
          email: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          is_veg_only: boolean | null
          latitude: number | null
          longitude: number | null
          min_order_amount: number | null
          name: string
          opens_at: string | null
          owner_id: string
          phone: string | null
          pincode: string | null
          price_range: number | null
          rating: number | null
          slug: string
          status: Database["public"]["Enums"]["vendor_status"] | null
          total_reviews: number | null
          updated_at: string
        }
        Insert: {
          address: string
          city: string
          closes_at?: string | null
          cover_image_url?: string | null
          created_at?: string
          cuisine_type?: string[] | null
          delivery_fee?: number | null
          delivery_time_max?: number | null
          delivery_time_min?: number | null
          description?: string | null
          email?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_veg_only?: boolean | null
          latitude?: number | null
          longitude?: number | null
          min_order_amount?: number | null
          name: string
          opens_at?: string | null
          owner_id: string
          phone?: string | null
          pincode?: string | null
          price_range?: number | null
          rating?: number | null
          slug: string
          status?: Database["public"]["Enums"]["vendor_status"] | null
          total_reviews?: number | null
          updated_at?: string
        }
        Update: {
          address?: string
          city?: string
          closes_at?: string | null
          cover_image_url?: string | null
          created_at?: string
          cuisine_type?: string[] | null
          delivery_fee?: number | null
          delivery_time_max?: number | null
          delivery_time_min?: number | null
          description?: string | null
          email?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_veg_only?: boolean | null
          latitude?: number | null
          longitude?: number | null
          min_order_amount?: number | null
          name?: string
          opens_at?: string | null
          owner_id?: string
          phone?: string | null
          pincode?: string | null
          price_range?: number | null
          rating?: number | null
          slug?: string
          status?: Database["public"]["Enums"]["vendor_status"] | null
          total_reviews?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          order_id: string | null
          rating: number
          restaurant_id: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          order_id?: string | null
          rating: number
          restaurant_id: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          order_id?: string | null
          rating?: number
          restaurant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      store_settings: {
        Row: {
          created_at: string
          id: string
          store_description: string | null
          store_name: string | null
          updated_at: string
          upi_number: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          store_description?: string | null
          store_name?: string | null
          updated_at?: string
          upi_number?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          store_description?: string | null
          store_name?: string | null
          updated_at?: string
          upi_number?: string | null
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
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "vendor" | "admin"
      order_status:
        | "placed"
        | "confirmed"
        | "dispatched"
        | "shipped"
        | "out_for_delivery"
        | "delivered"
        | "cancelled"
      payment_method: "cod" | "upi" | "card"
      vendor_status: "pending" | "approved" | "blocked"
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
      app_role: ["user", "vendor", "admin"],
      order_status: [
        "placed",
        "confirmed",
        "dispatched",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      payment_method: ["cod", "upi", "card"],
      vendor_status: ["pending", "approved", "blocked"],
    },
  },
} as const
