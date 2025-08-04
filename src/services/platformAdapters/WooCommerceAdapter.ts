import { BasePlatformAdapter, PlatformConfig, PlatformCredentials, Product, Order, Customer, StoreInfo, SyncOptions } from './types';

export class WooCommerceAdapter extends BasePlatformAdapter {
  constructor(config: PlatformConfig) {
    super('woocommerce', config);
  }

  async validateCredentials(credentials: PlatformCredentials): Promise<boolean> {
    try {
      const response = await fetch(`${credentials.site_url}/wp-json/wc/v3/products?per_page=1`, {
        headers: {
          'Authorization': `Basic ${btoa(`${credentials.consumer_key}:${credentials.consumer_secret}`)}`
        }
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async getStoreInfo(credentials: PlatformCredentials): Promise<StoreInfo> {
    const response = await fetch(`${credentials.site_url}/wp-json/wc/v3/system_status`, {
      headers: {
        'Authorization': `Basic ${btoa(`${credentials.consumer_key}:${credentials.consumer_secret}`)}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get store info: ${response.statusText}`);
    }
    
    const data = await response.json();
    return {
      name: data.environment.site_title || 'WooCommerce Store',
      domain: credentials.site_url,
      currency: data.environment.currency || 'USD',
      platform: 'woocommerce',
      metadata: {
        wc_version: data.environment.version,
        wp_version: data.environment.wp_version
      }
    };
  }

  async getProducts(credentials: PlatformCredentials, options?: SyncOptions): Promise<Product[]> {
    const limit = options?.limit || 100;
    const response = await fetch(
      `${credentials.site_url}/wp-json/wc/v3/products?per_page=${limit}`,
      {
        headers: {
          'Authorization': `Basic ${btoa(`${credentials.consumer_key}:${credentials.consumer_secret}`)}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to get products: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.map(this.mapWooCommerceProduct);
  }

  async getOrders(credentials: PlatformCredentials, options?: SyncOptions): Promise<Order[]> {
    const limit = options?.limit || 100;
    const response = await fetch(
      `${credentials.site_url}/wp-json/wc/v3/orders?per_page=${limit}`,
      {
        headers: {
          'Authorization': `Basic ${btoa(`${credentials.consumer_key}:${credentials.consumer_secret}`)}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to get orders: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.map(this.mapWooCommerceOrder);
  }

  async getCustomers(credentials: PlatformCredentials, options?: SyncOptions): Promise<Customer[]> {
    const limit = options?.limit || 100;
    const response = await fetch(
      `${credentials.site_url}/wp-json/wc/v3/customers?per_page=${limit}`,
      {
        headers: {
          'Authorization': `Basic ${btoa(`${credentials.consumer_key}:${credentials.consumer_secret}`)}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to get customers: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.map(this.mapWooCommerceCustomer);
  }

  private mapWooCommerceProduct(wcProduct: any): Product {
    return {
      id: wcProduct.id.toString(),
      name: wcProduct.name,
      description: wcProduct.description,
      price: parseFloat(wcProduct.price),
      sku: wcProduct.sku,
      inventory: wcProduct.stock_quantity || 0,
      images: wcProduct.images.map((img: any) => img.src),
      status: wcProduct.status,
      platform: 'woocommerce',
      platform_product_id: wcProduct.id.toString(),
      metadata: {
        type: wcProduct.type,
        categories: wcProduct.categories.map((cat: any) => cat.name),
        tags: wcProduct.tags.map((tag: any) => tag.name)
      }
    };
  }

  private mapWooCommerceOrder(wcOrder: any): Order {
    return {
      id: wcOrder.id.toString(),
      order_number: wcOrder.number,
      customer_email: wcOrder.billing.email,
      total_amount: parseFloat(wcOrder.total),
      currency: wcOrder.currency,
      status: wcOrder.status,
      order_date: new Date(wcOrder.date_created),
      items: wcOrder.line_items.map(this.mapWooCommerceOrderItem),
      shipping_address: wcOrder.shipping ? this.mapWooCommerceAddress(wcOrder.shipping) : undefined,
      billing_address: wcOrder.billing ? this.mapWooCommerceAddress(wcOrder.billing) : undefined,
      platform: 'woocommerce',
      platform_order_id: wcOrder.id.toString(),
      metadata: {
        payment_method: wcOrder.payment_method,
        payment_method_title: wcOrder.payment_method_title,
        transaction_id: wcOrder.transaction_id
      }
    };
  }

  private mapWooCommerceOrderItem(item: any) {
    return {
      id: item.id.toString(),
      product_id: item.product_id.toString(),
      product_name: item.name,
      quantity: item.quantity,
      unit_price: parseFloat(item.price),
      total_price: parseFloat(item.total),
      sku: item.sku
    };
  }

  private mapWooCommerceAddress(address: any) {
    return {
      first_name: address.first_name,
      last_name: address.last_name,
      company: address.company,
      address_1: address.address_1,
      address_2: address.address_2,
      city: address.city,
      state: address.state,
      postcode: address.postcode,
      country: address.country,
      phone: address.phone
    };
  }

  private mapWooCommerceCustomer(wcCustomer: any): Customer {
    return {
      id: wcCustomer.id.toString(),
      email: wcCustomer.email,
      first_name: wcCustomer.first_name,
      last_name: wcCustomer.last_name,
      phone: wcCustomer.billing?.phone,
      platform: 'woocommerce',
      platform_customer_id: wcCustomer.id.toString(),
      metadata: {
        username: wcCustomer.username,
        orders_count: wcCustomer.orders_count,
        total_spent: wcCustomer.total_spent
      }
    };
  }
} 