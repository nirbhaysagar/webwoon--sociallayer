const express = require('express');
const { getStripeClient, isStripeAvailable } = require('../services/initialization');
const { supabase } = require('../services/supabase');
const { validatePaymentIntent, validatePaymentMethod, validateRefund, validateId } = require('../middleware/validation');
const { requireOwnership } = require('../middleware/auth');
const { NotFoundError, ValidationError } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * Create a payment intent
 * POST /api/stripe/create-payment-intent
 */
router.post('/create-payment-intent', validatePaymentIntent, async (req, res, next) => {
  try {
    if (!isStripeAvailable()) {
      return res.status(503).json({
        error: 'ServiceUnavailable',
        message: 'Stripe service is not available'
      });
    }

    const { amount, currency = 'usd', metadata = {} } = req.body;
    const stripe = getStripeClient();

    // Add user ID to metadata
    const paymentIntentMetadata = {
      ...metadata,
      user_id: req.user.id,
      created_at: new Date().toISOString()
    };

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: paymentIntentMetadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      success: true,
      data: {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Confirm a payment
 * POST /api/stripe/confirm-payment
 */
router.post('/confirm-payment', async (req, res, next) => {
  try {
    if (!isStripeAvailable()) {
      return res.status(503).json({
        error: 'ServiceUnavailable',
        message: 'Stripe service is not available'
      });
    }

    const { payment_intent_id, payment_method_id } = req.body;
    const stripe = getStripeClient();

    const paymentIntent = await stripe.paymentIntents.confirm(payment_intent_id, {
      payment_method: payment_method_id,
    });

    res.json({
      success: true,
      data: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Create a setup intent for saving payment methods
 * POST /api/stripe/create-setup-intent
 */
router.post('/create-setup-intent', async (req, res, next) => {
  try {
    if (!isStripeAvailable()) {
      return res.status(503).json({
        error: 'ServiceUnavailable',
        message: 'Stripe service is not available'
      });
    }

    const { metadata = {} } = req.body;
    const stripe = getStripeClient();

    const setupIntent = await stripe.setupIntents.create({
      metadata: {
        ...metadata,
        user_id: req.user.id,
        created_at: new Date().toISOString()
      },
    });

    res.json({
      success: true,
      data: {
        id: setupIntent.id,
        client_secret: setupIntent.client_secret,
        status: setupIntent.status
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Save a payment method to database
 * POST /api/stripe/save-payment-method
 */
router.post('/save-payment-method', validatePaymentMethod, async (req, res, next) => {
  try {
    if (!isStripeAvailable()) {
      return res.status(503).json({
        error: 'ServiceUnavailable',
        message: 'Stripe service is not available'
      });
    }

    const { payment_method_id, type = 'card', card } = req.body;
    const stripe = getStripeClient();

    // Get payment method details from Stripe
    const paymentMethod = await stripe.paymentMethods.retrieve(payment_method_id);

    // Save to database
    const { data, error } = await supabase
      .from('payment_methods')
      .insert({
        user_id: req.user.id,
        provider: 'stripe',
        payment_method_id: paymentMethod.id,
        type,
        card_brand: paymentMethod.card?.brand,
        card_last4: paymentMethod.card?.last4,
        card_exp_month: paymentMethod.card?.exp_month,
        card_exp_year: paymentMethod.card?.exp_year,
        is_default: false
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    res.json({
      success: true,
      data: {
        id: data.id,
        payment_method_id: data.payment_method_id,
        type: data.type,
        card_brand: data.card_brand,
        card_last4: data.card_last4
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get user's payment methods
 * GET /api/stripe/payment-methods
 */
router.get('/payment-methods', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('provider', 'stripe')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    res.json({
      success: true,
      data: data.map(method => ({
        id: method.id,
        payment_method_id: method.payment_method_id,
        type: method.type,
        card_brand: method.card_brand,
        card_last4: method.card_last4,
        card_exp_month: method.card_exp_month,
        card_exp_year: method.card_exp_year,
        is_default: method.is_default,
        created_at: method.created_at
      }))
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Delete a payment method
 * DELETE /api/stripe/payment-methods/:id
 */
router.delete('/payment-methods/:id', validateId, requireOwnership('payment_method'), async (req, res, next) => {
  try {
    if (!isStripeAvailable()) {
      return res.status(503).json({
        error: 'ServiceUnavailable',
        message: 'Stripe service is not available'
      });
    }

    const { id } = req.params;

    // Get payment method from database
    const { data: paymentMethod, error: dbError } = await supabase
      .from('payment_methods')
      .select('payment_method_id')
      .eq('id', id)
      .single();

    if (dbError || !paymentMethod) {
      throw new NotFoundError('Payment method not found');
    }

    // Delete from Stripe
    const stripe = getStripeClient();
    await stripe.paymentMethods.detach(paymentMethod.payment_method_id);

    // Delete from database
    const { error: deleteError } = await supabase
      .from('payment_methods')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw new Error(`Database error: ${deleteError.message}`);
    }

    res.json({
      success: true,
      message: 'Payment method deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Process a refund
 * POST /api/stripe/refund
 */
router.post('/refund', validateRefund, async (req, res, next) => {
  try {
    if (!isStripeAvailable()) {
      return res.status(503).json({
        error: 'ServiceUnavailable',
        message: 'Stripe service is not available'
      });
    }

    const { payment_intent_id, amount, reason } = req.body;
    const stripe = getStripeClient();

    const refund = await stripe.refunds.create({
      payment_intent: payment_intent_id,
      amount: Math.round(amount * 100), // Convert to cents
      reason: reason || 'requested_by_customer',
      metadata: {
        user_id: req.user.id,
        refunded_at: new Date().toISOString()
      }
    });

    res.json({
      success: true,
      data: {
        id: refund.id,
        amount: refund.amount,
        status: refund.status,
        reason: refund.reason
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get payment intent status
 * GET /api/stripe/payment-intent/:id
 */
router.get('/payment-intent/:id', async (req, res, next) => {
  try {
    if (!isStripeAvailable()) {
      return res.status(503).json({
        error: 'ServiceUnavailable',
        message: 'Stripe service is not available'
      });
    }

    const { id } = req.params;
    const stripe = getStripeClient();

    const paymentIntent = await stripe.paymentIntents.retrieve(id);

    res.json({
      success: true,
      data: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        created: paymentIntent.created
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 