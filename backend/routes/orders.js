const express = require('express');
const { supabase } = require('../services/supabase');
const { validateOrder, validateId, validatePagination } = require('../middleware/validation');
const { requireOwnership } = require('../middleware/auth');
const { NotFoundError } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * Create a new order
 * POST /api/orders
 */
router.post('/', validateOrder, async (req, res, next) => {
  try {
    const {
      items,
      shipping_address,
      billing_address,
      payment_method_id,
      payment_provider,
      subtotal,
      tax,
      shipping_cost,
      total,
      notes
    } = req.body;

    // Create order in database
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: req.user.id,
        items: items,
        shipping_address: shipping_address,
        billing_address: billing_address || shipping_address,
        payment_method_id: payment_method_id,
        payment_provider: payment_provider || 'stripe',
        subtotal: subtotal,
        tax: tax || 0,
        shipping_cost: shipping_cost || 0,
        total: total,
        status: 'pending',
        notes: notes,
        order_number: generateOrderNumber()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    res.status(201).json({
      success: true,
      data: {
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        total: order.total,
        created_at: order.created_at
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get user's orders
 * GET /api/orders
 */
router.get('/', validatePagination, async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('orders')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: orders, error, count } = await query;

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    res.json({
      success: true,
      data: orders.map(order => ({
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        total: order.total,
        items_count: order.items.length,
        created_at: order.created_at,
        updated_at: order.updated_at
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || orders.length,
        pages: Math.ceil((count || orders.length) / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get a specific order
 * GET /api/orders/:id
 */
router.get('/:id', validateId, requireOwnership('order'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        payment_methods (
          id,
          payment_method_id,
          type,
          card_brand,
          card_last4
        )
      `)
      .eq('id', id)
      .single();

    if (error || !order) {
      throw new NotFoundError('Order not found');
    }

    res.json({
      success: true,
      data: {
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        items: order.items,
        shipping_address: order.shipping_address,
        billing_address: order.billing_address,
        subtotal: order.subtotal,
        tax: order.tax,
        shipping_cost: order.shipping_cost,
        total: order.total,
        payment_method: order.payment_methods,
        notes: order.notes,
        created_at: order.created_at,
        updated_at: order.updated_at
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Update order status
 * PATCH /api/orders/:id/status
 */
router.patch('/:id/status', validateId, requireOwnership('order'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'].includes(status)) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Invalid status. Must be one of: pending, processing, shipped, delivered, cancelled, refunded'
      });
    }

    const { data: order, error } = await supabase
      .from('orders')
      .update({
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !order) {
      throw new NotFoundError('Order not found');
    }

    res.json({
      success: true,
      data: {
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        updated_at: order.updated_at
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Cancel an order
 * POST /api/orders/:id/cancel
 */
router.post('/:id/cancel', validateId, requireOwnership('order'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Check if order can be cancelled
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('status')
      .eq('id', id)
      .single();

    if (fetchError || !order) {
      throw new NotFoundError('Order not found');
    }

    if (!['pending', 'processing'].includes(order.status)) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Order cannot be cancelled in its current status'
      });
    }

    const { data: updatedOrder, error } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        notes: order.notes ? `${order.notes}\nCancelled: ${reason || 'No reason provided'}` : `Cancelled: ${reason || 'No reason provided'}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    res.json({
      success: true,
      data: {
        id: updatedOrder.id,
        order_number: updatedOrder.order_number,
        status: updatedOrder.status,
        updated_at: updatedOrder.updated_at
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get order statistics
 * GET /api/orders/stats
 */
router.get('/stats', async (req, res, next) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('status, total, created_at')
      .eq('user_id', req.user.id);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    const stats = {
      total_orders: orders.length,
      total_spent: orders.reduce((sum, order) => sum + (order.total || 0), 0),
      status_counts: {
        pending: orders.filter(o => o.status === 'pending').length,
        processing: orders.filter(o => o.status === 'processing').length,
        shipped: orders.filter(o => o.status === 'shipped').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
        refunded: orders.filter(o => o.status === 'refunded').length
      },
      average_order_value: orders.length > 0 ? orders.reduce((sum, order) => sum + (order.total || 0), 0) / orders.length : 0
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Generate a unique order number
 */
function generateOrderNumber() {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `SS-${timestamp.slice(-8)}-${random}`;
}

module.exports = router; 