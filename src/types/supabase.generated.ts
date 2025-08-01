// Supabase Database Types
// Generated types for the SocialSpark E-commerce Platform

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          role: 'user' | 'seller' | 'admin';
          is_verified: boolean;
          push_token: string | null;
          notification_preferences: {
            order_updates: boolean;
            new_followers: boolean;
            sales_alerts: boolean;
            messages: boolean;
            promotions: boolean;
          };
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: 'user' | 'seller' | 'admin';
          is_verified?: boolean;
          push_token?: string | null;
          notification_preferences?: {
            order_updates: boolean;
            new_followers: boolean;
            sales_alerts: boolean;
            messages: boolean;
            promotions: boolean;
          };
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: 'user' | 'seller' | 'admin';
          is_verified?: boolean;
          push_token?: string | null;
          notification_preferences?: {
            order_updates: boolean;
            new_followers: boolean;
            sales_alerts: boolean;
            messages: boolean;
            promotions: boolean;
          };
          created_at?: string;
          updated_at?: string;
        };
      };
      stores: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          description: string | null;
          logo_url: string | null;
          banner_url: string | null;
          website_url: string | null;
          social_media: any;
          contact_info: any;
          settings: any;
          is_active: boolean;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          description?: string | null;
          logo_url?: string | null;
          banner_url?: string | null;
          website_url?: string | null;
          social_media?: any;
          contact_info?: any;
          settings?: any;
          is_active?: boolean;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          description?: string | null;
          logo_url?: string | null;
          banner_url?: string | null;
          website_url?: string | null;
          social_media?: any;
          contact_info?: any;
          settings?: any;
          is_active?: boolean;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          parent_id: string | null;
          image_url: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          parent_id?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          parent_id?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          store_id: string;
          category_id: string | null;
          name: string;
          description: string | null;
          short_description: string | null;
          sku: string | null;
          price: number;
          compare_price: number | null;
          cost_price: number | null;
          stock_quantity: number;
          low_stock_threshold: number;
          weight: number | null;
          dimensions: {
            length?: number;
            width?: number;
            height?: number;
          } | null;
          tags: string[] | null;
          seo_title: string | null;
          seo_description: string | null;
          seo_keywords: string[] | null;
          is_active: boolean;
          is_featured: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          category_id?: string | null;
          name: string;
          description?: string | null;
          short_description?: string | null;
          sku?: string | null;
          price: number;
          compare_price?: number | null;
          cost_price?: number | null;
          stock_quantity?: number;
          low_stock_threshold?: number;
          weight?: number | null;
          dimensions?: {
            length?: number;
            width?: number;
            height?: number;
          } | null;
          tags?: string[] | null;
          seo_title?: string | null;
          seo_description?: string | null;
          seo_keywords?: string[] | null;
          is_active?: boolean;
          is_featured?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          category_id?: string | null;
          name?: string;
          description?: string | null;
          short_description?: string | null;
          sku?: string | null;
          price?: number;
          compare_price?: number | null;
          cost_price?: number | null;
          stock_quantity?: number;
          low_stock_threshold?: number;
          weight?: number | null;
          dimensions?: {
            length?: number;
            width?: number;
            height?: number;
          } | null;
          tags?: string[] | null;
          seo_title?: string | null;
          seo_description?: string | null;
          seo_keywords?: string[] | null;
          is_active?: boolean;
          is_featured?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          image_url: string;
          alt_text: string | null;
          sort_order: number;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          image_url: string;
          alt_text?: string | null;
          sort_order?: number;
          is_primary?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          image_url?: string;
          alt_text?: string | null;
          sort_order?: number;
          is_primary?: boolean;
          created_at?: string;
        };
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          name: string;
          sku: string | null;
          price: number | null;
          compare_price: number | null;
          stock_quantity: number;
          attributes: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          name: string;
          sku?: string | null;
          price?: number | null;
          compare_price?: number | null;
          stock_quantity?: number;
          attributes?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          name?: string;
          sku?: string | null;
          price?: number | null;
          compare_price?: number | null;
          stock_quantity?: number;
          attributes?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          user_id: string | null;
          email: string;
          first_name: string | null;
          last_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          addresses: any;
          preferences: any;
          total_spent: number;
          order_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          addresses?: any;
          preferences?: any;
          total_spent?: number;
          order_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          email?: string;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          addresses?: any;
          preferences?: any;
          total_spent?: number;
          order_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          store_id: string;
          customer_id: string | null;
          status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
          subtotal: number;
          tax_amount: number;
          shipping_amount: number;
          discount_amount: number;
          total_amount: number;
          currency: string;
          shipping_address: any;
          billing_address: any;
          payment_method: string | null;
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
          shipping_method: string | null;
          tracking_number: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          store_id: string;
          customer_id?: string | null;
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
          subtotal: number;
          tax_amount?: number;
          shipping_amount?: number;
          discount_amount?: number;
          total_amount: number;
          currency?: string;
          shipping_address?: any;
          billing_address?: any;
          payment_method?: string | null;
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
          shipping_method?: string | null;
          tracking_number?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          store_id?: string;
          customer_id?: string | null;
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
          subtotal?: number;
          tax_amount?: number;
          shipping_amount?: number;
          discount_amount?: number;
          total_amount?: number;
          currency?: string;
          shipping_address?: any;
          billing_address?: any;
          payment_method?: string | null;
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
          shipping_method?: string | null;
          tracking_number?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          variant_id: string | null;
          product_name: string;
          sku: string | null;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          variant_id?: string | null;
          product_name: string;
          sku?: string | null;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          variant_id?: string | null;
          product_name?: string;
          sku?: string | null;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          created_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          store_id: string;
          title: string;
          content: string | null;
          media_urls: string[] | null;
          is_published: boolean;
          is_featured: boolean;
          scheduled_at: string | null;
          published_at: string | null;
          engagement_metrics: {
            likes: number;
            comments: number;
            shares: number;
            views: number;
          };
          seo_data: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          title: string;
          content?: string | null;
          media_urls?: string[] | null;
          is_published?: boolean;
          is_featured?: boolean;
          scheduled_at?: string | null;
          published_at?: string | null;
          engagement_metrics?: {
            likes: number;
            comments: number;
            shares: number;
            views: number;
          };
          seo_data?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          title?: string;
          content?: string | null;
          media_urls?: string[] | null;
          is_published?: boolean;
          is_featured?: boolean;
          scheduled_at?: string | null;
          published_at?: string | null;
          engagement_metrics?: {
            likes: number;
            comments: number;
            shares: number;
            views: number;
          };
          seo_data?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          store_id: string;
          customer_id: string | null;
          last_message: string | null;
          last_message_at: string | null;
          unread_count: number;
          is_archived: boolean;
          is_deleted: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          customer_id?: string | null;
          last_message?: string | null;
          last_message_at?: string | null;
          unread_count?: number;
          is_archived?: boolean;
          is_deleted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          customer_id?: string | null;
          last_message?: string | null;
          last_message_at?: string | null;
          unread_count?: number;
          is_archived?: boolean;
          is_deleted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_type: 'customer' | 'store';
          sender_id: string;
          message: string;
          message_type: 'text' | 'image' | 'file' | 'order_link' | 'product_link';
          media_url: string | null;
          is_read: boolean;
          is_deleted: boolean;
          deleted_at: string | null;
          deleted_by: string | null;
          reply_to_message_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_type: 'customer' | 'store';
          sender_id: string;
          message: string;
          message_type?: 'text' | 'image' | 'file' | 'order_link' | 'product_link';
          media_url?: string | null;
          is_read?: boolean;
          is_deleted?: boolean;
          deleted_at?: string | null;
          deleted_by?: string | null;
          reply_to_message_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_type?: 'customer' | 'store';
          sender_id?: string;
          message?: string;
          message_type?: 'text' | 'image' | 'file' | 'order_link' | 'product_link';
          media_url?: string | null;
          is_read?: boolean;
          is_deleted?: boolean;
          deleted_at?: string | null;
          deleted_by?: string | null;
          reply_to_message_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          store_id: string | null;
          type: string;
          title: string;
          message: string | null;
          data: any;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          store_id?: string | null;
          type: string;
          title: string;
          message?: string | null;
          data?: any;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          store_id?: string | null;
          type?: string;
          title?: string;
          message?: string | null;
          data?: any;
          is_read?: boolean;
          created_at?: string;
        };
      };
    };
  };
}

