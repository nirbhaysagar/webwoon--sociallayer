const express = require('express');
const { getStripeClient, getPayPalClient, isStripeAvailable, isPayPalAvailable } = require('../services/initialization');
const { supabase } = require('../services/supabase');
const { validateWebhook } = require('../middleware/validation');
const crypto = require('crypto');

const router = express.Router();

/**
 * Stripe webhook handler
 * POST /api/webhooks/stripe
 */
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res, next) => {
  try {
    if (!isStripeAvailable()) {
      return res.status(503).json({
        error: 'ServiceUnavailable',
        message: 'Stripe service is not available'
      });
    }

    const stripe = getStripeClient();
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('Stripe webhook secret not configured');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).json({ error: 'Invalid signature' });
    }

    console.log('Received Stripe webhook:', event.type);

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;
      case 'payment_method.attached':
        await handlePaymentMethodAttached(event.data.object);
        break;
      case 'payment_method.detached':
        await handlePaymentMethodDetached(event.data.object);
        break;
      case 'charge.refunded':
        await handleChargeRefunded(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    next(error);
  }
});

/**
 * PayPal webhook handler
 * POST /api/webhooks/paypal
 */
router.post('/paypal', validateWebhook, async (req, res, next) => {
  try {
    if (!isPayPalAvailable()) {
      return res.status(503).json({
        error: 'ServiceUnavailable',
        message: 'PayPal service is not available'
      });
    }

    const { type, data } = req.body;
    console.log('Received PayPal webhook:', type);

    // Verify webhook signature (simplified - in production, implement proper verification)
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    if (!webhookId) {
      console.error('PayPal webhook ID not configured');
      return res.status(500).json({ error: 'Webhook ID not configured' });
    }

    // Handle the event
    switch (type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        await handlePayPalPaymentCompleted(data);
        break;
      case 'PAYMENT.CAPTURE.DENIED':
        await handlePayPalPaymentDenied(data);
        break;
      case 'PAYMENT.CAPTURE.REFUNDED':
        await handlePayPalPaymentRefunded(data);
        break;
      case 'CHECKOUT.ORDER.APPROVED':
        await handlePayPalOrderApproved(data);
        break;
      default:
        console.log(`Unhandled PayPal event type: ${type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('PayPal webhook error:', error);
    next(error);
  }
});

/**
 * Handle successful payment intent
 */
async function handlePaymentIntentSucceeded(paymentIntent) {
  try {
    console.log('Payment succeeded:', paymentIntent.id);
    
    // Update order status if payment_intent_id exists in metadata
    const orderId = paymentIntent.metadata?.order_id;
    if (orderId) {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'processing',
          payment_status: 'paid',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order status:', error);
      }
    }

    // Log payment success
    await logPaymentEvent('stripe', 'payment_succeeded', paymentIntent);
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

/**
 * Handle failed payment intent
 */
async function handlePaymentIntentFailed(paymentIntent) {
  try {
    console.log('Payment failed:', paymentIntent.id);
    
    // Update order status
    const orderId = paymentIntent.metadata?.order_id;
    if (orderId) {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          payment_status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order status:', error);
      }
    }

    // Log payment failure
    await logPaymentEvent('stripe', 'payment_failed', paymentIntent);
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

/**
 * Handle payment method attached
 */
async function handlePaymentMethodAttached(paymentMethod) {
  try {
    console.log('Payment method attached:', paymentMethod.id);
    await logPaymentEvent('stripe', 'payment_method_attached', paymentMethod);
  } catch (error) {
    console.error('Error handling payment method attached:', error);
  }
}

/**
 * Handle payment method detached
 */
async function handlePaymentMethodDetached(paymentMethod) {
  try {
    console.log('Payment method detached:', paymentMethod.id);
    
    // Remove from database
    const { error } = await supabase
      .from('payment_methods')
      .delete()
      .eq('payment_method_id', paymentMethod.id);

    if (error) {
      console.error('Error removing payment method:', error);
    }

    await logPaymentEvent('stripe', 'payment_method_detached', paymentMethod);
  } catch (error) {
    console.error('Error handling payment method detached:', error);
  }
}

/**
 * Handle charge refunded
 */
async function handleChargeRefunded(charge) {
  try {
    console.log('Charge refunded:', charge.id);
    
    // Update order status
    const orderId = charge.metadata?.order_id;
    if (orderId) {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'refunded',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order status:', error);
      }
    }

    await logPaymentEvent('stripe', 'charge_refunded', charge);
  } catch (error) {
    console.error('Error handling charge refunded:', error);
  }
}

/**
 * Handle PayPal payment completed
 */
async function handlePayPalPaymentCompleted(data) {
  try {
    console.log('PayPal payment completed:', data.id);
    
    // Update order status
    const orderId = data.custom_id;
    if (orderId) {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'processing',
          payment_status: 'paid',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order status:', error);
      }
    }

    await logPaymentEvent('paypal', 'payment_completed', data);
  } catch (error) {
    console.error('Error handling PayPal payment completed:', error);
  }
}

/**
 * Handle PayPal payment denied
 */
async function handlePayPalPaymentDenied(data) {
  try {
    console.log('PayPal payment denied:', data.id);
    
    // Update order status
    const orderId = data.custom_id;
    if (orderId) {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          payment_status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order status:', error);
      }
    }

    await logPaymentEvent('paypal', 'payment_denied', data);
  } catch (error) {
    console.error('Error handling PayPal payment denied:', error);
  }
}

/**
 * Handle PayPal payment refunded
 */
async function handlePayPalPaymentRefunded(data) {
  try {
    console.log('PayPal payment refunded:', data.id);
    
    // Update order status
    const orderId = data.custom_id;
    if (orderId) {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'refunded',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order status:', error);
      }
    }

    await logPaymentEvent('paypal', 'payment_refunded', data);
  } catch (error) {
    console.error('Error handling PayPal payment refunded:', error);
  }
}

/**
 * Handle PayPal order approved
 */
async function handlePayPalOrderApproved(data) {
  try {
    console.log('PayPal order approved:', data.id);
    await logPaymentEvent('paypal', 'order_approved', data);
  } catch (error) {
    console.error('Error handling PayPal order approved:', error);
  }
}

/**
 * Log payment events to database
 */
async function logPaymentEvent(provider, event_type, data) {
  try {
    const { error } = await supabase
      .from('payment_events')
      .insert({
        provider,
        event_type,
        event_data: data,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error logging payment event:', error);
    }
  } catch (error) {
    console.error('Error in logPaymentEvent:', error);
  }
}

module.exports = router; 