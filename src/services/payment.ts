import { supabase } from './supabase';

// Payment service for Stripe integration
export const paymentService = {
  // Initialize Stripe payment intent
  async createPaymentIntent(amount: number, currency: string = 'usd') {
    try {
      // This would typically call your backend API
      // For now, we'll simulate the Stripe integration
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const data = await response.json();
      return data.clientSecret;
    } catch (error) {
      console.error('Payment intent creation error:', error);
      throw new Error('Payment initialization failed');
    }
  },

  // Process payment with Stripe
  async processPayment(paymentMethodId: string, amount: number, orderId: string) {
    try {
      const response = await fetch('/api/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethodId,
          amount,
          orderId,
        }),
      });

      if (!response.ok) {
        throw new Error('Payment processing failed');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Payment processing error:', error);
      throw new Error('Payment failed');
    }
  },

  // Create order in database
  async createOrder(orderData: {
    userId: string;
    storeId: string;
    items: Array<{
      productId: string;
      quantity: number;
      price: number;
    }>;
    totalAmount: number;
    shippingAddress: any;
    billingAddress: any;
  }) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          user_id: orderData.userId,
          store_id: orderData.storeId,
          total_amount: orderData.totalAmount,
          status: 'pending',
          shipping_address: orderData.shippingAddress,
          billing_address: orderData.billingAddress,
          items: orderData.items,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Order creation error:', error);
      throw new Error('Failed to create order');
    }
  },

  // Update order status
  async updateOrderStatus(orderId: string, status: string, paymentIntentId?: string) {
    try {
      const updateData: any = { status };
      if (paymentIntentId) {
        updateData.payment_intent_id = paymentIntentId;
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Order status update error:', error);
      throw new Error('Failed to update order status');
    }
  },

  // Get user's order history
  async getUserOrders(userId: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          stores(name, logo_url),
          order_items(
            *,
            products(name, price, image_url)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get user orders error:', error);
      throw new Error('Failed to fetch order history');
    }
  },

  // Process refund
  async processRefund(orderId: string, amount: number, reason: string) {
    try {
      const response = await fetch('/api/process-refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          amount,
          reason,
        }),
      });

      if (!response.ok) {
        throw new Error('Refund processing failed');
      }

      const result = await response.json();
      
      // Update order status in database
      await this.updateOrderStatus(orderId, 'refunded');
      
      return result;
    } catch (error) {
      console.error('Refund processing error:', error);
      throw new Error('Refund failed');
    }
  },

  // Validate payment method
  async validatePaymentMethod(paymentMethodId: string) {
    try {
      const response = await fetch('/api/validate-payment-method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethodId,
        }),
      });

      if (!response.ok) {
        throw new Error('Payment method validation failed');
      }

      const result = await response.json();
      return result.isValid;
    } catch (error) {
      console.error('Payment method validation error:', error);
      return false;
    }
  },

  // Get payment methods for user
  async getUserPaymentMethods(userId: string) {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get payment methods error:', error);
      throw new Error('Failed to fetch payment methods');
    }
  },

  // Save payment method
  async savePaymentMethod(userId: string, paymentMethodData: any) {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .insert({
          user_id: userId,
          payment_method_id: paymentMethodData.id,
          card_brand: paymentMethodData.card.brand,
          card_last4: paymentMethodData.card.last4,
          card_exp_month: paymentMethodData.card.exp_month,
          card_exp_year: paymentMethodData.card.exp_year,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Save payment method error:', error);
      throw new Error('Failed to save payment method');
    }
  },
};

// Payment validation utilities
export const paymentValidation = {
  // Validate card number (Luhn algorithm)
  validateCardNumber(cardNumber: string): boolean {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (!/^\d+$/.test(cleaned)) return false;
    
    let sum = 0;
    let isEven = false;
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  },

  // Validate expiry date
  validateExpiryDate(month: string, year: string): boolean {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    const expMonth = parseInt(month);
    const expYear = parseInt(year);
    
    if (expYear < currentYear) return false;
    if (expYear === currentYear && expMonth < currentMonth) return false;
    if (expMonth < 1 || expMonth > 12) return false;
    
    return true;
  },

  // Validate CVV
  validateCVV(cvv: string, cardBrand?: string): boolean {
    const cleaned = cvv.replace(/\s/g, '');
    if (!/^\d+$/.test(cleaned)) return false;
    
    const length = cleaned.length;
    if (cardBrand === 'amex') {
      return length === 4;
    }
    return length === 3 || length === 4;
  },

  // Format card number with spaces
  formatCardNumber(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  },

  // Format expiry date
  formatExpiryDate(month: string, year: string): string {
    return `${month}/${year}`;
  },
}; 