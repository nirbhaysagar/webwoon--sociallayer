/**
 * Platform Adapter Types and Interfaces
 * Defines the structure for different e-commerce platform integrations
 */

export interface StoreInfo {
  name: string;
  domain: string;
  currency?: string;
  timezone?: string;
  platform: string;
  metadata?: Record<string, any>;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  sku?: string;
  inventory: number;
  images: string[];
  status: 'active' | 'inactive' | 'draft';
  platform: string;
  platform_product_id: string;
  metadata?: Record<string, any>;
  variants?: ProductVariant[];
  categories?: string[];
  tags?: string[];
}

export interface ProductVariant {
  id: string;
  name: string;
  sku?: string;
  price: number;
  inventory: number;
  attributes?: Record<string, any>;
}

export interface Order {
  id: string;
  order_number: string;
  customer_email: string;
  total_amount: number;
  currency: string;
  status: string;
  order_date: Date;
  items: OrderItem[];
  shipping_address?: Address;
  billing_address?: Address;
  platform: string;
  platform_order_id: string;
  metadata?: Record<string, any>;
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  sku?: string;
  variant_id?: string;
}

export interface Address {
  first_name: string;
  last_name: string;
  company?: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  phone?: string;
}

export interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  platform: string;
  platform_customer_id: string;
  metadata?: Record<string, any>;
}

export interface SyncOptions {
  limit?: number;
  offset?: number;
  since?: Date;
  status?: string;
  include_inactive?: boolean;
}

export interface SyncResult {
  success: boolean;
  items_synced: number;
  items_failed: number;
  errors?: string[];
  metadata?: Record<string, any>;
}

export interface PlatformCredentials {
  [key: string]: any;
}

export interface PlatformConfig {
  platform_type: string;
  display_name: string;
  description: string;
  api_fields: Record<string, string>;
  supported_features: Record<string, boolean>;
  auth_method: 'oauth' | 'api_key' | 'custom';
  base_url: string;
  webhook_support: boolean;
  rate_limits: Record<string, number>;
}

export interface WebhookPayload {
  topic: string;
  shop_domain?: string;
  data: any;
  timestamp: number;
}

/**
 * Base interface for all platform adapters
 */
export interface PlatformAdapter {
  // Connection and validation
  validateCredentials(credentials: PlatformCredentials): Promise<boolean>;
  getStoreInfo(credentials: PlatformCredentials): Promise<StoreInfo>;
  testConnection(credentials: PlatformCredentials): Promise<boolean>;

  // Data retrieval
  getProducts(credentials: PlatformCredentials, options?: SyncOptions): Promise<Product[]>;
  getOrders(credentials: PlatformCredentials, options?: SyncOptions): Promise<Order[]>;
  getCustomers(credentials: PlatformCredentials, options?: SyncOptions): Promise<Customer[]>;
  getProduct(credentials: PlatformCredentials, productId: string): Promise<Product | null>;
  getOrder(credentials: PlatformCredentials, orderId: string): Promise<Order | null>;

  // Data updates
  updateInventory(credentials: PlatformCredentials, productId: string, quantity: number): Promise<void>;
  updateProduct(credentials: PlatformCredentials, productId: string, updates: Partial<Product>): Promise<void>;
  updateOrderStatus(credentials: PlatformCredentials, orderId: string, status: string): Promise<void>;

  // Webhooks
  setupWebhooks(credentials: PlatformCredentials, webhookUrl: string): Promise<void>;
  removeWebhooks(credentials: PlatformCredentials): Promise<void>;
  validateWebhook(payload: any, signature?: string): Promise<boolean>;

  // Platform-specific methods
  getPlatformConfig(): PlatformConfig;
  getRateLimits(): Record<string, number>;
}

/**
 * Base class for platform adapters with common functionality
 */
export abstract class BasePlatformAdapter implements PlatformAdapter {
  protected platformType: string;
  protected config: PlatformConfig;

  constructor(platformType: string, config: PlatformConfig) {
    this.platformType = platformType;
    this.config = config;
  }

  // Abstract methods that must be implemented by each platform
  abstract validateCredentials(credentials: PlatformCredentials): Promise<boolean>;
  abstract getStoreInfo(credentials: PlatformCredentials): Promise<StoreInfo>;
  abstract getProducts(credentials: PlatformCredentials, options?: SyncOptions): Promise<Product[]>;
  abstract getOrders(credentials: PlatformCredentials, options?: SyncOptions): Promise<Order[]>;
  abstract getCustomers(credentials: PlatformCredentials, options?: SyncOptions): Promise<Customer[]>;

  // Default implementations for optional methods
  async testConnection(credentials: PlatformCredentials): Promise<boolean> {
    try {
      await this.getStoreInfo(credentials);
      return true;
    } catch (error) {
      return false;
    }
  }

  async getProduct(credentials: PlatformCredentials, productId: string): Promise<Product | null> {
    try {
      const products = await this.getProducts(credentials, { limit: 1 });
      return products.find(p => p.platform_product_id === productId) || null;
    } catch (error) {
      return null;
    }
  }

  async getOrder(credentials: PlatformCredentials, orderId: string): Promise<Order | null> {
    try {
      const orders = await this.getOrders(credentials, { limit: 1 });
      return orders.find(o => o.platform_order_id === orderId) || null;
    } catch (error) {
      return null;
    }
  }

  async updateInventory(credentials: PlatformCredentials, productId: string, quantity: number): Promise<void> {
    // Default implementation - override in specific adapters
    throw new Error('Inventory update not supported for this platform');
  }

  async updateProduct(credentials: PlatformCredentials, productId: string, updates: Partial<Product>): Promise<void> {
    // Default implementation - override in specific adapters
    throw new Error('Product update not supported for this platform');
  }

  async updateOrderStatus(credentials: PlatformCredentials, orderId: string, status: string): Promise<void> {
    // Default implementation - override in specific adapters
    throw new Error('Order status update not supported for this platform');
  }

  async setupWebhooks(credentials: PlatformCredentials, webhookUrl: string): Promise<void> {
    // Default implementation - override in specific adapters
    throw new Error('Webhooks not supported for this platform');
  }

  async removeWebhooks(credentials: PlatformCredentials): Promise<void> {
    // Default implementation - override in specific adapters
    throw new Error('Webhooks not supported for this platform');
  }

  async validateWebhook(payload: any, signature?: string): Promise<boolean> {
    // Default implementation - override in specific adapters
    return true;
  }

  getPlatformConfig(): PlatformConfig {
    return this.config;
  }

  getRateLimits(): Record<string, number> {
    return this.config.rate_limits;
  }

  // Helper methods for common operations
  protected async makeRequest(
    url: string,
    options: RequestInit = {},
    credentials: PlatformCredentials
  ): Promise<any> {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  protected handleApiError(error: any, context: string): never {
    console.error(`API Error in ${context}:`, error);
    throw new Error(`Failed to ${context}: ${error.message}`);
  }
} 