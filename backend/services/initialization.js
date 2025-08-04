const stripe = require('stripe');
const paypal = require('@paypal/checkout-server-sdk');

let stripeClient;
let paypalClient;

/**
 * Initialize all payment services
 */
const initializeServices = () => {
  try {
    // Initialize Stripe
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (stripeSecretKey) {
      stripeClient = stripe(stripeSecretKey);
      console.log('✅ Stripe service initialized');
    } else {
      console.warn('⚠️ Stripe secret key not found, Stripe features will be disabled');
    }

    // Initialize PayPal
    const paypalClientId = process.env.PAYPAL_CLIENT_ID;
    const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const paypalMode = process.env.PAYPAL_MODE || 'sandbox';

    if (paypalClientId && paypalClientSecret) {
      const environment = paypalMode === 'live' 
        ? new paypal.core.LiveEnvironment(paypalClientId, paypalClientSecret)
        : new paypal.core.SandboxEnvironment(paypalClientId, paypalClientSecret);
      
      paypalClient = new paypal.core.PayPalHttpClient(environment);
      console.log(`✅ PayPal service initialized (${paypalMode} mode)`);
    } else {
      console.warn('⚠️ PayPal credentials not found, PayPal features will be disabled');
    }

    console.log('🚀 Payment services initialization complete');
  } catch (error) {
    console.error('❌ Error initializing payment services:', error);
    throw error;
  }
};

/**
 * Get Stripe client
 */
const getStripeClient = () => {
  if (!stripeClient) {
    throw new Error('Stripe client not initialized. Please check your environment configuration.');
  }
  return stripeClient;
};

/**
 * Get PayPal client
 */
const getPayPalClient = () => {
  if (!paypalClient) {
    throw new Error('PayPal client not initialized. Please check your environment configuration.');
  }
  return paypalClient;
};

/**
 * Check if services are available
 */
const isStripeAvailable = () => !!stripeClient;
const isPayPalAvailable = () => !!paypalClient;

module.exports = {
  initializeServices,
  getStripeClient,
  getPayPalClient,
  isStripeAvailable,
  isPayPalAvailable
}; 