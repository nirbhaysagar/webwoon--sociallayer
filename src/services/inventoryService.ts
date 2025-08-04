import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Interfaces
export interface InventoryItem {
  id: string;
  product_id: number;
  seller_id: string;
  quantity_available: number;
  quantity_reserved: number;
  quantity_on_hold: number;
  low_stock_threshold: number;
  reorder_point: number;
  reorder_quantity: number;
  unit_cost: number;
  last_restock_date?: string;
  next_restock_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  product?: {
    id: number;
    name: string;
    price: number;
    image_url?: string;
  };
}

export interface ProductVariant {
  id: string;
  product_id: number;
  variant_name: string;
  variant_value: string;
  sku?: string;
  barcode?: string;
  quantity_available: number;
  quantity_reserved: number;
  unit_cost: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  seller_id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  payment_terms?: string;
  lead_time_days: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StockAlert {
  id: string;
  seller_id: string;
  product_id: number;
  alert_type: 'low_stock' | 'out_of_stock' | 'reorder_point';
  alert_level: 'warning' | 'critical' | 'info';
  message: string;
  is_read: boolean;
  is_resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
  created_at: string;
  product?: {
    id: number;
    name: string;
    price: number;
    image_url?: string;
  };
}

export interface InventoryHistory {
  id: string;
  inventory_id: string;
  product_id: number;
  seller_id: string;
  action_type: 'restock' | 'sale' | 'adjustment' | 'reservation' | 'hold';
  quantity_change: number;
  quantity_before: number;
  quantity_after: number;
  reference_type?: string;
  reference_id?: string;
  notes?: string;
  performed_by?: string;
  created_at: string;
}

export interface PurchaseOrder {
  id: string;
  seller_id: string;
  supplier_id: string;
  order_number: string;
  status: 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled';
  order_date: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  total_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  supplier?: Supplier;
  items?: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  product_id: number;
  variant_id?: string;
  quantity_ordered: number;
  quantity_received: number;
  unit_cost: number;
  total_cost: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  product?: {
    id: number;
    name: string;
    price: number;
    image_url?: string;
  };
}

export interface InventorySummary {
  total_products: number;
  low_stock_count: number;
  out_of_stock_count: number;
  total_value: number;
  alerts_count: number;
}

export interface InventorySettings {
  id: string;
  seller_id: string;
  default_low_stock_threshold: number;
  default_reorder_point: number;
  default_reorder_quantity: number;
  enable_auto_reorder: boolean;
  enable_stock_alerts: boolean;
  alert_email?: string;
  alert_phone?: string;
  created_at: string;
  updated_at: string;
}

class InventoryService {
  // Get inventory summary for seller
  async getInventorySummary(sellerId: string): Promise<InventorySummary> {
    try {
      const { data, error } = await supabase.rpc('get_inventory_summary', {
        p_seller_id: sellerId
      });

      if (error) throw error;

      return data[0] || {
        total_products: 0,
        low_stock_count: 0,
        out_of_stock_count: 0,
        total_value: 0,
        alerts_count: 0
      };
    } catch (error) {
      console.error('Error fetching inventory summary:', error);
      // Return mock data for development
      return {
        total_products: 25,
        low_stock_count: 3,
        out_of_stock_count: 1,
        total_value: 12500.00,
        alerts_count: 4
      };
    }
  }

  // Get all inventory items for seller
  async getInventoryItems(sellerId: string): Promise<InventoryItem[]> {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          *,
          product:products(id, name, price, image_url)
        `)
        .eq('seller_id', sellerId)
        .eq('is_active', true)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      // Return mock data for development
      return this.getMockInventoryItems();
    }
  }

  // Get inventory item by product ID
  async getInventoryItem(productId: number, sellerId: string): Promise<InventoryItem | null> {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          *,
          product:products(id, name, price, image_url)
        `)
        .eq('product_id', productId)
        .eq('seller_id', sellerId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching inventory item:', error);
      return null;
    }
  }

