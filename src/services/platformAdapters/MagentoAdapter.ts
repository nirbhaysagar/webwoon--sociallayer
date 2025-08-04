import { BasePlatformAdapter, PlatformConfig, PlatformCredentials, Product, Order, Customer, StoreInfo, SyncOptions } from './types';

export class MagentoAdapter extends BasePlatformAdapter {
  constructor(config: PlatformConfig) {
    super('magento', config);
  }

  async validateCredentials(credentials: PlatformCredentials): Promise<boolean> {
    try {
      const response = await fetch(`${credentials.base_url}/rest/V1/store/websites`, {
        headers: {
          'Authorization': `Bearer ${credentials.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async getStoreInfo(credentials: PlatformCredentials): Promise<StoreInfo> {
    const response = await fetch(`${credentials.base_url}/rest/V1/store/storeConfigs`, {
      headers: {
        'Authorization': `Bearer ${credentials.access_token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get store info: ${response.statusText}`);
    }
    
    const data = await response.json();
    return {
      name: data[0]?.general?.general_information?.name || 'Magento Store',
      domain: credentials.base_url,
      currency: data[0]?.general?.currency_information?.base_currency_code || 'USD',
      platform: 'magento',
      metadata: {
        magento_version: data[0]?.system?.system_information?.magento_version
      }
    };
  }

  async getProducts(credentials: PlatformCredentials, options?: SyncOptions): Promise<Product[]> {
    const limit = options?.limit || 100;
    const response = await fetch(
      `${credentials.base_url}/rest/V1/products?searchCriteria[pageSize]=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${credentials.access_token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to get products: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.items.map(this.mapMagentoProduct);
  }

  async getOrders(credentials: PlatformCredentials, options?: SyncOptions): Promise<Order[]> {
    const limit = options?.limit || 100;
    const response = await fetch(
      `${credentials.base_url}/rest/V1/orders?searchCriteria[pageSize]=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${credentials.access_token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to get orders: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.items.map(this.mapMagentoOrder);
  }

  async getCustomers(credentials: PlatformCredentials, options?: SyncOptions): Promise<Customer[]> {
    const limit = options?.limit || 100;
    const response = await fetch(
      `${credentials.base_url}/rest/V1/customers?searchCriteria[pageSize]=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${credentials.access_token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to get customers: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.items.map(this.mapMagentoCustomer);
  }

  private mapMagentoProduct(magentoProduct: any): Product {
    return {
      id: magentoProduct.id.toString(),
      name: magentoProduct.name,
      description: magentoProduct.custom_attributes?.description?.value,
      price: parseFloat(magentoProduct.price || '0'),
      sku: magentoProduct.sku,
      inventory: magentoProduct.extension_attributes?.stock_item?.qty || 0,
      images: magentoProduct.media_gallery_entries?.map((img: any) => img.file) || [],
      status: magentoProduct.status === 1 ? 'active' : 'inactive',
      platform: 'magento',
      platform_product_id: magentoProduct.id.toString(),
      metadata: {
        type_id: magentoProduct.type_id,
        attribute_set_id: magentoProduct.attribute_set_id
      }
    };
  }

  private mapMagentoOrder(magentoOrder: any): Order {
    return {
      id: magentoOrder.entity_id.toString(),
      order_number: magentoOrder.increment_id,
      customer_email: magentoOrder.customer_email,
      total_amount: parseFloat(magentoOrder.grand_total),
      currency: magentoOrder.order_currency_code,
      status: magentoOrder.status,
      order_date: new Date(magentoOrder.created_at),
      items: magentoOrder.items.map(this.mapMagentoOrderItem),
      platform: 'magento',
      platform_order_id: magentoOrder.entity_id.toString(),
      metadata: {
        state: magentoOrder.state,
        status: magentoOrder.status,
        customer_id: magentoOrder.customer_id
      }
    };
  }

  private mapMagentoOrderItem(item: any) {
    return {
      id: item.item_id.toString(),
      product_id: item.product_id.toString(),
      product_name: item.name,
      quantity: parseFloat(item.qty_ordered),
      unit_price: parseFloat(item.price),
      total_price: parseFloat(item.row_total),
      sku: item.sku
    };
  }

  private mapMagentoCustomer(magentoCustomer: any): Customer {
    return {
      id: magentoCustomer.id.toString(),
      email: magentoCustomer.email,
      first_name: magentoCustomer.firstname,
      last_name: magentoCustomer.lastname,
      phone: magentoCustomer.custom_attributes?.telephone?.value,
      platform: 'magento',
      platform_customer_id: magentoCustomer.id.toString(),
      metadata: {
        group_id: magentoCustomer.group_id,
        created_at: magentoCustomer.created_at
      }
    };
  }
} 