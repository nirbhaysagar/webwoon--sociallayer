export interface PaymentConfig {
  stripe: {
    publishableKey: string;
    secretKey: string;
    webhookSecret: string;
    environment: 'test' | 'live';
  };
  paypal: {
    clientId: string;
    clientSecret: string;
    environment: 'sandbox' | 'live';
  };
  app: {
    currency: string;
    supportedCurrencies: string[];
    defaultPaymentProvider: 'stripe' | 'paypal';
    enableApplePay: boolean;
    enableGooglePay: boolean;
    enablePayPal: boolean;
  };
}

// Default configuration
export const defaultPaymentConfig: PaymentConfig = {
  stripe: {
    publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    environment: (process.env.EXPO_PUBLIC_STRIPE_ENVIRONMENT as 'test' | 'live') || 'test',
  },
  paypal: {
    clientId: process.env.EXPO_PUBLIC_PAYPAL_CLIENT_ID || '',
    clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
    environment: (process.env.EXPO_PUBLIC_PAYPAL_ENVIRONMENT as 'sandbox' | 'live') || 'sandbox',
  },
  app: {
    currency: 'USD',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
    defaultPaymentProvider: 'stripe',
    enableApplePay: true,
    enableGooglePay: true,
    enablePayPal: true,
  },
};

// Validate configuration
export function validatePaymentConfig(config: PaymentConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate Stripe configuration
  if (!config.stripe.publishableKey) {
    errors.push('Stripe publishable key is required');
  }
  if (!config.stripe.secretKey) {
    errors.push('Stripe secret key is required');
  }

  // Validate PayPal configuration
  if (!config.paypal.clientId) {
    errors.push('PayPal client ID is required');
  }
  if (!config.paypal.clientSecret) {
    errors.push('PayPal client secret is required');
  }

  // Validate app configuration
  if (!config.app.currency) {
    errors.push('Default currency is required');
  }
  if (config.app.supportedCurrencies.length === 0) {
    errors.push('At least one supported currency is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Get current configuration
export function getPaymentConfig(): PaymentConfig {
  return defaultPaymentConfig;
}

// Check if payment provider is enabled
export function isPaymentProviderEnabled(provider: 'stripe' | 'paypal'): boolean {
  const config = getPaymentConfig();
  
  switch (provider) {
    case 'stripe':
      return !!config.stripe.publishableKey && !!config.stripe.secretKey;
    case 'paypal':
      return !!config.paypal.clientId && !!config.paypal.clientSecret;
    default:
      return false;
  }
}

// Get available payment providers
export function getAvailablePaymentProviders(): ('stripe' | 'paypal')[] {
  const providers: ('stripe' | 'paypal')[] = [];
  
  if (isPaymentProviderEnabled('stripe')) {
    providers.push('stripe');
  }
  
  if (isPaymentProviderEnabled('paypal')) {
    providers.push('paypal');
  }
  
  return providers;
}

// Get payment provider features
export function getPaymentProviderFeatures(provider: 'stripe' | 'paypal'): string[] {
  const config = getPaymentConfig();
  
  switch (provider) {
    case 'stripe':
      const stripeFeatures = [
        'Credit/Debit Cards',
        'International Payments',
        'Subscriptions',
        'Refunds',
        'Saved Payment Methods',
      ];
      
      if (config.app.enableApplePay) {
        stripeFeatures.push('Apple Pay');
      }
      
      if (config.app.enableGooglePay) {
        stripeFeatures.push('Google Pay');
      }
      
      return stripeFeatures;
      
    case 'paypal':
      return [
        'PayPal Balance',
        'Credit/Debit Cards',
        'Bank Transfers',
        'International Payments',
        'Subscriptions',
        'Refunds',
        'Buy Now, Pay Later',
      ];
      
    default:
      return [];
  }
}

// Get payment provider fees
export function getPaymentProviderFees(provider: 'stripe' | 'paypal'): {
  percentage: number;
  fixed: number;
  currency: string;
} {
  switch (provider) {
    case 'stripe':
      return {
        percentage: 2.9,
        fixed: 0.30,
        currency: 'USD',
      };
    case 'paypal':
      return {
        percentage: 2.9,
        fixed: 0.30,
        currency: 'USD',
      };
    default:
      return {
        percentage: 0,
        fixed: 0,
        currency: 'USD',
      };
  }
}

// Calculate payment fees
export function calculatePaymentFees(amount: number, provider: 'stripe' | 'paypal'): number {
  const fees = getPaymentProviderFees(provider);
  return (amount * fees.percentage / 100) + fees.fixed;
}

// Get supported payment methods for provider
export function getSupportedPaymentMethods(provider: 'stripe' | 'paypal'): string[] {
  switch (provider) {
    case 'stripe':
      return [
        'visa',
        'mastercard',
        'amex',
        'discover',
        'jcb',
        'diners',
        'apple_pay',
        'google_pay',
      ];
    case 'paypal':
      return [
        'paypal',
        'visa',
        'mastercard',
        'amex',
        'discover',
      ];
    default:
      return [];
  }
}

// Check if currency is supported
export function isCurrencySupported(currency: string): boolean {
  const config = getPaymentConfig();
  return config.app.supportedCurrencies.includes(currency.toUpperCase());
}

// Get default currency
export function getDefaultCurrency(): string {
  const config = getPaymentConfig();
  return config.app.currency;
}

// Get supported currencies
export function getSupportedCurrencies(): string[] {
  const config = getPaymentConfig();
  return config.app.supportedCurrencies;
}

// Get default payment provider
export function getDefaultPaymentProvider(): 'stripe' | 'paypal' {
  const config = getPaymentConfig();
  return config.app.defaultPaymentProvider;
}

// Check if Apple Pay is enabled
export function isApplePayEnabled(): boolean {
  const config = getPaymentConfig();
  return config.app.enableApplePay && isPaymentProviderEnabled('stripe');
}

// Check if Google Pay is enabled
export function isGooglePayEnabled(): boolean {
  const config = getPaymentConfig();
  return config.app.enableGooglePay && isPaymentProviderEnabled('stripe');
}

// Check if PayPal is enabled
export function isPayPalEnabled(): boolean {
  const config = getPaymentConfig();
  return config.app.enablePayPal && isPaymentProviderEnabled('paypal');
} 