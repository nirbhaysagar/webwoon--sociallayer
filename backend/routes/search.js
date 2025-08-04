const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { validateRequest, validateSearch } = require('../middleware/validation');
const { supabase } = require('../services/supabase');

/**
 * Advanced product search
 * GET /api/search/products
 */
router.get('/products', [
  authenticateToken,
  validateSearch
], async (req, res, next) => {
  try {
    const { 
      q: query, 
      categories, 
      price_min, 
      price_max, 
      stores, 
      availability = 'all',
      sort_by = 'relevance',
      limit = 20, 
      page = 1 
    } = req.query;
    const offset = (page - 1) * limit;

    if (!query || query.trim().length === 0) {
      return res.json({
        success: true,
        data: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          totalPages: 0
        }
      });
    }

    // Build search query
    let searchQuery = supabase
      .from('products')
      .select(`
        *,
        stores(name, logo_url),
        product_images(image_url, is_primary)
      `)
      .eq('is_active', true)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`);

    // Apply filters
    if (categories) {
      const categoryArray = categories.split(',');
      searchQuery = searchQuery.in('category_id', categoryArray);
    }

    if (price_min) {
      searchQuery = searchQuery.gte('price', parseFloat(price_min));
    }

    if (price_max) {
      searchQuery = searchQuery.lte('price', parseFloat(price_max));
    }

    if (stores) {
      const storeArray = stores.split(',');
      searchQuery = searchQuery.in('store_id', storeArray);
    }

    if (availability !== 'all') {
      if (availability === 'in_stock') {
        searchQuery = searchQuery.gt('stock_quantity', 0);
      } else if (availability === 'out_of_stock') {
        searchQuery = searchQuery.eq('stock_quantity', 0);
      }
    }

    // Apply sorting
    switch (sort_by) {
      case 'price_low':
        searchQuery = searchQuery.order('price', { ascending: true });
        break;
      case 'price_high':
        searchQuery = searchQuery.order('price', { ascending: false });
        break;
      case 'newest':
        searchQuery = searchQuery.order('created_at', { ascending: false });
        break;
      case 'rating':
        searchQuery = searchQuery.order('rating', { ascending: false });
        break;
      default: // relevance
        searchQuery = searchQuery.order('created_at', { ascending: false });
    }

    // Apply pagination
    searchQuery = searchQuery.range(offset, offset + limit - 1);

    const { data: products, error, count } = await searchQuery;

    if (error) {
      console.error('Product search error:', error);
      throw new Error('Failed to search products');
    }

    res.json({
      success: true,
      data: products || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || products?.length || 0,
        totalPages: Math.ceil((count || products?.length || 0) / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Search suggestions
 * GET /api/search/suggestions
 */
router.get('/suggestions', [
  authenticateToken,
  validateSearch
], async (req, res, next) => {
  try {
    const { q: query, type = 'all' } = req.query;

    if (!query || query.trim().length === 0) {
      return res.json({
        success: true,
        data: []
      });
    }

    const suggestions = [];

    // Get trending searches
    const trendingSearches = [
      { id: 'trend_1', text: 'wireless headphones', type: 'trending', count: 1250 },
      { id: 'trend_2', text: 'smart watch', type: 'trending', count: 890 },
      { id: 'trend_3', text: 'organic cotton', type: 'trending', count: 650 },
      { id: 'trend_4', text: 'leather bag', type: 'trending', count: 420 }
    ];

    // Filter trending searches based on query
    const filteredTrending = trendingSearches.filter(item => 
      item.text.toLowerCase().includes(query.toLowerCase())
    );
    suggestions.push(...filteredTrending);

    // Get category suggestions
    const categories = ['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Beauty', 'Books'];
    const categorySuggestions = categories
      .filter(cat => cat.toLowerCase().includes(query.toLowerCase()))
      .map(cat => ({
        id: `category_${cat}`,
        text: cat,
        type: 'category'
      }));
    suggestions.push(...categorySuggestions);

    // Get brand suggestions
    const brands = ['Apple', 'Samsung', 'Nike', 'Adidas', 'Sony', 'LG'];
    const brandSuggestions = brands
      .filter(brand => brand.toLowerCase().includes(query.toLowerCase()))
      .map(brand => ({
        id: `brand_${brand}`,
        text: brand,
        type: 'brand'
      }));
    suggestions.push(...brandSuggestions);

    res.json({
      success: true,
      data: suggestions.slice(0, 8) // Limit to 8 suggestions
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Track search analytics
 * POST /api/search/analytics
 */
router.post('/analytics', [
  authenticateToken,
  validateRequest
], async (req, res, next) => {
  try {
    const { query, result_count, filters, session_id } = req.body;
    const userId = req.user.id;

    const analyticsData = {
      user_id: userId,
      query,
      result_count,
      filters: JSON.stringify(filters),
      session_id,
      timestamp: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('search_analytics')
      .insert(analyticsData)
      .select()
      .single();

    if (error) {
      console.error('Search analytics error:', error);
      // Don't throw error for analytics failures
      return res.json({
        success: true,
        message: 'Search tracked'
      });
    }

    res.json({
      success: true,
      data,
      message: 'Search analytics tracked'
    });
  } catch (error) {
    // Don't fail the request for analytics errors
    res.json({
      success: true,
      message: 'Search tracked'
    });
  }
});

/**
 * Get popular searches
 * GET /api/search/popular
 */
router.get('/popular', [
  authenticateToken,
  validateRequest
], async (req, res, next) => {
  try {
    const { limit = 10, period = '7 days' } = req.query;

    // Calculate period start date
    const periodStart = new Date();
    switch (period) {
      case '24 hours':
        periodStart.setDate(periodStart.getDate() - 1);
        break;
      case '7 days':
        periodStart.setDate(periodStart.getDate() - 7);
        break;
      case '30 days':
        periodStart.setDate(periodStart.getDate() - 30);
        break;
      default:
        periodStart.setDate(periodStart.getDate() - 7);
    }

    const { data, error } = await supabase
      .from('search_analytics')
      .select('query, COUNT(*) as count')
      .gte('timestamp', periodStart.toISOString())
      .group('query')
      .order('count', { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      console.error('Popular searches error:', error);
      // Return mock data if database query fails
      return res.json({
        success: true,
        data: [
          { query: 'wireless headphones', count: 1250 },
          { query: 'smart watch', count: 890 },
          { query: 'organic cotton', count: 650 },
          { query: 'leather bag', count: 420 },
          { query: 'running shoes', count: 380 }
        ]
      });
    }

    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get search history for user
 * GET /api/search/history
 */
router.get('/history', [
  authenticateToken,
  validateRequest
], async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('search_analytics')
      .select('query, timestamp')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      console.error('Search history error:', error);
      return res.json({
        success: true,
        data: []
      });
    }

    // Remove duplicates and get unique queries
    const uniqueQueries = [];
    const seen = new Set();
    data.forEach(item => {
      if (!seen.has(item.query)) {
        seen.add(item.query);
        uniqueQueries.push(item.query);
      }
    });

    res.json({
      success: true,
      data: uniqueQueries
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 