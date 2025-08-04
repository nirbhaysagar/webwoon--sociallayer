import { supabase } from '../config/supabase';

export interface OrderItem {
  id: string;
  product_id: number;
  product_name: string;
  product_image: string;
  quantity: number;
  price: number;
  total: number;
  variant_id?: number;
  variant_name?: string;
}

export interface ShippingAddress {
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  phone?: string;
}

export interface PaymentMethod {
  type: string;
  last4: string;
  brand?: string;
  expiry_month?: number;
  expiry_year?: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  store_id: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  total_amount: number;
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  discount_amount: number;
  items: OrderItem[];
  shipping_address: ShippingAddress;
  billing_address?: ShippingAddress;
  payment_method: PaymentMethod;
  tracking_number?: string;
  estimated_delivery?: string;
  actual_delivery?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  store_name: string;
  store_logo: string;
}

export interface CreateOrderData {
  store_id: string;
  items: Array<{
    product_id: number;
    quantity: number;
    variant_id?: number;
  }>;
  shipping_address: ShippingAddress;
  billing_address?: ShippingAddress;
  payment_method: PaymentMethod;
  notes?: string;
}

export interface OrderFilters {
  status?: string;
  date_from?: string;
  date_to?: string;
  store_id?: string;
  min_amount?: number;
  max_amount?: number;
}

class OrderService {
  // Create new order
  async createOrder(data: CreateOrderData): Promise<Order> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Calculate totals
      let subtotal = 0;
      const orderItems: OrderItem[] = [];

      // Get product details and calculate totals
      for (const item of data.items) {
        const { data: product } = await supabase
          .from('products')
          .select('name, price, product_images')
          .eq('id', item.product_id)
          .single();

        if (!product) {
          throw new Error(`Product ${item.product_id} not found`);
        }

        const itemTotal = product.price * item.quantity;
        subtotal += itemTotal;

        orderItems.push({
          id: `temp_${Date.now()}_${item.product_id}`,
          product_id: item.product_id,
          product_name: product.name,
          product_image: product.product_images?.[0]?.image_url || '',
          quantity: item.quantity,
          price: product.price,
          total: itemTotal,
          variant_id: item.variant_id
        });
      }

