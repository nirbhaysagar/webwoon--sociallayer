const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const supabase = require('../services/supabase');

const router = express.Router();

// Track analytics event
router.post('/events', [
  authenticateToken,
  body('eventType').isString().notEmpty(),
  body('eventData').optional().isObject(),
  body('sessionId').isString().notEmpty(),
  body('platform').optional().isString(),
  validateRequest
], async (req, res) => {
  try {
    const { eventType, eventData, sessionId, platform } = req.body;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('analytics_events')
      .insert({
        user_id: userId,
        session_id: sessionId,
        event_type: eventType,
        event_data: eventData || {},
        platform: platform || 'web',
        timestamp: new Date().toISOString()
      })
      .select();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: data[0]
    });
  } catch (error) {
    console.error('Error tracking analytics event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track analytics event'
    });
  }
});

// Get sales analytics for seller
router.get('/sales', [
  authenticateToken,
  requireRole('seller'),
  body('period').optional().isIn(['day', 'week', 'month', 'year']),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  validateRequest
], async (req, res) => {
  try {
    const { period = 'month', startDate, endDate } = req.query;
    const sellerId = req.user.id;

    let query = supabase
      .from('sales_analytics')
      .select('*')
      .eq('seller_id', sellerId)
      .eq('period_type', period);

    if (startDate && endDate) {
      query = query.gte('period_start', startDate).lte('period_end', endDate);
    }

    const { data, error } = await query.order('period_start', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Error fetching sales analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sales analytics'
    });
  }
});

// Get product analytics
router.get('/products', [
  authenticateToken,
  requireRole('seller'),
  validateRequest
], async (req, res) => {
  try {
    const { productId, period = 'month' } = req.query;
    const sellerId = req.user.id;

    let query = supabase
      .from('product_analytics')
      .select('*')
      .eq('seller_id', sellerId)
      .eq('period_type', period);

    if (productId) {
      query = query.eq('product_id', productId);
    }

    const { data, error } = await query.order('period_start', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Error fetching product analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product analytics'
    });
  }
});

// Get user engagement metrics
router.get('/engagement', [
  authenticateToken,
  validateRequest
], async (req, res) => {
  try {
    const { period = 'week', startDate, endDate } = req.query;
    const userId = req.user.id;

    // Get user engagement metrics using the database function
    const { data, error } = await supabase.rpc('get_user_engagement_metrics', {
      p_user_id: userId,
      p_period_start: startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      p_period_end: endDate || new Date().toISOString()
    });

    if (error) throw error;

    res.json({
      success: true,
      data: data[0] || {}
    });
  } catch (error) {
    console.error('Error fetching user engagement:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user engagement'
    });
  }
});

// Get search analytics
router.get('/search', [
  authenticateToken,
  validateRequest
], async (req, res) => {
  try {
    const { limit = 10, period = '7 days' } = req.query;
    const userId = req.user.id;

    // Get popular search queries
    const { data, error } = await supabase.rpc('get_popular_search_queries', {
      p_limit: parseInt(limit),
      p_period_start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    });

    if (error) throw error;

    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Error fetching search analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch search analytics'
    });
  }
});

// Get real-time metrics
router.get('/realtime', [
  authenticateToken,
  validateRequest
], async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    // Get active users in last hour
    const { data: activeUsers, error: activeUsersError } = await supabase
      .from('analytics_events')
      .select('user_id')
      .gte('timestamp', oneHourAgo.toISOString())
      .neq('user_id', null);

    if (activeUsersError) throw activeUsersError;

    // Get current sessions in last 5 minutes
    const { data: currentSessions, error: sessionsError } = await supabase
      .from('analytics_events')
      .select('session_id')
      .gte('timestamp', fiveMinutesAgo.toISOString());

    if (sessionsError) throw sessionsError;

    // Get recent events
    const { data: recentEvents, error: eventsError } = await supabase
      .from('analytics_events')
      .select('*')
      .gte('timestamp', fiveMinutesAgo.toISOString())
      .order('timestamp', { ascending: false })
      .limit(10);

    if (eventsError) throw eventsError;

    const uniqueActiveUsers = new Set(activeUsers.map(e => e.user_id)).size;
    const uniqueSessions = new Set(currentSessions.map(e => e.session_id)).size;

    res.json({
      success: true,
      data: {
        activeUsers: uniqueActiveUsers,
        currentSessions: uniqueSessions,
        recentEvents: recentEvents || []
      }
    });
  } catch (error) {
    console.error('Error fetching real-time metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch real-time metrics'
    });
  }
});

// Export analytics data
router.post('/export', [
  authenticateToken,
  requireRole('seller'),
  body('period').isIn(['day', 'week', 'month']),
  body('format').optional().isIn(['json', 'csv']),
  validateRequest
], async (req, res) => {
  try {
    const { period, format = 'json' } = req.body;
    const sellerId = req.user.id;

    // Get all analytics data for the period
    const [salesData, productData, engagementData] = await Promise.all([
      supabase
        .from('sales_analytics')
        .select('*')
        .eq('seller_id', sellerId)
        .eq('period_type', period),
      supabase
        .from('product_analytics')
        .select('*')
        .eq('seller_id', sellerId)
        .eq('period_type', period),
      supabase.rpc('get_user_engagement_metrics', {
        p_user_id: sellerId,
        p_period_start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        p_period_end: new Date().toISOString()
      })
    ]);

    const exportData = {
      period,
      timestamp: new Date().toISOString(),
      sales: salesData.data || [],
      products: productData.data || [],
      engagement: engagementData.data || []
    };

    if (format === 'csv') {
      // Convert to CSV format
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=analytics-${period}-${Date.now()}.csv`);
      // CSV conversion logic would go here
      res.send('CSV data would be generated here');
    } else {
      res.json({
        success: true,
        data: exportData
      });
    }
  } catch (error) {
    console.error('Error exporting analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export analytics data'
    });
  }
});

module.exports = router; 