import { StripeService, StripePaymentIntent, StripePaymentMethod } from './stripeService';
import { PayPalService, PayPalOrder, PayPalCapture } from './paypalService';
import { PaymentService } from './paymentService';

export type PaymentProvider = 'stripe' | 'paypal';

export interface PaymentRequest {
  amount: number;
  currency: string;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  metadata?: any;
  customerId?: string;
}

export interface PaymentResponse {
  success: boolean;
  provider: PaymentProvider;
  transactionId: string;
  amount: number;
  currency: string;
  status: string;
  error?: string;
  metadata?: any;
}

export interface PaymentMethod {
  id: string;
  provider: PaymentProvider;
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
  displayName: string;
  isDefault: boolean;
  last4?: string;
  brand?: string;
  expMonth?: number;
  expYear?: number;
}

export interface RefundRequest {
  transactionId: string;
  provider: PaymentProvider;
  amount?: number;
  reason?: string;
}

export class UnifiedPaymentService {
  private static defaultProvider: PaymentProvider = 'stripe';

  // Initialize all payment providers
  static async initialize(): Promise<boolean> {
    try {
      const stripeInit = await StripeService.initialize();
      const paypalInit = await PayPalService.initialize();
      
      console.log('Payment providers initialized:', { stripe: stripeInit, paypal: paypalInit });
      return stripeInit || paypalInit;
    } catch (error) {
      console.error('UnifiedPaymentService.initialize error:', error);
      return false;
    }
  }

  // Process payment with specified provider
  static async processPayment(request: PaymentRequest, provider: PaymentProvider = this.defaultProvider): Promise<PaymentResponse> {
    try {
      switch (provider) {
        case 'stripe':
          return await this.processStripePayment(request);
        case 'paypal':
          return await this.processPayPalPayment(request);
        default:
          throw new Error(`Unsupported payment provider: ${provider}`);
      }
    } catch (error) {
      console.error('UnifiedPaymentService.processPayment error:', error);
      return {
        success: false,
        provider,
        transactionId: '',
        amount: request.amount,
        currency: request.currency,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Payment processing failed',
      };
    }
  }

  // Process Stripe payment
  private static async processStripePayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Create payment intent
      const paymentIntent = await StripeService.createPaymentIntent(
        request.amount,
        request.currency,
        request.metadata
      );

      // In a real app, you'd confirm the payment with the client secret
      // For now, we'll simulate a successful payment
      const isConfirmed = await this.simulateStripeConfirmation(paymentIntent.clientSecret);