  // Update inventory quantity
  async updateInventoryQuantity(
    productId: number,
    sellerId: string,
    quantityChange: number,
    actionType: string,
    referenceType?: string,
    referenceId?: string,
    notes?: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('update_inventory_quantity', {
        p_product_id: productId,
        p_seller_id: sellerId,
        p_quantity_change: quantityChange,
        p_action_type: actionType,
        p_reference_type: referenceType,
        p_reference_id: referenceId,
        p_notes: notes
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error updating inventory quantity:', error);
      return false;
    }
  }

  // Get stock alerts for seller
  async getStockAlerts(sellerId: string, unreadOnly: boolean = false): Promise<StockAlert[]> {
    try {
      let query = supabase
        .from('stock_alerts')
        .select(`
          *,
          product:products(id, name, price, image_url)
        `)
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

      if (unreadOnly) {
        query = query.eq('is_read', false);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching stock alerts:', error);
      // Return mock data for development
      return this.getMockStockAlerts();
    }
  }

  // Mark stock alert as read
  async markAlertAsRead(alertId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('stock_alerts')
        .update({ is_read: true })
        .eq('id', alertId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error marking alert as read:', error);
      return false;
    }
  }

  // Mark stock alert as resolved
  async resolveAlert(alertId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('stock_alerts')
        .update({ 
          is_resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', alertId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error resolving alert:', error);
      return false;
    }
  }

  // Get inventory history
  async getInventoryHistory(
    sellerId: string,
    productId?: number,
    limit: number = 50
  ): Promise<InventoryHistory[]> {
    try {
      let query = supabase
        .from('inventory_history')
        .select('*')
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (productId) {
        query = query.eq('product_id', productId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching inventory history:', error);
      return [];
    }
  }

  // Get suppliers for seller
  async getSuppliers(sellerId: string): Promise<Supplier[]> {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('seller_id', sellerId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      return [];
    }
  }

  // Create or update supplier
  async saveSupplier(supplier: Partial<Supplier>): Promise<Supplier | null> {
    try {
      let query;
      if (supplier.id) {
        // Update existing supplier
        query = supabase
          .from('suppliers')
          .update(supplier)
          .eq('id', supplier.id)
          .select()
          .single();
      } else {
        // Create new supplier
        query = supabase
          .from('suppliers')
          .insert(supplier)
          .select()
          .single();
      }

      const { data, error } = await query;

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error saving supplier:', error);
      return null;
    }
  }

  // Get purchase orders for seller
  async getPurchaseOrders(sellerId: string): Promise<PurchaseOrder[]> {
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          supplier:suppliers(*),
          items:purchase_order_items(*)
        `)
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      return [];
    }
  }

  // Create purchase order
  async createPurchaseOrder(order: Partial<PurchaseOrder>): Promise<PurchaseOrder | null> {
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .insert(order)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating purchase order:', error);
      return null;
    }
  }

  // Get inventory settings for seller
  async getInventorySettings(sellerId: string): Promise<InventorySettings | null> {
    try {
      const { data, error } = await supabase
        .from('inventory_settings')
        .select('*')
        .eq('seller_id', sellerId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching inventory settings:', error);
      // Return default settings
      return {
        id: '',
        seller_id: sellerId,
        default_low_stock_threshold: 10,
        default_reorder_point: 5,
        default_reorder_quantity: 50,
        enable_auto_reorder: false,
        enable_stock_alerts: true,
        alert_email: '',
        alert_phone: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
  }

  // Save inventory settings
  async saveInventorySettings(settings: Partial<InventorySettings>): Promise<InventorySettings | null> {
    try {
      let query;
      if (settings.id) {
        // Update existing settings
        query = supabase
          .from('inventory_settings')
          .update(settings)
          .eq('id', settings.id)
          .select()
          .single();
      } else {
        // Create new settings
        query = supabase
          .from('inventory_settings')
          .insert(settings)
          .select()
          .single();
      }

      const { data, error } = await query;

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error saving inventory settings:', error);
      return null;
    }
  }

  // Mock data for development
  private getMockInventoryItems(): InventoryItem[] {
    return [
      {
        id: '1',
        product_id: 1,
        seller_id: 'seller-1',
        quantity_available: 50,
        quantity_reserved: 5,
        quantity_on_hold: 0,
        low_stock_threshold: 10,
        reorder_point: 5,
        reorder_quantity: 50,
        unit_cost: 25.00,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z',
        product: {
          id: 1,
          name: 'Premium Wireless Headphones',
          price: 199.99,
          image_url: 'https://example.com/headphones.jpg'
        }
      },
      {
        id: '2',
        product_id: 2,
        seller_id: 'seller-1',
        quantity_available: 8,
        quantity_reserved: 2,
        quantity_on_hold: 0,
        low_stock_threshold: 10,
        reorder_point: 5,
        reorder_quantity: 30,
        unit_cost: 15.00,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z',
        product: {
          id: 2,
          name: 'Smart Fitness Watch',
          price: 299.99,
          image_url: 'https://example.com/watch.jpg'
        }
      },
      {
        id: '3',
        product_id: 3,
        seller_id: 'seller-1',
        quantity_available: 0,
        quantity_reserved: 0,
        quantity_on_hold: 0,
        low_stock_threshold: 10,
        reorder_point: 5,
        reorder_quantity: 25,
        unit_cost: 8.00,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z',
        product: {
          id: 3,
          name: 'Bluetooth Speaker',
          price: 89.99,
          image_url: 'https://example.com/speaker.jpg'
        }
      }
    ];
  }

  private getMockStockAlerts(): StockAlert[] {
    return [
      {
        id: '1',
        seller_id: 'seller-1',
        product_id: 2,
        alert_type: 'low_stock',
        alert_level: 'warning',
        message: 'Smart Fitness Watch is running low on stock. Current quantity: 8',
        is_read: false,
        is_resolved: false,
        created_at: '2024-01-15T10:30:00Z',
        product: {
          id: 2,
          name: 'Smart Fitness Watch',
          price: 299.99,
          image_url: 'https://example.com/watch.jpg'
        }
      },
      {
        id: '2',
        seller_id: 'seller-1',
        product_id: 3,
        alert_type: 'out_of_stock',
        alert_level: 'critical',
        message: 'Bluetooth Speaker is out of stock!',
        is_read: false,
        is_resolved: false,
        created_at: '2024-01-15T09:15:00Z',
        product: {
          id: 3,
          name: 'Bluetooth Speaker',
          price: 89.99,
          image_url: 'https://example.com/speaker.jpg'
        }
      }
    ];
  }
}

export const inventoryService = new InventoryService();
export default inventoryService; 