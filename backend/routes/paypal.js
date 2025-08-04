const express = require('express');
const paypal = require('@paypal/checkout-server-sdk');
const { getPayPalClient, isPayPalAvailable } = require('../services/initialization');
const { supabase } = require('../services/supabase');
const { validatePaymentIntent, validateRefund, validateId } = require('../middleware/validation');
const { requireOwnership } = require('../middleware/auth');
const { NotFoundError } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * Create a PayPal order
 * POST /api/paypal/create-order
 */
router.post('/create-order', validatePaymentIntent, async (req, res, next) => {
  try {
    if (!isPayPalAvailable()) {
      return res.status(503).json({
        error: 'ServiceUnavailable',
        message: 'PayPal service is not available'
      });
    }

    const { amount, currency = 'USD', items = [] } = req.body;
    const paypalClient = getPayPalClient();

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: currency,
          value: amount.toString(),
          breakdown: {
            item_total: {
              currency_code: currency,
              value: amount.toString()
            }
          }
        },
        items: items.length > 0 ? items : [{
          name: 'Order',
          quantity: '1',
          unit_amount: {
            currency_code: currency,
            value: amount.toString()
          }
        }],
        custom_id: req.user.id,
        description: `Order for user ${req.user.id}`
      }],
      application_context: {
        return_url: `${process.env.FRONTEND_URL}/payment/success`,
        cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
        brand_name: 'SocialSpark',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
        shipping_preference: 'NO_SHIPPING'
      }
    });

    const order = await paypalClient.execute(request);

    res.json({
      success: true,
      data: {
        id: order.result.id,
        status: order.result.status,
        links: order.result.links
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Capture a PayPal payment
 * POST /api/paypal/capture-payment
 */
router.post('/capture-payment', async (req, res, next) => {
  try {
    if (!isPayPalAvailable()) {
      return res.status(503).json({
        error: 'ServiceUnavailable',
        message: 'PayPal service is not available'
      });
    }

    const { order_id } = req.body;
    const paypalClient = getPayPalClient();

    const request = new paypal.orders.OrdersCaptureRequest(order_id);
    request.requestBody({});

    const capture = await paypalClient.execute(request);

    res.json({
      success: true,
      data: {
        id: capture.result.id,
        status: capture.result.status,
        amount: capture.result.purchase_units[0].payments.captures[0].amount,
        transaction_id: capture.result.purchase_units[0].payments.captures[0].id
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Authorize a PayPal payment
 * POST /api/paypal/authorize-payment
 */
router.post('/authorize-payment', async (req, res, next) => {
  try {
    if (!isPayPalAvailable()) {
      return res.status(503).json({
        error: 'ServiceUnavailable',
        message: 'PayPal service is not available'
      });
    }

    const { order_id } = req.body;
    const paypalClient = getPayPalClient();

    const request = new paypal.orders.OrdersAuthorizeRequest(order_id);
    request.requestBody({});

    const authorization = await paypalClient.execute(request);

    res.json({
      success: true,
      data: {
        id: authorization.result.id,
        status: authorization.result.status,
        amount: authorization.result.purchase_units[0].payments.authorizations[0].amount,
        authorization_id: authorization.result.purchase_units[0].payments.authorizations[0].id
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Capture an authorized payment
 * POST /api/paypal/capture-authorized-payment
 */
router.post('/capture-authorized-payment', async (req, res, next) => {
  try {
    if (!isPayPalAvailable()) {
      return res.status(503).json({
        error: 'ServiceUnavailable',
        message: 'PayPal service is not available'
      });
    }

    const { authorization_id, amount } = req.body;
    const paypalClient = getPayPalClient();

    const request = new paypal.payments.AuthorizationsCaptureRequest(authorization_id);
    request.requestBody({
      amount: {
        currency: 'USD',
        value: amount.toString()
      }
    });

    const capture = await paypalClient.execute(request);

    res.json({
      success: true,
      data: {
        id: capture.result.id,
        status: capture.result.status,
        amount: capture.result.amount
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Void an authorized payment
 * POST /api/paypal/void-authorized-payment
 */
router.post('/void-authorized-payment', async (req, res, next) => {
  try {
    if (!isPayPalAvailable()) {
      return res.status(503).json({
        error: 'ServiceUnavailable',
        message: 'PayPal service is not available'
      });
    }

    const { authorization_id } = req.body;
    const paypalClient = getPayPalClient();

    const request = new paypal.payments.AuthorizationsVoidRequest(authorization_id);
    await paypalClient.execute(request);

    res.json({
      success: true,
      message: 'Authorization voided successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Process a refund
 * POST /api/paypal/refund
 */
router.post('/refund', validateRefund, async (req, res, next) => {
  try {
    if (!isPayPalAvailable()) {
      return res.status(503).json({
        error: 'ServiceUnavailable',
        message: 'PayPal service is not available'
      });
    }

    const { capture_id, amount, reason } = req.body;
    const paypalClient = getPayPalClient();

    const request = new paypal.payments.CapturesRefundRequest(capture_id);
    request.requestBody({
      amount: {
        currency: 'USD',
        value: amount.toString()
      },
      note_to_payer: reason || 'Refund requested by customer'
    });

    const refund = await paypalClient.execute(request);

    res.json({
      success: true,
      data: {
        id: refund.result.id,
        status: refund.result.status,
        amount: refund.result.amount
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get order details
 * GET /api/paypal/order/:id
 */
router.get('/order/:id', async (req, res, next) => {
  try {
    if (!isPayPalAvailable()) {
      return res.status(503).json({
        error: 'ServiceUnavailable',
        message: 'PayPal service is not available'
      });
    }

    const { id } = req.params;
    const paypalClient = getPayPalClient();

    const request = new paypal.orders.OrdersGetRequest(id);
    const order = await paypalClient.execute(request);

    res.json({
      success: true,
      data: {
        id: order.result.id,
        status: order.result.status,
        intent: order.result.intent,
        amount: order.result.purchase_units[0].amount,
        create_time: order.result.create_time,
        update_time: order.result.update_time
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get capture details
 * GET /api/paypal/capture/:id
 */
router.get('/capture/:id', async (req, res, next) => {
  try {
    if (!isPayPalAvailable()) {
      return res.status(503).json({
        error: 'ServiceUnavailable',
        message: 'PayPal service is not available'
      });
    }

    const { id } = req.params;
    const paypalClient = getPayPalClient();

    const request = new paypal.payments.CapturesGetRequest(id);
    const capture = await paypalClient.execute(request);

    res.json({
      success: true,
      data: {
        id: capture.result.id,
        status: capture.result.status,
        amount: capture.result.amount,
        create_time: capture.result.create_time,
        update_time: capture.result.update_time
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get refund details
 * GET /api/paypal/refund/:id
 */
router.get('/refund/:id', async (req, res, next) => {
  try {
    if (!isPayPalAvailable()) {
      return res.status(503).json({
        error: 'ServiceUnavailable',
        message: 'PayPal service is not available'
      });
    }

    const { id } = req.params;
    const paypalClient = getPayPalClient();

    const request = new paypal.payments.RefundsGetRequest(id);
    const refund = await paypalClient.execute(request);

    res.json({
      success: true,
      data: {
        id: refund.result.id,
        status: refund.result.status,
        amount: refund.result.amount,
        create_time: refund.result.create_time,
        update_time: refund.result.update_time
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 