      if (isConfirmed) {
        return {
          success: true,
          provider: 'stripe',
          transactionId: paymentIntent.id,
          amount: request.amount,
          currency: request.currency,
          status: 'succeeded',
          metadata: request.metadata,
        };
      } else {
        throw new Error('Payment confirmation failed');
      }
    } catch (error) {
      throw error;
    }
  }

  // Process PayPal payment
  private static async processPayPalPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Create PayPal order
      const paypalOrder = await PayPalService.createOrder(
        request.amount,
        request.currency,
        request.items
      );

      // Capture the payment
      const capture = await PayPalService.capturePayment(paypalOrder.id);

      if (PayPalService.isCaptureCompleted(capture)) {
        return {
          success: true,
          provider: 'paypal',
          transactionId: capture.id,
          amount: request.amount,
          currency: request.currency,
          status: 'completed',
          metadata: request.metadata,
        };
      } else {
        throw new Error('PayPal payment capture failed');
      }
    } catch (error) {
      throw error;
    }
  }

  // Get available payment methods for user
  static async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    try {
      const methods: PaymentMethod[] = [];

      // Get Stripe payment methods
      try {
        const stripeMethods = await StripeService.getCustomerPaymentMethods();
        methods.push(...stripeMethods.map(method => ({
          id: method.id,
          provider: 'stripe' as PaymentProvider,
          type: method.type,
          displayName: this.formatPaymentMethodDisplay(method),
          isDefault: method.isDefault,
          last4: method.card?.last4,
          brand: method.card?.brand,
          expMonth: method.card?.expMonth,
          expYear: method.card?.expYear,
        })));
      } catch (error) {
        console.error('Error fetching Stripe payment methods:', error);
      }

      // In a real app, you'd also fetch PayPal payment methods
      // PayPal doesn't have saved payment methods in the same way as Stripe

      return methods;
    } catch (error) {
      console.error('UnifiedPaymentService.getPaymentMethods error:', error);
      return [];
    }
  }

  // Save payment method
  static async savePaymentMethod(userId: string, paymentMethod: PaymentMethod): Promise<boolean> {
    try {
      switch (paymentMethod.provider) {
        case 'stripe':
          // Create setup intent and save payment method
          const setupIntent = await StripeService.createSetupIntent();
          const savedMethod = await StripeService.savePaymentMethod(setupIntent.id, paymentMethod.id);
          return !!savedMethod;
        case 'paypal':
          // PayPal doesn't support saving payment methods in the same way
          return true;
        default:
          return false;
      }
    } catch (error) {
      console.error('UnifiedPaymentService.savePaymentMethod error:', error);
      return false;
    }
  }

  // Delete payment method
  static async deletePaymentMethod(paymentMethodId: string, provider: PaymentProvider): Promise<boolean> {
    try {
      switch (provider) {
        case 'stripe':
          return await StripeService.deletePaymentMethod(paymentMethodId);
        case 'paypal':
          // PayPal doesn't support deleting saved payment methods
          return true;
        default:
          return false;
      }
    } catch (error) {
      console.error('UnifiedPaymentService.deletePaymentMethod error:', error);
      return false;
    }
  }

  // Process refund
  static async processRefund(refundRequest: RefundRequest): Promise<boolean> {
    try {
      switch (refundRequest.provider) {
        case 'stripe':
          return await StripeService.processRefund(refundRequest.transactionId, refundRequest.amount);
        case 'paypal':
          const refund = await PayPalService.processRefund(
            refundRequest.transactionId,
            refundRequest.amount,
            refundRequest.reason
          );
          return PayPalService.isRefundCompleted(refund);
        default:
          return false;
      }
    } catch (error) {
      console.error('UnifiedPaymentService.processRefund error:', error);
      return false;
    }
  }

  // Get transaction status
  static async getTransactionStatus(transactionId: string, provider: PaymentProvider): Promise<string | null> {
    try {
      switch (provider) {
        case 'stripe':
          const paymentIntent = await StripeService.getPaymentIntentStatus(transactionId);
          return paymentIntent?.status || null;
        case 'paypal':
          const capture = await PayPalService.getCaptureDetails(transactionId);
          return capture?.status || null;
        default:
          return null;
      }
    } catch (error) {
      console.error('UnifiedPaymentService.getTransactionStatus error:', error);
      return null;
    }
  }

  // Validate payment method
  static validatePaymentMethod(paymentMethod: PaymentMethod): boolean {
    try {
      switch (paymentMethod.provider) {
        case 'stripe':
          return !!paymentMethod.id && !!paymentMethod.displayName;
        case 'paypal':
          return true; // PayPal validation is handled differently
        default:
          return false;
      }
    } catch (error) {
      console.error('UnifiedPaymentService.validatePaymentMethod error:', error);
      return false;
    }
  }

  // Get supported payment providers
  static getSupportedProviders(): PaymentProvider[] {
    return ['stripe', 'paypal'];
  }

  // Check if provider is available
  static async isProviderAvailable(provider: PaymentProvider): Promise<boolean> {
    try {
      switch (provider) {
        case 'stripe':
          return await StripeService.initialize();
        case 'paypal':
          return await PayPalService.initialize();
        default:
          return false;
      }
    } catch (error) {
      console.error('UnifiedPaymentService.isProviderAvailable error:', error);
      return false;
    }
  }

  // Get provider-specific features
  static getProviderFeatures(provider: PaymentProvider): string[] {
    switch (provider) {
      case 'stripe':
        return [
          'Credit/Debit Cards',
          'Apple Pay',
          'Google Pay',
          'Saved Payment Methods',
          'Subscriptions',
          'Refunds',
          'International Payments'
        ];
      case 'paypal':
        return [
          'PayPal Balance',
          'Credit/Debit Cards',
          'Bank Transfers',
          'Subscriptions',
          'Refunds',
          'International Payments',
          'Buy Now, Pay Later'
        ];
      default:
        return [];
    }
  }

  // Format payment method for display
  private static formatPaymentMethodDisplay(method: StripePaymentMethod): string {
    if (method.card) {
      return `${method.card.brand.toUpperCase()} •••• ${method.card.last4}`;
    }
    return method.type.replace('_', ' ').toUpperCase();
  }

  // Simulate Stripe payment confirmation (for demo purposes)
  private static async simulateStripeConfirmation(clientSecret: string): Promise<boolean> {
    // In a real app, this would use Stripe's SDK to confirm the payment
    await new Promise(resolve => setTimeout(resolve, 1000));
    return Math.random() > 0.1; // 90% success rate for demo
  }

  // Create order in database after successful payment
  static async createOrderFromPayment(paymentResponse: PaymentResponse, orderData: any): Promise<any> {
    try {
      const order = await PaymentService.createOrder({
        userId: orderData.userId,
        items: orderData.items,
        subtotal: orderData.subtotal,
        tax: orderData.tax,
        shipping: orderData.shipping,
        total: orderData.total,
        status: 'processing',
        paymentIntentId: paymentResponse.transactionId,
        shippingAddress: orderData.shippingAddress,
      });

      return order;
    } catch (error) {
      console.error('UnifiedPaymentService.createOrderFromPayment error:', error);
      throw error;
    }
  }

  // Get payment analytics
  static async getPaymentAnalytics(userId: string, period: 'day' | 'week' | 'month' | 'year'): Promise<any> {
    try {
      // In a real app, you'd aggregate payment data from your database
      const analytics = {
        totalTransactions: 0,
        totalAmount: 0,
        averageOrderValue: 0,
        topPaymentMethod: '',
        successRate: 0,
        refundRate: 0,
      };

      return analytics;
    } catch (error) {
      console.error('UnifiedPaymentService.getPaymentAnalytics error:', error);
      return null;
    }
  }
} 