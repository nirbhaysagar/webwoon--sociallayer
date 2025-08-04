import { supabase } from '../config/supabase';

export interface InventoryItem {
  id: number;
  product_id: number;
  seller_id: number;
  sku: string;
  barcode?: string;
  quantity_available: number;
  quantity_reserved: number;
  quantity_on_order: number;
  quantity_damaged: number;
  quantity_lost: number;
  minimum_stock_level: number;
  maximum_stock_level: number;
  reorder_point: number;
  reorder_quantity: number;
  unit_cost: number;
  unit_price: number;
  supplier_id?: number;
  supplier_name?: string;
  supplier_sku?: string;
  location_id?: number;
  location_name?: string;
  is_active: boolean;
  last_updated: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryLocation {
  id: number;
  seller_id: number;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  is_primary: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryTransaction {
  id: number;
  inventory_id: number;
  transaction_type: 'purchase' | 'sale' | 'adjustment' | 'transfer' | 'damage' | 'loss';
  quantity_change: number;
  quantity_before: number;
  quantity_after: number;
  reference_type?: string;
  reference_id?: number;
  notes?: string;
  performed_by?: number;
  transaction_date: string;
  created_at: string;
}

export interface InventoryAlert {
  id: number;
  inventory_id: number;
  alert_type: 'low_stock' | 'out_of_stock' | 'overstock' | 'expiring' | 'damaged';
  alert_level: 'info' | 'warning' | 'critical';
  message: string;
  is_resolved: boolean;
  resolved_by?: number;
  resolved_at?: string;
  created_at: string;
}

export interface PurchaseOrder {
  id: number;
  seller_id: number;
  supplier_id?: number;
  supplier_name?: string;
  po_number: string;
  status: 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled';
  order_date: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  total_amount: number;
  notes?: string;
  created_by?: number;
  created_at: string;
  updated_at: string;
}

export interface InventorySummary {
  total_products: number;
  total_quantity: number;
  total_value: number;
  low_stock_count: number;
  out_of_stock_count: number;
  total_alerts: number;
}

class InventoryManagementService {
  // Get all inventory items for a seller
  async getInventoryItems(sellerId: number): Promise<InventoryItem[]> {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('seller_id', sellerId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      throw error;
    }
  }

  // Get inventory overview with product details
  async getInventoryOverview(sellerId: number) {
    try {
      const { data, error } = await supabase
        .from('inventory_overview')
        .select('*')
        .eq('seller_id', sellerId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching inventory overview:', error);
      throw error;
    }
  }

  // Get inventory summary statistics
  async getInventorySummary(sellerId: number): Promise<InventorySummary> {
    try {
      const { data, error } = await supabase
        .rpc('get_inventory_summary', { p_seller_id: sellerId });

      if (error) throw error;
      return data?.[0] || {
        total_products: 0,
        total_quantity: 0,
        total_value: 0,
        low_stock_count: 0,
        out_of_stock_count: 0,
        total_alerts: 0
      };
    } catch (error) {
      console.error('Error fetching inventory summary:', error);
      throw error;
    }
  }

  // Get low stock alerts
  async getLowStockAlerts(sellerId: number) {
    try {
      const { data, error } = await supabase
        .from('low_stock_alerts')
        .select('*');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching low stock alerts:', error);
      throw error;
    }
  }

  // Get inventory alerts
  async getInventoryAlerts(sellerId: number): Promise<InventoryAlert[]> {
    try {
      const { data, error } = await supabase
        .from('inventory_alerts')
        .select(`
          *,
          inventory!inner(seller_id)
        `)
        .eq('inventory.seller_id', sellerId)
        .eq('is_resolved', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching inventory alerts:', error);
      throw error;
    }
  }

  // Update inventory quantity
  async updateInventoryQuantity(
    inventoryId: number,
    quantityChange: number,
    transactionType: string,
    referenceType?: string,
    referenceId?: number,
    notes?: string,
    performedBy?: number
  ): Promise<number> {
    try {
      const { data, error } = await supabase
        .rpc('update_inventory_quantity', {
          p_inventory_id: inventoryId,
          p_quantity_change: quantityChange,
          p_transaction_type: transactionType,
          p_reference_type: referenceType,
          p_reference_id: referenceId,
          p_notes: notes,
          p_performed_by: performedBy
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating inventory quantity:', error);
      throw error;
    }
  }

  // Create inventory adjustment
  async createInventoryAdjustment(
    inventoryId: number,
    adjustmentType: string,
    quantityAdjusted: number,
    reason: string,
    adjustedBy?: number
  ) {
    try {
      const { data, error } = await supabase
        .from('inventory_adjustments')
        .insert({
          inventory_id: inventoryId,
          adjustment_type: adjustmentType,
          quantity_adjusted: quantityAdjusted,
          reason: reason,
          adjusted_by: adjustedBy
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating inventory adjustment:', error);
      throw error;
    }
  }

  // Get inventory transactions
  async getInventoryTransactions(inventoryId?: number, limit = 50): Promise<InventoryTransaction[]> {
    try {
      let query = supabase
        .from('inventory_transactions')
        .select('*')
        .order('transaction_date', { ascending: false })
        .limit(limit);

      if (inventoryId) {
        query = query.eq('inventory_id', inventoryId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching inventory transactions:', error);
      throw error;
    }
  }

  // Get inventory locations
  async getInventoryLocations(sellerId: number): Promise<InventoryLocation[]> {
    try {
      const { data, error } = await supabase
        .from('inventory_locations')
        .select('*')
        .eq('seller_id', sellerId)
        .eq('is_active', true)
        .order('is_primary', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching inventory locations:', error);
      throw error;
    }
  }

  // Create inventory location
  async createInventoryLocation(locationData: Partial<InventoryLocation>): Promise<InventoryLocation> {
    try {
      const { data, error } = await supabase
        .from('inventory_locations')
        .insert(locationData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating inventory location:', error);
      throw error;
    }
  }

  // Update inventory location
  async updateInventoryLocation(id: number, updates: Partial<InventoryLocation>): Promise<InventoryLocation> {
    try {
      const { data, error } = await supabase
        .from('inventory_locations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating inventory location:', error);
      throw error;
    }
  }

  // Create purchase order
  async createPurchaseOrder(orderData: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .insert(orderData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating purchase order:', error);
      throw error;
    }
  }

  // Get purchase orders
  async getPurchaseOrders(sellerId: number): Promise<PurchaseOrder[]> {
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select('*')
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      throw error;
    }
  }

  // Update purchase order status
  async updatePurchaseOrderStatus(id: number, status: string): Promise<PurchaseOrder> {
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating purchase order status:', error);
      throw error;
    }
  }

  // Get inventory analytics
  async getInventoryAnalytics(inventoryId: number, days: number = 30) {
    try {
      const { data, error } = await supabase
        .from('inventory_analytics')
        .select('*')
        .eq('inventory_id', inventoryId)
        .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching inventory analytics:', error);
      throw error;
    }
  }

  // Calculate inventory turnover
  async calculateInventoryTurnover(inventoryId: number, days: number = 30): Promise<number> {
    try {
      const { data, error } = await supabase
        .rpc('calculate_inventory_turnover', {
          p_inventory_id: inventoryId,
          p_days: days
        });

      if (error) throw error;
      return data || 0;
    } catch (error) {
      console.error('Error calculating inventory turnover:', error);
      throw error;
    }
  }

  // Search inventory
  async searchInventory(sellerId: number, searchTerm: string): Promise<InventoryItem[]> {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          *,
          products!inner(name, description)
        `)
        .eq('seller_id', sellerId)
        .eq('is_active', true)
        .or(`sku.ilike.%${searchTerm}%,products.name.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching inventory:', error);
      throw error;
    }
  }

  // Bulk update inventory
  async bulkUpdateInventory(updates: Array<{ id: number; updates: Partial<InventoryItem> }>) {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .upsert(updates.map(({ id, updates }) => ({ id, ...updates, updated_at: new Date().toISOString() })))
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error bulk updating inventory:', error);
      throw error;
    }
  }

  // Export inventory data
  async exportInventoryData(sellerId: number, format: 'csv' | 'json' = 'json') {
    try {
      const { data, error } = await supabase
        .from('inventory_overview')
        .select('*')
        .eq('seller_id', sellerId);

      if (error) throw error;

      if (format === 'csv') {
        // Convert to CSV format
        const headers = Object.keys(data[0] || {}).join(',');
        const rows = data.map(row => Object.values(row).join(','));
        return [headers, ...rows].join('\n');
      }

      return data;
    } catch (error) {
      console.error('Error exporting inventory data:', error);
      throw error;
    }
  }

  // Get inventory settings
  async getInventorySettings(sellerId: number) {
    try {
      const { data, error } = await supabase
        .from('inventory_settings')
        .select('*')
        .eq('seller_id', sellerId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching inventory settings:', error);
      throw error;
    }
  }

  // Update inventory settings
  async updateInventorySettings(sellerId: number, settings: Array<{ setting_key: string; setting_value: string; setting_type: string }>) {
    try {
      const { data, error } = await supabase
        .from('inventory_settings')
        .upsert(settings.map(setting => ({ seller_id: sellerId, ...setting, updated_at: new Date().toISOString() })))
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating inventory settings:', error);
      throw error;
    }
  }
}

export default new InventoryManagementService(); 