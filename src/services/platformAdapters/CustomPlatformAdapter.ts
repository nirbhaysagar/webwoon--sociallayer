import { BasePlatformAdapter, PlatformConfig, PlatformCredentials, Product, Order, Customer, StoreInfo, SyncOptions } from './types';

export class CustomPlatformAdapter extends BasePlatformAdapter {
  constructor(config: PlatformConfig) {
    super('custom', config);
  }

  async validateCredentials(credentials: PlatformCredentials): Promise<boolean> {
    try {
      const response = await fetch(`${credentials.base_url}/api/health`, {
        headers: {
          'Authorization': `Bearer ${credentials.api_key}`,
          'Content-Type': 'application/json'
        }
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async getStoreInfo(credentials: PlatformCredentials): Promise<StoreInfo> {
    const response = await fetch(`${credentials.base_url}/api/store`, {
      headers: {
        'Authorization': `Bearer ${credentials.api_key}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get store info: ${response.statusText}`);
    }
    
    const data = await response.json();
    return {
      name: data.name || 'Custom Store',
      domain: credentials.base_url,
      currency: data.currency || 'USD',
      platform: 'custom',
      metadata: data
    };
  }

  async getProducts(credentials: PlatformCredentials, options?: SyncOptions): Promise<Product[]> {
    const limit = options?.limit || 100;
    const response = await fetch(
      `${credentials.base_url}/api/products?limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${credentials.api_key}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to get products: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.products?.map(this.mapCustomProduct) || [];
  }

  async getOrders(credentials: PlatformCredentials, options?: SyncOptions): Promise<Order[]> {
    const limit = options?.limit || 100;
    const response = await fetch(
      `${credentials.base_url}/api/orders?limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${credentials.api_key}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to get orders: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.orders?.map(this.mapCustomOrder) || [];
  }

  async getCustomers(credentials: PlatformCredentials, options?: SyncOptions): Promise<Customer[]> {
    const limit = options?.limit || 100;
    const response = await fetch(
      `${credentials.base_url}/api/customers?limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${credentials.api_key}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to get customers: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.customers?.map(this.mapCustomCustomer) || [];
  }

  private mapCustomProduct(customProduct: any): Product {
    return {
      id: customProduct.id?.toString() || customProduct.product_id?.toString(),
      name: customProduct.name || customProduct.title,
      description: customProduct.description,
      price: parseFloat(customProduct.price || '0'),
      sku: customProduct.sku,
      inventory: customProduct.inventory || customProduct.stock || 0,
      images: customProduct.images || customProduct.image_url ? [customProduct.image_url] : [],
      status: customProduct.status || 'active',
      platform: 'custom',
      platform_product_id: customProduct.id?.toString() || customProduct.product_id?.toString(),
      metadata: customProduct
    };
  }

  private mapCustomOrder(customOrder: any): Order {
    return {
      id: customOrder.id?.toString() || customOrder.order_id?.toString(),
      order_number: customOrder.order_number || customOrder.number,
      customer_email: customOrder.customer_email || customOrder.email,
      total_amount: parseFloat(customOrder.total_amount || customOrder.total || '0'),
      currency: customOrder.currency || 'USD',
      status: customOrder.status,
      order_date: new Date(customOrder.order_date || customOrder.created_at),
      items: customOrder.items?.map(this.mapCustomOrderItem) || [],
      platform: 'custom',
      platform_order_id: customOrder.id?.toString() || customOrder.order_id?.toString(),
      metadata: customOrder
    };
  }

  private mapCustomOrderItem(item: any) {
    return {
      id: item.id?.toString() || item.item_id?.toString(),
      product_id: item.product_id?.toString(),
      product_name: item.product_name || item.name,
      quantity: parseFloat(item.quantity || '1'),
      unit_price: parseFloat(item.unit_price || item.price || '0'),
      total_price: parseFloat(item.total_price || item.total || '0'),
      sku: item.sku
    };
  }

  private mapCustomCustomer(customCustomer: any): Customer {
    return {
      id: customCustomer.id?.toString() || customCustomer.customer_id?.toString(),
      email: customCustomer.email,
      first_name: customCustomer.first_name || customCustomer.firstname,
      last_name: customCustomer.last_name || customCustomer.lastname,
      phone: customCustomer.phone,
      platform: 'custom',
      platform_customer_id: customCustomer.id?.toString() || customCustomer.customer_id?.toString(),
      metadata: customCustomer
    };
  }
} 