// Type aliases for easier use
export type User = Database['public']['Tables']['users']['Row'];
export type Store = Database['public']['Tables']['stores']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Product = Database['public']['Tables']['products']['Row'];
export type ProductImage = Database['public']['Tables']['product_images']['Row'];
export type ProductVariant = Database['public']['Tables']['product_variants']['Row'];
export type Customer = Database['public']['Tables']['customers']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type Post = Database['public']['Tables']['posts']['Row'];
export type Conversation = Database['public']['Tables']['conversations']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type MessageReaction = {
  id: string;
  message_id: string;
  user_id: string;
  reaction_type: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry';
  created_at: string;
};
export type Notification = Database['public']['Tables']['notifications']['Row'];

// Extended types for complex queries
export type ConversationWithMessages = Conversation & {
  messages: MessageWithReactions[];
  customers?: Customer;
  stores?: Store;
};

export type MessageWithReactions = Message & {
  message_reactions: MessageReaction[];
};

export type ProductWithDetails = Product & {
  categories?: Category;
  product_images?: ProductImage[];
  product_variants?: ProductVariant[];
};

export type OrderWithDetails = Order & {
  customers?: Customer;
  order_items?: (OrderItem & {
    products?: Product;
    product_variants?: ProductVariant;
  })[];
};

export type PostWithProducts = Post & {
  post_products?: {
    position_x: number | null;
    position_y: number | null;
    products: Product;
  }[];
};
