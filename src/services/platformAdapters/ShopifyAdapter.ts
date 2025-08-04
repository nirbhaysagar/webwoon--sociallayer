import { BasePlatformAdapter, PlatformConfig, PlatformCredentials, Product, Order, Customer, StoreInfo, SyncOptions } from './types';

export class ShopifyAdapter extends BasePlatformAdapter {
  constructor(config: PlatformConfig) {
    super('shopify', config);
  }

  async validateCredentials(credentials: PlatformCredentials): Promise<boolean> {
    try {
      const response = await fetch(`${credentials.shop}/admin/api/2023-10/shop.json`, {
        headers: {
          'X-Shopify-Access-Token': credentials.accessToken,
          'Content-Type': 'application/json'
        }
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async getStoreInfo(credentials: PlatformCredentials): Promise<StoreInfo> {
    const response = await fetch(`${credentials.shop}/admin/api/2023-10/shop.json`, {
      headers: {
        'X-Shopify-Access-Token': credentials.accessToken
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get store info: ${response.statusText}`);
    }
    
    const data = await response.json();
    return {
      name: data.shop.name,
      domain: data.shop.domain,
      currency: data.shop.currency,
      timezone: data.shop.iana_timezone,
      platform: 'shopify',
      metadata: {
        email: data.shop.email,
        phone: data.shop.phone,
        address: data.shop.address1
      }
    };
  }

  async getProducts(credentials: PlatformCredentials, options?: SyncOptions): Promise<Product[]> {
    const limit = options?.limit || 250;
    const response = await fetch(
      `${credentials.shop}/admin/api/2023-10/products.json?limit=${limit}`,
      {
        headers: {
          'X-Shopify-Access-Token': credentials.accessToken
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to get products: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.products.map(this.mapShopifyProduct);
  }

  async getOrders(credentials: PlatformCredentials, options?: SyncOptions): Promise<Order[]> {
    const limit = options?.limit || 250;
    const response = await fetch(
      `${credentials.shop}/admin/api/2023-10/orders.json?limit=${limit}`,
      {
        headers: {
          'X-Shopify-Access-Token': credentials.accessToken
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to get orders: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.orders.map(this.mapShopifyOrder);
  }

  async getCustomers(credentials: PlatformCredentials, options?: SyncOptions): Promise<Customer[]> {
    const limit = options?.limit || 250;
    const response = await fetch(
      `${credentials.shop}/admin/api/2023-10/customers.json?limit=${limit}`,
      {
        headers: {
          'X-Shopify-Access-Token': credentials.accessToken
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to get customers: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.customers.map(this.mapShopifyCustomer);
  }

  private mapShopifyProduct(shopifyProduct: any): Product {
    return {
      id: shopifyProduct.id.toString(),
      name: shopifyProduct.title,
      description: shopifyProduct.body_html,
      price: parseFloat(shopifyProduct.variants[0]?.price || '0'),
      sku: shopifyProduct.variants[0]?.sku,
      inventory: shopifyProduct.variants[0]?.inventory_quantity || 0,
      images: shopifyProduct.images.map((img: any) => img.src),
      status: shopifyProduct.status,
      platform: 'shopify',
      platform_product_id: shopifyProduct.id.toString(),
      metadata: {
        vendor: shopifyProduct.vendor,
        product_type: shopifyProduct.product_type,
        tags: shopifyProduct.tags
      }
    };
  }

  private mapShopifyOrder(shopifyOrder: any): Order {
    return {
      id: shopifyOrder.id.toString(),
      order_number: shopifyOrder.order_number.toString(),
      customer_email: shopifyOrder.email,
      total_amount: parseFloat(shopifyOrder.total_price),
      currency: shopifyOrder.currency,
      status: shopifyOrder.financial_status,
      order_date: new Date(shopifyOrder.created_at),
      items: shopifyOrder.line_items.map(this.mapShopifyOrderItem),
      shipping_address: shopifyOrder.shipping_address ? this.mapShopifyAddress(shopifyOrder.shipping_address) : undefined,
      billing_address: shopifyOrder.billing_address ? this.mapShopifyAddress(shopifyOrder.billing_address) : undefined,
      platform: 'shopify',
      platform_order_id: shopifyOrder.id.toString(),
      metadata: {
        financial_status: shopifyOrder.financial_status,
        fulfillment_status: shopifyOrder.fulfillment_status,
        subtotal_price: shopifyOrder.subtotal_price,
        total_tax: shopifyOrder.total_tax
      }
    };
  }

  private mapShopifyOrderItem(item: any) {
    return {
      id: item.id.toString(),
      product_id: item.product_id.toString(),
      product_name: item.name,
      quantity: item.quantity,
      unit_price: parseFloat(item.price),
      total_price: parseFloat(item.price) * item.quantity,
      sku: item.sku,
      variant_id: item.variant_id?.toString()
    };
  }

  private mapShopifyAddress(address: any) {
    return {
      first_name: address.first_name,
      last_name: address.last_name,
      company: address.company,
      address_1: address.address1,
      address_2: address.address2,
      city: address.city,
      state: address.province,
      postcode: address.zip,
      country: address.country,
      phone: address.phone
    };
  }

  private mapShopifyCustomer(shopifyCustomer: any): Customer {
    return {
      id: shopifyCustomer.id.toString(),
      email: shopifyCustomer.email,
      first_name: shopifyCustomer.first_name,
      last_name: shopifyCustomer.last_name,
      phone: shopifyCustomer.phone,
      platform: 'shopify',
      platform_customer_id: shopifyCustomer.id.toString(),
      metadata: {
        verified_email: shopifyCustomer.verified_email,
        accepts_marketing: shopifyCustomer.accepts_marketing,
        orders_count: shopifyCustomer.orders_count,
        total_spent: shopifyCustomer.total_spent
      }
    };
  }
} 