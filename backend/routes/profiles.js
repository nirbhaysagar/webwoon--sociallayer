const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validateRequest, validateSearch } = require('../middleware/validation');
const { supabase } = require('../services/supabase');

/**
 * Search seller profiles
 * GET /api/profiles/search
 */
router.get('/search', [
  authenticateToken,
  validateSearch
], async (req, res, next) => {
  try {
    const { q: query, type = 'all', limit = 20, page = 1 } = req.query;
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
      .from('stores')
      .select(`
        id,
        name,
        description,
        logo_url,
        category,
        created_at,
        users!stores_user_id_fkey (
          id,
          email,
          full_name,
          avatar_url
        )
      `)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    // Apply type filter
    if (type !== 'all') {
      searchQuery = searchQuery.eq('type', type);
    }

    // Apply pagination
    searchQuery = searchQuery.range(offset, offset + limit - 1);

    const { data: profiles, error, count } = await searchQuery;

    if (error) {
      console.error('Profile search error:', error);
      throw new Error('Failed to search profiles');
    }

    // Transform data to match frontend expectations
    const transformedProfiles = profiles.map(profile => ({
      id: profile.id,
      name: profile.name,
      username: `@${profile.name.toLowerCase().replace(/\s+/g, '')}`,
      avatar: profile.logo_url || profile.users?.avatar_url,
      bio: profile.description,
      type: 'seller',
      category: profile.category,
      rating: 4.5 + Math.random() * 0.5, // Mock rating
      productsCount: Math.floor(Math.random() * 200) + 50, // Mock count
      followers: Math.floor(Math.random() * 5000) + 100, // Mock followers
      isVerified: Math.random() > 0.3, // 70% verified
      created_at: profile.created_at
    }));

    res.json({
      success: true,
      data: transformedProfiles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || transformedProfiles.length,
        totalPages: Math.ceil((count || transformedProfiles.length) / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get profile details
 * GET /api/profiles/:id
 */
router.get('/:id', [
  authenticateToken,
  validateRequest
], async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: profile, error } = await supabase
      .from('stores')
      .select(`
        *,
        users!stores_user_id_fkey (
          id,
          email,
          full_name,
          avatar_url
        ),
        products(count)
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error || !profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found'
      });
    }

    // Get follower count
    const { count: followersCount } = await supabase
      .from('followers')
      .select('*', { count: 'exact', head: true })
      .eq('store_id', id);

    // Get posts count
    const { count: postsCount } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('store_id', id);

    const profileData = {
      id: profile.id,
      name: profile.name,
      username: `@${profile.name.toLowerCase().replace(/\s+/g, '')}`,
      avatar: profile.logo_url || profile.users?.avatar_url,
      bio: profile.description,
      category: profile.category,
      website: profile.website,
      location: profile.location,
      rating: 4.5 + Math.random() * 0.5,
      productsCount: profile.products?.[0]?.count || 0,
      followers: followersCount || 0,
      posts: postsCount || 0,
      isVerified: Math.random() > 0.3,
      created_at: profile.created_at,
      contact: {
        email: profile.users?.email,
        phone: profile.phone
      }
    };

    res.json({
      success: true,
      data: profileData
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Update profile
 * PUT /api/profiles/:id
 */
router.put('/:id', [
  authenticateToken,
  requireRole(['seller', 'admin']),
  validateRequest
], async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, category, website, location, phone } = req.body;

    // Verify ownership
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('user_id')
      .eq('id', id)
      .single();

    if (storeError || !store || store.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to update this profile'
      });
    }

    const { data, error } = await supabase
      .from('stores')
      .update({
        name,
        description,
        category,
        website,
        location,
        phone,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Profile update error:', error);
      throw new Error('Failed to update profile');
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Follow a profile
 * POST /api/profiles/:id/follow
 */
router.post('/:id/follow', [
  authenticateToken,
  validateRequest
], async (req, res, next) => {
  try {
    const { id: storeId } = req.params;
    const userId = req.user.id;

    // Check if already following
    const { data: existingFollow } = await supabase
      .from('followers')
      .select('id')
      .eq('user_id', userId)
      .eq('store_id', storeId)
      .single();

    if (existingFollow) {
      return res.status(400).json({
        success: false,
        error: 'Already following this profile'
      });
    }

    // Add follow
    const { data, error } = await supabase
      .from('followers')
      .insert({
        user_id: userId,
        store_id: storeId,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Follow error:', error);
      throw new Error('Failed to follow profile');
    }

    res.json({
      success: true,
      data,
      message: 'Successfully followed profile'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Unfollow a profile
 * DELETE /api/profiles/:id/follow
 */
router.delete('/:id/follow', [
  authenticateToken,
  validateRequest
], async (req, res, next) => {
  try {
    const { id: storeId } = req.params;
    const userId = req.user.id;

    const { error } = await supabase
      .from('followers')
      .delete()
      .eq('user_id', userId)
      .eq('store_id', storeId);

    if (error) {
      console.error('Unfollow error:', error);
      throw new Error('Failed to unfollow profile');
    }

    res.json({
      success: true,
      message: 'Successfully unfollowed profile'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get profile posts
 * GET /api/profiles/:id/posts
 */
router.get('/:id/posts', [
  authenticateToken,
  validateRequest
], async (req, res, next) => {
  try {
    const { id: storeId } = req.params;
    const { limit = 20, page = 1 } = req.query;
    const offset = (page - 1) * limit;

    const { data: posts, error, count } = await supabase
      .from('posts')
      .select(`
        *,
        post_products(
          position_x,
          position_y,
          products(name, price, product_images(image_url))
        )
      `, { count: 'exact' })
      .eq('store_id', storeId)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Profile posts error:', error);
      throw new Error('Failed to fetch profile posts');
    }

    res.json({
      success: true,
      data: posts || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 