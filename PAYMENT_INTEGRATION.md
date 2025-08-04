# 🚀 Real Stripe/PayPal Payment Integration Guide

This guide explains how to implement real payment processing with Stripe and PayPal in your React Native app.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Setup Requirements](#setup-requirements)
3. [Environment Configuration](#environment-configuration)
4. [Backend API Setup](#backend-api-setup)
5. [Frontend Integration](#frontend-integration)
6. [Testing](#testing)
7. [Production Deployment](#production-deployment)
8. [Security Best Practices](#security-best-practices)
9. [Troubleshooting](#troubleshooting)

## 🎯 Overview

The payment integration includes:

- **Stripe Service**: Credit/debit cards, Apple Pay, Google Pay, subscriptions
- **PayPal Service**: PayPal balance, cards, bank transfers, subscriptions
- **Unified Payment Service**: Common interface for both providers
- **Enhanced Checkout Screen**: Multi-step checkout with real payment processing
- **Payment Configuration**: Environment-based configuration management

## 🔧 Setup Requirements

### Prerequisites

1. **Stripe Account**
   - Sign up at [stripe.com](https://stripe.com)
   - Get your API keys from the dashboard
   - Enable required payment methods

2. **PayPal Developer Account**
   - Sign up at [developer.paypal.com](https://developer.paypal.com)
   - Create a PayPal app
   - Get your client ID and secret

3. **Backend API**
   - Node.js/Express server
   - Supabase for database
   - Environment variables management

### Required Packages

```bash
# Stripe SDK
npm install @stripe/stripe-react-native

# PayPal SDK (if using native SDK)
npm install react-native-paypal-wrapper

# Additional dependencies
npm install @react-native-async-storage/async-storage
```

## ⚙️ Environment Configuration

### 1. Create Environment File

Create `.env` file in your project root:

```env
# Stripe Configuration
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
EXPO_PUBLIC_STRIPE_ENVIRONMENT=test

# PayPal Configuration
EXPO_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
EXPO_PUBLIC_PAYPAL_ENVIRONMENT=sandbox

# API Configuration
EXPO_PUBLIC_API_URL=https://your-api-domain.com

# App Configuration
EXPO_PUBLIC_DEFAULT_CURRENCY=USD
EXPO_PUBLIC_DEFAULT_PAYMENT_PROVIDER=stripe
```

### 2. Environment Variables for Production

For production, update the environment variables:

```env
# Production Stripe
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
STRIPE_SECRET_KEY=sk_live_your_live_secret
EXPO_PUBLIC_STRIPE_ENVIRONMENT=live

# Production PayPal
EXPO_PUBLIC_PAYPAL_CLIENT_ID=your_live_client_id
PAYPAL_CLIENT_SECRET=your_live_client_secret
EXPO_PUBLIC_PAYPAL_ENVIRONMENT=live
```

## 🔌 Backend API Setup

### 1. Create Payment API Endpoints

Create a Node.js/Express server with these endpoints:

```javascript
// server/routes/payments.js

const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const paypal = require('@paypal/checkout-server-sdk');

const router = express.Router();

// Stripe Payment Intent
router.post('/stripe/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency, metadata } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata,
    });
    
    res.json({
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      status: paymentIntent.status,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Stripe Confirm Payment
router.post('/stripe/confirm-payment', async (req, res) => {
  try {
    const { clientSecret, paymentMethodId } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.confirm(clientSecret, {
      payment_method: paymentMethodId,
    });
    
    res.json({
      id: paymentIntent.id,
      status: paymentIntent.status,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PayPal Create Order
router.post('/paypal/create-order', async (req, res) => {
  try {
    const { intent, purchaseUnits } = req.body;
    
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent,
      purchase_units: purchaseUnits,
    });
    
    const order = await paypalClient.execute(request);
    res.json(order.result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PayPal Capture Order
router.post('/paypal/capture-order', async (req, res) => {
  try {
    const { orderId } = req.body;
    
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    const capture = await paypalClient.execute(request);
    
    res.json(capture.result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
```

### 2. Database Schema

Add these tables to your Supabase database:

```sql
-- Orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  items JSONB NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) NOT NULL,
  shipping DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_intent_id TEXT,
  shipping_address JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment methods table
CREATE TABLE payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  provider TEXT NOT NULL,
  type TEXT NOT NULL,
  last4 TEXT,
  brand TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own payment methods" ON payment_methods
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment methods" ON payment_methods
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## 🎨 Frontend Integration

### 1. Initialize Payment Services

In your `App.tsx` or main component:

```typescript
import { UnifiedPaymentService } from './src/services/unifiedPaymentService';

// Initialize payment services on app start
useEffect(() => {
  const initializePayments = async () => {
    try {
      await UnifiedPaymentService.initialize();
      console.log('Payment services initialized successfully');
    } catch (error) {
      console.error('Failed to initialize payment services:', error);
    }
  };
  
  initializePayments();
}, []);
```

### 2. Use Enhanced Checkout Screen

Replace the existing checkout screen with the enhanced version:

```typescript
// In your navigation
import EnhancedCheckoutScreen from './src/screens/UserDashboard/EnhancedCheckoutScreen';

// Navigate with checkout data
navigation.navigate('EnhancedCheckout', {
  checkoutData: {
    items: cartItems,
    subtotal: subtotal,
    tax: tax,
    shipping: shipping,
    total: total,
  },
});
```

### 3. Handle Payment Responses

```typescript
const handlePaymentSuccess = async (paymentResponse) => {
  try {
    // Create order in database
    const order = await UnifiedPaymentService.createOrderFromPayment(
      paymentResponse,
      orderData
    );
    
    // Clear cart
    await clearCart();
    
    // Navigate to success screen
    navigation.navigate('OrderConfirmation', { orderId: order.id });
  } catch (error) {
    console.error('Error creating order:', error);
    Alert.alert('Error', 'Failed to create order');
  }
};
```

## 🧪 Testing

### 1. Stripe Test Cards

Use these test card numbers:

- **Visa**: `4242424242424242`
- **Mastercard**: `5555555555554444`
- **American Express**: `378282246310005`
- **Declined**: `4000000000000002`

### 2. PayPal Sandbox

- Use PayPal sandbox accounts for testing
- Create test accounts in PayPal Developer Dashboard
- Test both successful and failed payments

### 3. Test Scenarios

```typescript
// Test payment processing
const testPayment = async () => {
  const paymentRequest = {
    amount: 29.99,
    currency: 'USD',
    items: [
      { name: 'Test Product', quantity: 1, price: 29.99 }
    ],
  };
  
  const response = await UnifiedPaymentService.processPayment(
    paymentRequest,
    'stripe'
  );
  
  console.log('Payment response:', response);
};
```

## 🚀 Production Deployment

### 1. Environment Variables

Update all environment variables for production:

```env
# Production settings
EXPO_PUBLIC_STRIPE_ENVIRONMENT=live
EXPO_PUBLIC_PAYPAL_ENVIRONMENT=live
EXPO_PUBLIC_API_URL=https://your-production-api.com
```

### 2. SSL Certificate

Ensure your API has a valid SSL certificate for production.

### 3. Webhook Configuration

Set up webhooks for payment notifications:

```javascript
// Stripe webhook endpoint
app.post('/webhooks/stripe', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  
  switch (event.type) {
    case 'payment_intent.succeeded':
      // Handle successful payment
      break;
    case 'payment_intent.payment_failed':
      // Handle failed payment
      break;
  }
  
  res.json({received: true});
});
```

## 🔒 Security Best Practices

### 1. API Key Security

- Never expose secret keys in frontend code
- Use environment variables for all sensitive data
- Rotate keys regularly

### 2. Payment Data

- Never store raw card data
- Use payment method tokens
- Implement PCI compliance

### 3. Error Handling

```typescript
// Secure error handling
const handlePaymentError = (error) => {
  // Log error for debugging
  console.error('Payment error:', error);
  
  // Don't expose sensitive information to user
  const userMessage = 'Payment processing failed. Please try again.';
  Alert.alert('Payment Error', userMessage);
};
```

### 4. Input Validation

```typescript
// Validate payment inputs
const validatePaymentInput = (input) => {
  const errors = [];
  
  if (!input.amount || input.amount <= 0) {
    errors.push('Invalid amount');
  }
  
  if (!input.currency) {
    errors.push('Currency is required');
  }
  
  return errors;
};
```

## 🛠️ Troubleshooting

### Common Issues

1. **Payment Intent Creation Fails**
   - Check API key configuration
   - Verify amount format (cents)
   - Ensure currency is supported

2. **PayPal Order Creation Fails**
   - Verify client ID and secret
   - Check environment (sandbox/live)
   - Validate request format

3. **Payment Confirmation Fails**
   - Check client secret validity
   - Verify payment method ID
   - Ensure proper error handling

### Debug Mode

Enable debug logging:

```typescript
// In your payment service
const DEBUG_MODE = __DEV__;

if (DEBUG_MODE) {
  console.log('Payment request:', paymentRequest);
  console.log('Payment response:', paymentResponse);
}
```

### Error Codes

| Error Code | Description | Solution |
|------------|-------------|----------|
| `card_declined` | Card was declined | Use valid test card |
| `insufficient_funds` | Insufficient funds | Use different test card |
| `invalid_expiry_month` | Invalid expiry month | Check date format |
| `invalid_cvc` | Invalid CVC | Use 3-4 digit CVC |

## 📚 Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [PayPal Developer Documentation](https://developer.paypal.com/docs)
- [React Native Stripe SDK](https://github.com/stripe/stripe-react-native)
- [Supabase Documentation](https://supabase.com/docs)

## 🎉 Next Steps

1. **Implement Webhooks**: Set up real-time payment notifications
2. **Add Subscriptions**: Implement recurring payments
3. **Multi-Currency**: Support multiple currencies
4. **Analytics**: Add payment analytics and reporting
5. **Fraud Prevention**: Implement additional security measures

---

**Note**: This implementation provides a solid foundation for real payment processing. Always test thoroughly in sandbox/test environments before going live with real payments. 