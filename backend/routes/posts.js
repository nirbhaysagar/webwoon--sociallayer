const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validateRequest, validateSearch } = require('../middleware/validation');
const { supabase } = require('../services/supabase');

/**
 * Search posts
 * GET /api/posts/search
 */
router.get('/search', [
  authenticateToken,
  validateSearch
], async (req, res, next) => {
  try {
    const { q: query, store_id, status = 'all', limit = 20, page = 1 } = req.query;
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
      .from('posts')
      .select(`
        *,
        stores(name, logo_url),
        post_products(
          position_x,
          position_y,
          products(name, price, product_images(image_url))
        )
      `)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    // Apply filters
    if (store_id) {
      searchQuery = searchQuery.eq('store_id', store_id);
    }
    if (status !== 'all') {
      searchQuery = searchQuery.eq('status', status);
    }

    // Apply pagination
    searchQuery = searchQuery.range(offset, offset + limit - 1);

    const { data: posts, error, count } = await searchQuery;

    if (error) {
      console.error('Post search error:', error);
      throw new Error('Failed to search posts');
    }

    res.json({
      success: true,
      data: posts || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || posts?.length || 0,
        totalPages: Math.ceil((count || posts?.length || 0) / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get all posts for a store
 * GET /api/posts
 */
router.get('/', [
  authenticateToken,
  validateRequest
], async (req, res, next) => {
  try {
    const { store_id, status, limit = 20, page = 1 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('posts')
      .select(`
        *,
        stores(name, logo_url),
        post_products(
          position_x,
          position_y,
          products(name, price, product_images(image_url))
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (store_id) {
      query = query.eq('store_id', store_id);
    }
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: posts, error, count } = await query;

    if (error) {
      console.error('Get posts error:', error);
      throw new Error('Failed to fetch posts');
    }

    res.json({
      success: true,
      data: posts || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || posts?.length || 0,
        totalPages: Math.ceil((count || posts?.length || 0) / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get single post
 * GET /api/posts/:id
 */
router.get('/:id', [
  authenticateToken,
  validateRequest
], async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: post, error } = await supabase
      .from('posts')
      .select(`
        *,
        stores(name, logo_url),
        post_products(
          position_x,
          position_y,
          products(name, price, product_images(image_url))
        )
      `)
      .eq('id', id)
      .single();

    if (error || !post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Create new post
 * POST /api/posts
 */
router.post('/', [
  authenticateToken,
  requireRole(['seller', 'admin']),
  validateRequest
], async (req, res, next) => {
  try {
    const { title, content, media_urls, status = 'draft', scheduled_at, tags } = req.body;
    const userId = req.user.id;

    // Get user's store
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (storeError || !store) {
      return res.status(400).json({
        success: false,
        error: 'No store found for user'
      });
    }

    const postData = {
      store_id: store.id,
      user_id: userId,
      title,
      content,
      media_urls: media_urls || [],
      status,
      is_published: status === 'published',
      scheduled_at: scheduled_at || null,
      published_at: status === 'published' ? new Date().toISOString() : null,
      tags: tags || [],
      engagement_metrics: {
        likes: 0,
        comments: 0,
        shares: 0,
        views: 0
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('posts')
      .insert(postData)
      .select()
      .single();

    if (error) {
      console.error('Create post error:', error);
      throw new Error('Failed to create post');
    }

    res.status(201).json({
      success: true,
      data,
      message: 'Post created successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Update post
 * PUT /api/posts/:id
 */
router.put('/:id', [
  authenticateToken,
  requireRole(['seller', 'admin']),
  validateRequest
], async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, media_urls, status, scheduled_at, tags } = req.body;
    const userId = req.user.id;

    // Verify ownership
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('store_id, stores!posts_store_id_fkey(user_id)')
      .eq('id', id)
      .single();

    if (postError || !post || post.stores.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to update this post'
      });
    }

    const updateData = {
      title,
      content,
      media_urls,
      status,
      is_published: status === 'published',
      scheduled_at: scheduled_at || null,
      published_at: status === 'published' ? new Date().toISOString() : null,
      tags,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update post error:', error);
      throw new Error('Failed to update post');
    }

    res.json({
      success: true,
      data,
      message: 'Post updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Delete post
 * DELETE /api/posts/:id
 */
router.delete('/:id', [
  authenticateToken,
  requireRole(['seller', 'admin']),
  validateRequest
], async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify ownership
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('store_id, stores!posts_store_id_fkey(user_id)')
      .eq('id', id)
      .single();

    if (postError || !post || post.stores.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to delete this post'
      });
    }

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete post error:', error);
      throw new Error('Failed to delete post');
    }

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Like a post
 * POST /api/posts/:id/like
 */
router.post('/:id/like', [
  authenticateToken,
  validateRequest
], async (req, res, next) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user.id;

    // Check if already liked
    const { data: existingLike } = await supabase
      .from('post_likes')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .single();

    if (existingLike) {
      return res.status(400).json({
        success: false,
        error: 'Already liked this post'
      });
    }

    // Add like
    const { data, error } = await supabase
      .from('post_likes')
      .insert({
        user_id: userId,
        post_id: postId,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Like post error:', error);
      throw new Error('Failed to like post');
    }

    res.json({
      success: true,
      data,
      message: 'Post liked successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Unlike a post
 * DELETE /api/posts/:id/like
 */
router.delete('/:id/like', [
  authenticateToken,
  validateRequest
], async (req, res, next) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user.id;

    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId);

    if (error) {
      console.error('Unlike post error:', error);
      throw new Error('Failed to unlike post');
    }

    res.json({
      success: true,
      message: 'Post unliked successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Comment on a post
 * POST /api/posts/:id/comments
 */
router.post('/:id/comments', [
  authenticateToken,
  validateRequest
], async (req, res, next) => {
  try {
    const { id: postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('post_comments')
      .insert({
        user_id: userId,
        post_id: postId,
        content,
        created_at: new Date().toISOString()
      })
      .select(`
        *,
        users(id, full_name, avatar_url)
      `)
      .single();

    if (error) {
      console.error('Comment post error:', error);
      throw new Error('Failed to comment on post');
    }

    res.status(201).json({
      success: true,
      data,
      message: 'Comment added successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get post comments
 * GET /api/posts/:id/comments
 */
router.get('/:id/comments', [
  authenticateToken,
  validateRequest
], async (req, res, next) => {
  try {
    const { id: postId } = req.params;
    const { limit = 20, page = 1 } = req.query;
    const offset = (page - 1) * limit;

    const { data: comments, error, count } = await supabase
      .from('post_comments')
      .select(`
        *,
        users(id, full_name, avatar_url)
      `, { count: 'exact' })
      .eq('post_id', postId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Get comments error:', error);
      throw new Error('Failed to fetch comments');
    }

    res.json({
      success: true,
      data: comments || [],
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