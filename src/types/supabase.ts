/**
 * Hand-written to mirror supabase/migrations/20260909031325_initial_schema.sql.
 *
 * Once a real Supabase project exists, prefer regenerating this file from the
 * live schema instead of hand-maintaining it:
 *
 *   npx supabase login
 *   npx supabase link --project-ref <your-project-ref>
 *   npx supabase gen types typescript --linked > src/types/supabase.ts
 *
 * (npx downloads the Supabase CLI on demand — no global install required.)
 */

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          product_count: number;
          is_active: boolean;
          display_order: number;
          sku_prefix: string;
          next_sku_seq: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          display_order?: number;
          // Auto-derived from `name` by generate_category_sku_prefix() if
          // omitted — see the inventory-management migration.
          sku_prefix?: string;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string;
          short_description: string | null;
          category_id: string;
          price: number;
          original_price: number | null;
          badge: string | null;
          is_new: boolean;
          is_best_seller: boolean;
          is_featured: boolean;
          is_sale: boolean;
          stock: number;
          material: string | null;
          color: string | null;
          occasion: string | null;
          weight: string | null;
          dimensions: string | null;
          care_instructions: string[] | null;
          tags: string[];
          is_active: boolean;
          sku: string | null;
          cost_price: number | null;
          min_stock_level: number;
          max_stock_level: number | null;
          force_unavailable: boolean;
          primary_supplier_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description: string;
          short_description?: string | null;
          category_id: string;
          price: number;
          original_price?: number | null;
          badge?: string | null;
          is_new?: boolean;
          is_best_seller?: boolean;
          is_featured?: boolean;
          is_sale?: boolean;
          stock?: number;
          material?: string | null;
          color?: string | null;
          occasion?: string | null;
          weight?: string | null;
          dimensions?: string | null;
          care_instructions?: string[] | null;
          tags?: string[];
          is_active?: boolean;
          // Auto-generated as a category-coded ID (e.g. NEC-0001) by
          // generate_product_sku() if omitted.
          sku?: string | null;
          cost_price?: number | null;
          min_stock_level?: number;
          max_stock_level?: number | null;
          force_unavailable?: boolean;
          primary_supplier_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          image_url: string;
          alt_text: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          image_url: string;
          alt_text?: string | null;
          display_order?: number;
        };
        Update: Partial<
          Database["public"]["Tables"]["product_images"]["Insert"]
        >;
        Relationships: [];
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          name: string;
          option_type: "color" | "size" | "style";
          option_value: string;
          price_adjustment: number | null;
          stock: number | null;
          sku: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          name: string;
          option_type: "color" | "size" | "style";
          option_value: string;
          price_adjustment?: number | null;
          stock?: number | null;
          sku?: string | null;
          is_active?: boolean;
        };
        Update: Partial<
          Database["public"]["Tables"]["product_variants"]["Insert"]
        >;
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          product_id: string;
          customer_name: string;
          rating: number;
          review: string;
          review_date: string;
          is_verified_purchase: boolean;
          is_approved: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          customer_name: string;
          rating: number;
          review: string;
          review_date?: string;
          is_verified_purchase?: boolean;
          is_approved?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["reviews"]["Insert"]>;
        Relationships: [];
      };
      site_settings: {
        Row: {
          id: string;
          key: string;
          value: unknown;
          description: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: unknown;
          description?: string | null;
        };
        Update: Partial<
          Database["public"]["Tables"]["site_settings"]["Insert"]
        >;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          first_name: string | null;
          last_name: string | null;
          email: string | null;
          phone: string | null;
          avatar_url: string | null;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
        };
        // Deliberately excludes `role` — the database also enforces this via
        // a column-level GRANT (see the Phase 10 migration), so this is
        // belt-and-suspenders, not the actual security boundary.
        Update: Partial<{
          full_name: string | null;
          first_name: string | null;
          last_name: string | null;
          phone: string | null;
          avatar_url: string | null;
        }>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string;
          status: string;
          payment_method: string;
          payment_status: string;
          subtotal: number;
          shipping_cost: number;
          total: number;
          currency: string;
          shipping_full_name: string;
          shipping_email: string;
          shipping_phone: string;
          shipping_address_line_1: string;
          shipping_address_line_2: string | null;
          shipping_city: string;
          shipping_province: string;
          shipping_postal_code: string;
          shipping_country: string;
          customer_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: never;
        // The only client-writable columns — enforced by a column-level
        // GRANT in the Phase 10 migration, not merely by this type.
        Update: Partial<{
          status: string;
          payment_status: string;
        }>;
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          variant_id: string | null;
          product_name: string;
          variant_name: string | null;
          product_price: number;
          quantity: number;
          line_total: number;
          product_image_url: string | null;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      suppliers: {
        Row: {
          id: string;
          name: string;
          contact_person: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          notes: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          contact_person?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          notes?: string | null;
          status?: string;
        };
        Update: Partial<Database["public"]["Tables"]["suppliers"]["Insert"]>;
        Relationships: [];
      };
      // No Insert/Update policy exists at all — every row is written by the
      // record_stock_movement(), complete_purchase(), or create_order()
      // SECURITY DEFINER functions, never directly by client code.
      inventory_movements: {
        Row: {
          id: string;
          product_id: string | null;
          variant_id: string | null;
          sku: string | null;
          movement_type: string;
          quantity_change: number;
          previous_quantity: number;
          new_quantity: number;
          reason: string | null;
          reference_number: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      purchases: {
        Row: {
          id: string;
          purchase_number: string;
          supplier_id: string;
          status: string;
          payment_status: string;
          total_amount: number;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          purchase_number: string;
          supplier_id: string;
          status?: string;
          payment_status?: string;
          total_amount?: number;
          notes?: string | null;
          created_by?: string | null;
        };
        // purchase_number and created_by are stable once set — only the
        // fields below are ever edited from the admin UI.
        Update: Partial<{
          supplier_id: string;
          status: string;
          payment_status: string;
          total_amount: number;
          notes: string | null;
        }>;
        Relationships: [];
      };
      purchase_items: {
        Row: {
          id: string;
          purchase_id: string;
          product_id: string | null;
          variant_id: string | null;
          product_name: string;
          sku: string | null;
          quantity: number;
          cost_price: number;
          line_total: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          purchase_id: string;
          product_id?: string | null;
          variant_id?: string | null;
          product_name: string;
          sku?: string | null;
          quantity: number;
          cost_price: number;
          line_total: number;
        };
        Update: Partial<
          Database["public"]["Tables"]["purchase_items"]["Insert"]
        >;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_order: {
        Args: {
          p_items: unknown;
          p_payment_method: string;
          p_shipping: unknown;
          p_customer_notes?: string | null;
        };
        Returns: {
          id: string;
          order_number: string;
          subtotal: number;
          shipping_cost: number;
          total: number;
        };
      };
      record_stock_movement: {
        Args: {
          p_product_id: string | null;
          p_variant_id: string | null;
          p_movement_type: string;
          p_quantity_change: number;
          p_reason?: string | null;
          p_reference_number?: string | null;
        };
        Returns: {
          previous_quantity: number;
          new_quantity: number;
        };
      };
      complete_purchase: {
        Args: {
          p_purchase_id: string;
        };
        Returns: {
          purchase_number: string;
        };
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
