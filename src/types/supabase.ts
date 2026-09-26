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
          image_url: string | null;
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
          image_url?: string | null;
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
          user_id: string | null;
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
          user_id?: string | null;
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
      social_posts: {
        Row: {
          id: string;
          image_url: string;
          alt: string;
          href: string | null;
          is_active: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          image_url: string;
          alt: string;
          href?: string | null;
          is_active?: boolean;
          display_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["social_posts"]["Insert"]>;
        Relationships: [];
      };
      social_media_settings: {
        Row: {
          id: string;
          facebook_page_id: string | null;
          facebook_access_token: string | null;
          facebook_enabled: boolean;
          instagram_business_account_id: string | null;
          instagram_enabled: boolean;
          auto_post_enabled: boolean;
          facebook_connected_at: string | null;
          instagram_connected_at: string | null;
          facebook_catalog_id: string | null;
          facebook_product_feed_id: string | null;
          product_tagging_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          facebook_page_id?: string | null;
          facebook_access_token?: string | null;
          facebook_enabled?: boolean;
          instagram_business_account_id?: string | null;
          instagram_enabled?: boolean;
          auto_post_enabled?: boolean;
          facebook_connected_at?: string | null;
          instagram_connected_at?: string | null;
          facebook_catalog_id?: string | null;
          facebook_product_feed_id?: string | null;
          product_tagging_enabled?: boolean;
        };
        Update: Partial<
          Database["public"]["Tables"]["social_media_settings"]["Insert"]
        >;
        Relationships: [];
      };
      product_social_posts: {
        Row: {
          id: string;
          product_id: string;
          facebook_post_id: string | null;
          instagram_media_id: string | null;
          facebook_status: "pending" | "success" | "failed" | "skipped";
          instagram_status: "pending" | "success" | "failed" | "skipped";
          facebook_error: string | null;
          instagram_error: string | null;
          posted_at: string | null;
          retry_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          facebook_post_id?: string | null;
          instagram_media_id?: string | null;
          facebook_status?: "pending" | "success" | "failed" | "skipped";
          instagram_status?: "pending" | "success" | "failed" | "skipped";
          facebook_error?: string | null;
          instagram_error?: string | null;
          posted_at?: string | null;
          retry_count?: number;
        };
        Update: Partial<
          Database["public"]["Tables"]["product_social_posts"]["Insert"]
        >;
        Relationships: [];
      };
      product_reels: {
        Row: {
          id: string;
          product_id: string;
          video_url: string;
          caption: string;
          facebook_video_id: string | null;
          instagram_media_id: string | null;
          facebook_status: "pending" | "success" | "failed" | "skipped";
          instagram_status: "pending" | "success" | "failed" | "skipped";
          facebook_error: string | null;
          instagram_error: string | null;
          posted_at: string | null;
          retry_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          video_url: string;
          caption: string;
          facebook_video_id?: string | null;
          instagram_media_id?: string | null;
          facebook_status?: "pending" | "success" | "failed" | "skipped";
          instagram_status?: "pending" | "success" | "failed" | "skipped";
          facebook_error?: string | null;
          instagram_error?: string | null;
          posted_at?: string | null;
          retry_count?: number;
        };
        Update: Partial<Database["public"]["Tables"]["product_reels"]["Insert"]>;
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
          user_id: string | null;
          guest_token: string | null;
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
          shipping_postal_code: string | null;
          shipping_country: string;
          customer_notes: string | null;
          whatsapp_confirmed_at: string | null;
          promo_code: string | null;
          promo_code_id: string | null;
          discount_type: string | null;
          discount_value: number | null;
          discount_amount: number;
          created_at: string;
          updated_at: string;
        };
        Insert: never;
        // The only client-writable columns — enforced by a column-level
        // GRANT in the Phase 10 migration (plus the COD WhatsApp
        // confirmation migration), not merely by this type.
        Update: Partial<{
          status: string;
          payment_status: string;
          whatsapp_confirmed_at: string;
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
      // No public Insert/Update/Delete policy at all — every row is written
      // by an admin (via RLS's is_admin() policies) or, for usage_count,
      // incremented only inside create_order().
      promo_codes: {
        Row: {
          id: string;
          code: string;
          discount_type: string;
          discount_value: number;
          min_order_amount: number | null;
          max_discount_amount: number | null;
          starts_at: string | null;
          expires_at: string | null;
          usage_limit: number | null;
          usage_limit_per_customer: number | null;
          usage_count: number;
          is_active: boolean;
          description: string | null;
          // Added by 20260927000000_social_engagement_campaigns.sql — all
          // nullable/defaulted so every pre-existing row is unaffected.
          source: string;
          campaign_id: string | null;
          owner_user_id: string | null;
          participation_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          discount_type: string;
          discount_value: number;
          min_order_amount?: number | null;
          max_discount_amount?: number | null;
          starts_at?: string | null;
          expires_at?: string | null;
          usage_limit?: number | null;
          usage_limit_per_customer?: number | null;
          is_active?: boolean;
          description?: string | null;
          source?: string;
          campaign_id?: string | null;
          owner_user_id?: string | null;
          participation_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["promo_codes"]["Insert"]>;
        Relationships: [];
      };
      social_campaigns: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          facebook_page_id: string | null;
          instagram_account_id: string | null;
          engagement_type: string;
          required_engagement_count: number;
          discount_type: string;
          discount_value: number;
          min_order_amount: number | null;
          max_discount_amount: number | null;
          coupon_validity_days: number;
          starts_at: string | null;
          ends_at: string | null;
          max_total_claims: number | null;
          max_claims_per_customer: number;
          allow_repeat_claims: boolean;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          facebook_page_id?: string | null;
          instagram_account_id?: string | null;
          engagement_type: string;
          required_engagement_count: number;
          discount_type: string;
          discount_value: number;
          min_order_amount?: number | null;
          max_discount_amount?: number | null;
          coupon_validity_days?: number;
          starts_at?: string | null;
          ends_at?: string | null;
          max_total_claims?: number | null;
          max_claims_per_customer?: number;
          allow_repeat_claims?: boolean;
          status?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["social_campaigns"]["Insert"]
        >;
        Relationships: [];
      };
      social_campaign_content: {
        Row: {
          id: string;
          campaign_id: string;
          platform: string;
          post_url: string;
          post_id: string | null;
          thumbnail_url: string | null;
          caption: string | null;
          posted_at: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          platform: string;
          post_url: string;
          post_id?: string | null;
          thumbnail_url?: string | null;
          caption?: string | null;
          posted_at?: string | null;
          is_active?: boolean;
        };
        Update: Partial<
          Database["public"]["Tables"]["social_campaign_content"]["Insert"]
        >;
        Relationships: [];
      };
      // Written only by start_campaign_participation()/
      // admin_review_campaign_submission() — never a direct client insert.
      social_campaign_participations: {
        Row: {
          id: string;
          campaign_id: string;
          user_id: string;
          cycle_number: number;
          status: string;
          started_at: string;
          submitted_at: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      // Written only by toggle_campaign_engagement() — never a direct client
      // insert/delete.
      social_campaign_engagements: {
        Row: {
          id: string;
          participation_id: string;
          content_id: string;
          engagement_type: string;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      // Written only by submit_campaign_proof()/
      // admin_review_campaign_submission() — never a direct client insert.
      social_campaign_submissions: {
        Row: {
          id: string;
          participation_id: string;
          proof_link: string | null;
          proof_note: string | null;
          status: string;
          admin_notes: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      // Never written directly by client code — only create_order() inserts
      // usage rows, and only for an order that actually committed.
      promo_code_usages: {
        Row: {
          id: string;
          promo_code_id: string;
          order_id: string;
          user_id: string | null;
          customer_email: string;
          discount_amount: number;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      promotional_banners: {
        Row: {
          id: string;
          title: string;
          subtitle: string | null;
          promo_text: string | null;
          promo_code_id: string | null;
          button_text: string | null;
          button_link: string | null;
          banner_image_url: string | null;
          background_image_url: string | null;
          starts_at: string | null;
          ends_at: string | null;
          is_active: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          subtitle?: string | null;
          promo_text?: string | null;
          promo_code_id?: string | null;
          button_text?: string | null;
          button_link?: string | null;
          banner_image_url?: string | null;
          background_image_url?: string | null;
          starts_at?: string | null;
          ends_at?: string | null;
          is_active?: boolean;
          display_order?: number;
        };
        Update: Partial<
          Database["public"]["Tables"]["promotional_banners"]["Insert"]
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
          p_promo_code?: string | null;
        };
        Returns: {
          id: string;
          order_number: string;
          subtotal: number;
          shipping_cost: number;
          discount_amount: number;
          promo_code: string | null;
          total: number;
          guest_token: string | null;
        };
      };
      validate_promo_code: {
        Args: {
          p_code: string;
          p_subtotal: number;
          p_email?: string | null;
        };
        Returns: {
          valid: boolean;
          error?: string;
          code?: string;
          discount_type?: string;
          discount_value?: number;
          discount_amount?: number;
        };
      };
      get_guest_order: {
        Args: {
          p_order_number: string;
          p_guest_token: string;
        };
        Returns: unknown;
      };
      get_order_for_tracking: {
        Args: {
          p_order_number: string;
          p_contact: string;
        };
        Returns: unknown;
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
      start_campaign_participation: {
        Args: {
          p_campaign_id: string;
        };
        Returns: Database["public"]["Tables"]["social_campaign_participations"]["Row"];
      };
      toggle_campaign_engagement: {
        Args: {
          p_participation_id: string;
          p_content_id: string;
          p_engagement_type: string;
          p_mark_done: boolean;
        };
        Returns: Database["public"]["Tables"]["social_campaign_participations"]["Row"];
      };
      submit_campaign_proof: {
        Args: {
          p_participation_id: string;
          p_proof_link: string | null;
          p_proof_note: string | null;
        };
        Returns: Database["public"]["Tables"]["social_campaign_submissions"]["Row"];
      };
      admin_review_campaign_submission: {
        Args: {
          p_submission_id: string;
          p_decision: string;
          p_admin_notes: string | null;
        };
        Returns: {
          decision: string;
          promo_code_id?: string;
          code?: string;
          discount_type?: string;
          discount_value?: number;
          expires_at?: string;
        };
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
