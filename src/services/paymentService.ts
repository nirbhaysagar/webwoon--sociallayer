import { supabase } from './supabase';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'apple_pay';
  last4?: string;
  brand?: string;
  isDefault: boolean;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed';
  paymentMethodId: string;
}

export interface Order {
  id: string;
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentIntentId: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
}

export class PaymentService {
  // Create a payment intent (for Stripe integration)
  static async createPaymentIntent(amount: number, currency: string = 'usd'): Promise<PaymentIntent> {
    try {
      // In a real app, this would call your backend API
      // For now, we'll simulate the payment intent creation
      const paymentIntent: PaymentIntent = {
        id: `pi_${Math.random().toString(36).substr(2, 9)}`,
        amount: amount * 100, // Convert to cents
        currency,
        status: 'pending',
        paymentMethodId: 'pm_default'
      };

      return paymentIntent;
    } catch (error) {
      console.error('PaymentService.createPaymentIntent error:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  // Process payment
  static async processPayment(paymentIntentId: string, paymentMethod: any): Promise<boolean> {
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, this would call Stripe's API
      console.log('Processing payment:', paymentIntentId);
      
      return true;
    } catch (error) {
      console.error('PaymentService.processPayment error:', error);
      return false;
    }
  }

  // Create order in database
  static async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          user_id: orderData.userId,
          items: orderData.items,
          subtotal: orderData.subtotal,
          tax: orderData.tax,
          shipping: orderData.shipping,
          total: orderData.total,
          status: orderData.status,
          payment_intent_id: orderData.paymentIntentId,
          shipping_address: orderData.shippingAddress,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating order:', error);
        throw error;
      }

      return {
        id: data.id,
        userId: data.user_id,
        items: data.items,
        subtotal: data.subtotal,
        tax: data.tax,
        shipping: data.shipping,
        total: data.total,
        status: data.status,
        paymentIntentId: data.payment_intent_id,
        shippingAddress: data.shipping_address,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('PaymentService.createOrder error:', error);
      throw new Error('Failed to create order');
    }
  }

  // Get user's orders
  static async getUserOrders(userId: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }

      return data.map(order => ({
        id: order.id,
        userId: order.user_id,
        items: order.items,
        subtotal: order.subtotal,
        tax: order.tax,
        shipping: order.shipping,
        total: order.total,
        status: order.status,
        paymentIntentId: order.payment_intent_id,
        shippingAddress: order.shipping_address,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
      }));
    } catch (error) {
      console.error('PaymentService.getUserOrders error:', error);
      throw new Error('Failed to fetch orders');
    }
  }

  // Get order by ID
  static async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) {
        console.error('Error fetching order:', error);
        return null;
      }

      return {
        id: data.id,
        userId: data.user_id,
        items: data.items,
        subtotal: data.subtotal,
        tax: data.tax,
        shipping: data.shipping,
        total: data.total,
        status: data.status,
        paymentIntentId: data.payment_intent_id,
        shippingAddress: data.shipping_address,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('PaymentService.getOrderById error:', error);
      return null;
    }
  }

  // Update order status
  static async updateOrderStatus(orderId: string, status: Order['status']): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('PaymentService.updateOrderStatus error:', error);
      return false;
    }
  }

  // Save payment method
  static async savePaymentMethod(userId: string, paymentMethod: PaymentMethod): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .insert({
          user_id: userId,
          type: paymentMethod.type,
          last4: paymentMethod.last4,
          brand: paymentMethod.brand,
          is_default: paymentMethod.isDefault,
        });

      if (error) {
        console.error('Error saving payment method:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('PaymentService.savePaymentMethod error:', error);
      return false;
    }
  }

  // Get user's payment methods
  static async getUserPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });

      if (error) {
        console.error('Error fetching payment methods:', error);
        return [];
      }

      return data.map(method => ({
        id: method.id,
        type: method.type,
        last4: method.last4,
        brand: method.brand,
        isDefault: method.is_default,
      }));
    } catch (error) {
      console.error('PaymentService.getUserPaymentMethods error:', error);
      return [];
    }
  }

  // Delete payment method
  static async deletePaymentMethod(paymentMethodId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', paymentMethodId);

      if (error) {
        console.error('Error deleting payment method:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('PaymentService.deletePaymentMethod error:', error);
      return false;
    }
  }

  // Calculate tax based on location
  static calculateTax(subtotal: number, state: string): number {
    // Simplified tax calculation - in a real app, you'd use a tax service
    const taxRates: { [key: string]: number } = {
      'NY': 0.085,
      'CA': 0.0825,
      'TX': 0.0625,
      'FL': 0.06,
      'WA': 0.065,
    };

    const rate = taxRates[state] || 0.08; // Default 8%
    return subtotal * rate;
  }

  // Calculate shipping cost
  static calculateShipping(items: any[], address: any): number {
    // Simplified shipping calculation
    const baseShipping = 9.99;
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    
    // Free shipping for orders over $50
    const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    if (subtotal >= 50) {
      return 0;
    }

    // Add $2 per additional item
    return baseShipping + (Math.max(0, itemCount - 1) * 2);
  }
} 