import { supabase } from './supabase';

export interface PayPalOrder {
  id: string;
  status: 'CREATED' | 'SAVED' | 'APPROVED' | 'VOIDED' | 'COMPLETED' | 'PAYER_ACTION_REQUIRED';
  intent: 'CAPTURE' | 'AUTHORIZE';
  paymentSource: {
    paypal?: {
      accountId: string;
      accountType: string;
      name: {
        givenName: string;
        surname: string;
      };
      emailAddress: string;
    };
  };
  purchaseUnits: Array<{
    referenceId: string;
    amount: {
      currencyCode: string;
      value: string;
    };
    payee: {
      merchantId: string;
    };
    shipping?: {
      name: {
        fullName: string;
      };
      address: {
        addressLine1: string;
        addressLine2?: string;
        adminArea1: string;
        adminArea2: string;
        postalCode: string;
        countryCode: string;
      };
    };
  }>;
  createTime: string;
  updateTime: string;
}

export interface PayPalCapture {
  id: string;
  status: 'COMPLETED' | 'DECLINED' | 'PARTIALLY_REFUNDED' | 'PENDING' | 'REFUNDED' | 'FAILED';
  amount: {
    currencyCode: string;
    value: string;
  };
  finalCapture: boolean;
  sellerProtection: {
    status: 'ELIGIBLE' | 'PARTIALLY_ELIGIBLE' | 'NOT_ELIGIBLE';
    disputeCategories: string[];
  };
  createTime: string;
  updateTime: string;
}

export interface PayPalRefund {
  id: string;
  status: 'CANCELLED' | 'FAILED' | 'PENDING' | 'COMPLETED';
  amount: {
    currencyCode: string;
    value: string;
  };
  noteToPayer?: string;
  sellerPayableBreakdown: {
    grossAmount: {
      currencyCode: string;
      value: string;
    };
    paypalFee: {
      currencyCode: string;
      value: string;
    };
    netAmount: {
      currencyCode: string;
      value: string;
    };
  };
  createTime: string;
  updateTime: string;
}

export class PayPalService {
  private static clientId = process.env.EXPO_PUBLIC_PAYPAL_CLIENT_ID;
  private static baseUrl = process.env.EXPO_PUBLIC_API_URL || 'https://your-api-domain.com';
  private static environment = process.env.EXPO_PUBLIC_PAYPAL_ENVIRONMENT || 'sandbox';

  // Initialize PayPal (call this in your app initialization)
  static async initialize() {
    try {
      console.log('PayPal initialized with client ID:', this.clientId);
      console.log('PayPal environment:', this.environment);
      return true;
    } catch (error) {
      console.error('PayPal initialization error:', error);
      return false;
    }
  }

  // Create PayPal order
  static async createOrder(amount: number, currency: string = 'USD', items?: any[]): Promise<PayPalOrder> {
    try {
      const response = await fetch(`${this.baseUrl}/api/paypal/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchaseUnits: [{
            amount: {
              currencyCode: currency,
              value: amount.toFixed(2),
            },
            items: items?.map(item => ({
              name: item.name,
              quantity: item.quantity.toString(),
              unitAmount: {
                currencyCode: currency,
                value: item.price.toFixed(2),
              },
            })),
          }],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('PayPalService.createOrder error:', error);
      throw new Error('Failed to create PayPal order');
    }
  }

  // Capture PayPal payment
  static async capturePayment(orderId: string): Promise<PayPalCapture> {
    try {
      const response = await fetch(`${this.baseUrl}/api/paypal/capture-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify({
          orderId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('PayPalService.capturePayment error:', error);
      throw new Error('Payment capture failed');
    }
  }

  // Authorize PayPal payment (for later capture)
  static async authorizePayment(orderId: string): Promise<PayPalOrder> {
    try {
      const response = await fetch(`${this.baseUrl}/api/paypal/authorize-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify({
          orderId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('PayPalService.authorizePayment error:', error);
      throw new Error('Payment authorization failed');
    }
  }

  // Capture authorized payment
  static async captureAuthorizedPayment(authorizationId: string): Promise<PayPalCapture> {
    try {
      const response = await fetch(`${this.baseUrl}/api/paypal/capture-authorization`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify({
          authorizationId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('PayPalService.captureAuthorizedPayment error:', error);
      throw new Error('Authorized payment capture failed');
    }
  }

  // Void authorized payment
  static async voidAuthorizedPayment(authorizationId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/paypal/void-authorization`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify({
          authorizationId,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('PayPalService.voidAuthorizedPayment error:', error);
      return false;
    }
  }

  // Process refund
  static async processRefund(captureId: string, amount?: number, note?: string): Promise<PayPalRefund> {
    try {
      const response = await fetch(`${this.baseUrl}/api/paypal/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify({
          captureId,
          amount: amount ? amount.toFixed(2) : undefined,
          note,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('PayPalService.processRefund error:', error);
      throw new Error('Refund processing failed');
    }
  }

  // Get order details
  static async getOrderDetails(orderId: string): Promise<PayPalOrder | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/paypal/order/${orderId}`, {
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
      console.error('PayPalService.getOrderDetails error:', error);
      return null;
    }
  }

  // Get capture details
  static async getCaptureDetails(captureId: string): Promise<PayPalCapture | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/paypal/capture/${captureId}`, {
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
      console.error('PayPalService.getCaptureDetails error:', error);
      return null;
    }
  }

  // Get refund details
  static async getRefundDetails(refundId: string): Promise<PayPalRefund | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/paypal/refund/${refundId}`, {
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
      console.error('PayPalService.getRefundDetails error:', error);
      return null;
    }
  }

  // Create subscription
  static async createSubscription(planId: string, startTime?: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/paypal/create-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify({
          planId,
          startTime,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('PayPalService.createSubscription error:', error);
      throw new Error('Failed to create subscription');
    }
  }

  // Cancel subscription
  static async cancelSubscription(subscriptionId: string, reason?: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/paypal/cancel-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify({
          subscriptionId,
          reason,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('PayPalService.cancelSubscription error:', error);
      return false;
    }
  }

  // Get subscription details
  static async getSubscriptionDetails(subscriptionId: string): Promise<any | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/paypal/subscription/${subscriptionId}`, {
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
      console.error('PayPalService.getSubscriptionDetails error:', error);
      return null;
    }
  }

  // Validate PayPal order status
  static isOrderCompleted(order: PayPalOrder): boolean {
    return order.status === 'COMPLETED';
  }

  // Validate PayPal capture status
  static isCaptureCompleted(capture: PayPalCapture): boolean {
    return capture.status === 'COMPLETED';
  }

  // Validate PayPal refund status
  static isRefundCompleted(refund: PayPalRefund): boolean {
    return refund.status === 'COMPLETED';
  }

  // Get PayPal environment URL
  static getPayPalUrl(): string {
    return this.environment === 'live' 
      ? 'https://www.paypal.com' 
      : 'https://www.sandbox.paypal.com';
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