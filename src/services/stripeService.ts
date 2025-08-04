import { supabase } from './supabase';

export interface StripePaymentMethod {
  id: string;
  type: 'card' | 'apple_pay' | 'google_pay';
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  billingDetails?: {
    name: string;
    email: string;
    phone?: string;
    address?: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  };
}

export interface StripePaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'requires_capture' | 'canceled' | 'succeeded';
  clientSecret: string;
  paymentMethodId?: string;
  created: number;
}

export interface StripeSetupIntent {
  id: string;
  clientSecret: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'canceled' | 'succeeded';
}

export class StripeService {
  private static apiKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  private static baseUrl = process.env.EXPO_PUBLIC_API_URL || 'https://your-api-domain.com';

  // Initialize Stripe (call this in your app initialization)
  static async initialize() {
    try {
      // In a real app, you'd initialize Stripe SDK here
      console.log('Stripe initialized with key:', this.apiKey);
      return true;
    } catch (error) {
      console.error('Stripe initialization error:', error);
      return false;
    }
  }

  // Create a payment intent on your backend
  static async createPaymentIntent(amount: number, currency: string = 'usd', metadata?: any): Promise<StripePaymentIntent> {
    try {
      const response = await fetch(`${this.baseUrl}/api/stripe/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          currency,
          metadata,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('StripeService.createPaymentIntent error:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  // Confirm payment intent
  static async confirmPayment(clientSecret: string, paymentMethodId: string): Promise<StripePaymentIntent> {
    try {
      const response = await fetch(`${this.baseUrl}/api/stripe/confirm-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify({
          clientSecret,
          paymentMethodId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('StripeService.confirmPayment error:', error);
      throw new Error('Payment confirmation failed');
    }
  }

  // Create a setup intent for saving payment methods
  static async createSetupIntent(): Promise<StripeSetupIntent> {
    try {
      const response = await fetch(`${this.baseUrl}/api/stripe/create-setup-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('StripeService.createSetupIntent error:', error);
      throw new Error('Failed to create setup intent');
    }
  }

  // Save payment method to customer
  static async savePaymentMethod(setupIntentId: string, paymentMethodId: string): Promise<StripePaymentMethod> {
    try {
      const response = await fetch(`${this.baseUrl}/api/stripe/save-payment-method`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify({
          setupIntentId,
          paymentMethodId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('StripeService.savePaymentMethod error:', error);
      throw new Error('Failed to save payment method');
    }
  }

  // Get customer's saved payment methods
  static async getCustomerPaymentMethods(): Promise<StripePaymentMethod[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/stripe/payment-methods`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.paymentMethods;
    } catch (error) {
      console.error('StripeService.getCustomerPaymentMethods error:', error);
      return [];
    }
  }

  // Delete a payment method
  static async deletePaymentMethod(paymentMethodId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/stripe/delete-payment-method`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify({
          paymentMethodId,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('StripeService.deletePaymentMethod error:', error);
      return false;
    }
  }

  // Process refund
  static async processRefund(paymentIntentId: string, amount?: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/stripe/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify({
          paymentIntentId,
          amount: amount ? Math.round(amount * 100) : undefined,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('StripeService.processRefund error:', error);
      return false;
    }
  }

  // Get payment intent status
  static async getPaymentIntentStatus(paymentIntentId: string): Promise<StripePaymentIntent | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/stripe/payment-intent/${paymentIntentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('StripeService.getPaymentIntentStatus error:', error);
      return null;
    }
  }

  // Validate card details
  static validateCard(cardNumber: string, expMonth: number, expYear: number, cvc: string): boolean {
    // Basic validation - in production, use Stripe's validation
    const isValidNumber = /^\d{13,19}$/.test(cardNumber.replace(/\s/g, ''));
    const isValidExpMonth = expMonth >= 1 && expMonth <= 12;
    const isValidExpYear = expYear >= new Date().getFullYear();
    const isValidCvc = /^\d{3,4}$/.test(cvc);

    return isValidNumber && isValidExpMonth && isValidExpYear && isValidCvc;
  }

  // Format card number for display
  static formatCardNumber(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  }

  // Get card brand from number
  static getCardBrand(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\s/g, '');
    
    if (/^4/.test(cleaned)) return 'visa';
    if (/^5[1-5]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    if (/^6/.test(cleaned)) return 'discover';
    if (/^35/.test(cleaned)) return 'jcb';
    if (/^30[0-5]/.test(cleaned)) return 'diners';
    
    return 'unknown';
  }

  // Check if Apple Pay is available
  static async isApplePayAvailable(): Promise<boolean> {
    try {
      // In a real app, check Apple Pay availability
      return false; // Placeholder
    } catch (error) {
      console.error('StripeService.isApplePayAvailable error:', error);
      return false;
    }
  }

  // Check if Google Pay is available
  static async isGooglePayAvailable(): Promise<boolean> {
    try {
      // In a real app, check Google Pay availability
      return false; // Placeholder
    } catch (error) {
      console.error('StripeService.isGooglePayAvailable error:', error);
      return false;
    }
  }

  // Get authentication token for API calls
  private static async getAuthToken(): Promise<string> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || '';
    } catch (error) {
      console.error('Error getting auth token:', error);
      return '';
    }
  }
} 