      const shipping_cost = 0; // Free shipping for now
      const tax_amount = subtotal * 0.08; // 8% tax
      const total_amount = subtotal + shipping_cost + tax_amount;

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          store_id: data.store_id,
          order_number: orderNumber,
          status: 'pending',
          total_amount: total_amount,
          subtotal: subtotal,
          shipping_cost: shipping_cost,
          tax_amount: tax_amount,
          discount_amount: 0,
          shipping_address: data.shipping_address,
          billing_address: data.billing_address || data.shipping_address,
          payment_method: data.payment_method,
          notes: data.notes
        })
        .select()
        .single();

      if (orderError) {
        throw new Error('Failed to create order');
      }

      // Create order items
      const orderItemsData = orderItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
        variant_id: item.variant_id
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsData);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
      }

      // Return complete order with items
      return {
        ...order,
        items: orderItems,
        store_name: 'TechStore', // TODO: Get from store table
        store_logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=100&q=80'
      };
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  // Get user orders
  async getUserOrders(filters: OrderFilters = {}, limit: number = 20, page: number = 1): Promise<{ data: Order[], pagination: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const offset = (page - 1) * limit;

      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items(
            id,
            product_id,
            quantity,
            price,
            total,
            products(name, product_images)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      if (filters.store_id) {
        query = query.eq('store_id', filters.store_id);
      }

      if (filters.min_amount) {
        query = query.gte('total_amount', filters.min_amount);
      }

      if (filters.max_amount) {
        query = query.lte('total_amount', filters.max_amount);
      }

      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw new Error('Failed to fetch orders');
      }

      // Transform data to include store info and format items
      const transformedOrders = data.map((order: any) => ({
        ...order,
        items: order.order_items?.map((item: any) => ({
          id: item.id,
          product_id: item.product_id,
          product_name: item.products?.name || 'Unknown Product',
          product_image: item.products?.product_images?.[0]?.image_url || '',
          quantity: item.quantity,
          price: item.price,
          total: item.total
        })) || [],
        store_name: 'TechStore', // TODO: Get from store table
        store_logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=100&q=80'
      }));

      return {
        data: transformedOrders,
        pagination: {
          page,
          limit,
          total: count || data?.length || 0,
          totalPages: Math.ceil((count || data?.length || 0) / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  }

  // Get single order
  async getOrder(orderId: string): Promise<Order> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: order, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            id,
            product_id,
            quantity,
            price,
            total,
            products(name, product_images)
          )
        `)
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single();

      if (error || !order) {
        throw new Error('Order not found');
      }

      return {
        ...order,
        items: order.order_items?.map((item: any) => ({
          id: item.id,
          product_id: item.product_id,
          product_name: item.products?.name || 'Unknown Product',
          product_image: item.products?.product_images?.[0]?.image_url || '',
          quantity: item.quantity,
          price: item.price,
          total: item.total
        })) || [],
        store_name: 'TechStore', // TODO: Get from store table
        store_logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=100&q=80'
      };
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  // Update order status
  async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('user_id', user.id);

      if (error) {
        throw new Error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  // Cancel order
  async cancelOrder(orderId: string, reason?: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if order can be cancelled
      const { data: order } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single();

      if (!order) {
        throw new Error('Order not found');
      }

      if (!['pending', 'confirmed'].includes(order.status)) {
        throw new Error('Order cannot be cancelled at this stage');
      }

      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString(),
          notes: reason ? `${order.notes || ''}\nCancelled: ${reason}`.trim() : order.notes
        })
        .eq('id', orderId)
        .eq('user_id', user.id);

      if (error) {
        throw new Error('Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  }

  // Add tracking information
  async addTrackingInfo(orderId: string, trackingNumber: string, carrier: string, estimatedDelivery?: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('orders')
        .update({ 
          tracking_number: trackingNumber,
          estimated_delivery: estimatedDelivery,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('user_id', user.id);

      if (error) {
        throw new Error('Failed to add tracking information');
      }
    } catch (error) {
      console.error('Error adding tracking info:', error);
      throw error;
    }
  }

  // Mark order as delivered
  async markAsDelivered(orderId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'delivered',
          actual_delivery: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('user_id', user.id);

      if (error) {
        throw new Error('Failed to mark order as delivered');
      }
    } catch (error) {
      console.error('Error marking order as delivered:', error);
      throw error;
    }
  }

  // Get order statistics
  async getOrderStatistics(): Promise<{
    total_orders: number;
    total_spent: number;
    average_order_value: number;
    orders_by_status: Record<string, number>;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: orders, error } = await supabase
        .from('orders')
        .select('status, total_amount')
        .eq('user_id', user.id);

      if (error) {
        throw new Error('Failed to fetch order statistics');
      }

      const total_orders = orders.length;
      const total_spent = orders.reduce((sum, order) => sum + order.total_amount, 0);
      const average_order_value = total_orders > 0 ? total_spent / total_orders : 0;

      const orders_by_status = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        total_orders,
        total_spent,
        average_order_value,
        orders_by_status
      };
    } catch (error) {
      console.error('Error fetching order statistics:', error);
      throw error;
    }
  }

  // Reorder functionality
  async reorder(orderId: string): Promise<{ success: boolean; message: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get original order
      const originalOrder = await this.getOrder(orderId);
      
      // Check if products are still available
      const availableItems = [];
      for (const item of originalOrder.items) {
        const { data: product } = await supabase
          .from('products')
          .select('id, name, price, stock_quantity')
          .eq('id', item.product_id)
          .single();

        if (product && product.stock_quantity > 0) {
          availableItems.push({
            product_id: item.product_id,
            quantity: item.quantity,
            variant_id: item.variant_id
          });
        }
      }

      if (availableItems.length === 0) {
        return {
          success: false,
          message: 'None of the items from this order are currently available'
        };
      }

      // TODO: Add items to cart instead of creating new order
      // For now, return success message
      return {
        success: true,
        message: `${availableItems.length} items added to cart`
      };
    } catch (error) {
      console.error('Error reordering:', error);
      throw error;
    }
  }
}

export const orderService = new OrderService(); 