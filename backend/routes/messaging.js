const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const { supabase } = require('../services/supabase');

/**
 * Get user conversations
 * GET /api/messaging/conversations
 */
router.get('/conversations', [
  authenticateToken,
  validateRequest
], async (req, res, next) => {
  try {
    const { status = 'active', limit = 20, page = 1 } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    let query = supabase
      .from('conversations')
      .select(`
        *,
        stores(name, logo_url),
        products(name, price, product_images(image_url)),
        messages(
          id,
          content,
          sender_id,
          sender_type,
          created_at,
          is_read
        )
      `)
      .or(`user_id.eq.${userId},store_id.in.(select id from stores where user_id = ${userId})`)
      .order('last_message_at', { ascending: false });

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    query = query.range(offset, offset + limit - 1);

    const { data: conversations, error, count } = await query;

    if (error) {
      console.error('Get conversations error:', error);
      throw new Error('Failed to fetch conversations');
    }

    // Transform data to include unread counts and latest message
    const transformedConversations = conversations.map(conv => {
      const messages = conv.messages || [];
      const unreadCount = messages.filter(m => 
        m.sender_id !== userId && !m.is_read
      ).length;
      
      const latestMessage = messages.length > 0 
        ? messages[messages.length - 1] 
        : null;

      return {
        ...conv,
        unread_count: unreadCount,
        latest_message: latestMessage,
        messages: undefined // Remove full messages array
      };
    });

    res.json({
      success: true,
      data: transformedConversations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || conversations?.length || 0,
        totalPages: Math.ceil((count || conversations?.length || 0) / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get single conversation with messages
 * GET /api/messaging/conversations/:id
 */
router.get('/conversations/:id', [
  authenticateToken,
  validateRequest
], async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get conversation details
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select(`
        *,
        stores(name, logo_url),
        products(name, price, product_images(image_url))
      `)
      .eq('id', id)
      .single();

    if (convError || !conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    // Verify user has access to this conversation
    const hasAccess = conversation.user_id === userId || 
      (await supabase
        .from('stores')
        .select('user_id')
        .eq('id', conversation.store_id)
        .single()
      ).data?.user_id === userId;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this conversation'
      });
    }

    // Get messages
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select(`
        *,
        users(id, full_name, avatar_url),
        stores(name, logo_url)
      `)
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });

    if (msgError) {
      console.error('Get messages error:', msgError);
      throw new Error('Failed to fetch messages');
    }

    // Mark messages as read
    await supabase.rpc('mark_conversation_as_read', {
      conv_id: id,
      user_uuid: userId
    });

    res.json({
      success: true,
      data: {
        conversation,
        messages: messages || []
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Create new conversation
 * POST /api/messaging/conversations
 */
router.post('/conversations', [
  authenticateToken,
  validateRequest
], async (req, res, next) => {
  try {
    const { store_id, product_id, order_id, subject, initial_message } = req.body;
    const userId = req.user.id;

    // Check if conversation already exists
    const { data: existingConv } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_id', userId)
      .eq('store_id', store_id)
      .eq('product_id', product_id)
      .single();

    if (existingConv) {
      return res.status(400).json({
        success: false,
        error: 'Conversation already exists'
      });
    }

    // Create conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        store_id,
        product_id,
        order_id,
        subject,
        status: 'active'
      })
      .select()
      .single();

    if (convError) {
      console.error('Create conversation error:', convError);
      throw new Error('Failed to create conversation');
    }

    // Add initial message if provided
    if (initial_message) {
      const { data: message, error: msgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: userId,
          sender_type: 'user',
          content: initial_message,
          message_type: 'text'
        })
        .select()
        .single();

      if (msgError) {
        console.error('Create initial message error:', msgError);
      }
    }

    res.status(201).json({
      success: true,
      data: conversation,
      message: 'Conversation created successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Send message
 * POST /api/messaging/conversations/:id/messages
 */
router.post('/conversations/:id/messages', [
  authenticateToken,
  validateRequest
], async (req, res, next) => {
  try {
    const { id: conversationId } = req.params;
    const { content, message_type = 'text', metadata = {} } = req.body;
    const userId = req.user.id;

    // Verify user has access to this conversation
    const { data: conversation } = await supabase
      .from('conversations')
      .select('user_id, store_id')
      .eq('id', conversationId)
      .single();

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    const hasAccess = conversation.user_id === userId || 
      (await supabase
        .from('stores')
        .select('user_id')
        .eq('id', conversation.store_id)
        .single()
      ).data?.user_id === userId;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this conversation'
      });
    }

    // Determine sender type
    const senderType = conversation.user_id === userId ? 'user' : 'seller';

    // Create message
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: userId,
        sender_type: senderType,
        content,
        message_type,
        metadata
      })
      .select(`
        *,
        users(id, full_name, avatar_url),
        stores(name, logo_url)
      `)
      .single();

    if (error) {
      console.error('Send message error:', error);
      throw new Error('Failed to send message');
    }

    res.status(201).json({
      success: true,
      data: message,
      message: 'Message sent successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * React to message
 * POST /api/messaging/messages/:id/reactions
 */
router.post('/messages/:id/reactions', [
  authenticateToken,
  validateRequest
], async (req, res, next) => {
  try {
    const { id: messageId } = req.params;
    const { reaction_type } = req.body;
    const userId = req.user.id;

    // Check if reaction already exists
    const { data: existingReaction } = await supabase
      .from('message_reactions')
      .select('id')
      .eq('message_id', messageId)
      .eq('user_id', userId)
      .eq('reaction_type', reaction_type)
      .single();

    if (existingReaction) {
      return res.status(400).json({
        success: false,
        error: 'Reaction already exists'
      });
    }

    // Add reaction
    const { data: reaction, error } = await supabase
      .from('message_reactions')
      .insert({
        message_id: messageId,
        user_id: userId,
        reaction_type
      })
      .select()
      .single();

    if (error) {
      console.error('Add reaction error:', error);
      throw new Error('Failed to add reaction');
    }

    res.status(201).json({
      success: true,
      data: reaction,
      message: 'Reaction added successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Remove reaction
 * DELETE /api/messaging/messages/:id/reactions
 */
router.delete('/messages/:id/reactions', [
  authenticateToken,
  validateRequest
], async (req, res, next) => {
  try {
    const { id: messageId } = req.params;
    const { reaction_type } = req.body;
    const userId = req.user.id;

    const { error } = await supabase
      .from('message_reactions')
      .delete()
      .eq('message_id', messageId)
      .eq('user_id', userId)
      .eq('reaction_type', reaction_type);

    if (error) {
      console.error('Remove reaction error:', error);
      throw new Error('Failed to remove reaction');
    }

    res.json({
      success: true,
      message: 'Reaction removed successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get message notifications
 * GET /api/messaging/notifications
 */
router.get('/notifications', [
  authenticateToken,
  validateRequest
], async (req, res, next) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    const { data: notifications, error, count } = await supabase
      .from('message_notifications')
      .select(`
        *,
        messages(content, sender_id, sender_type),
        conversations(subject, stores(name))
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Get notifications error:', error);
      throw new Error('Failed to fetch notifications');
    }

    res.json({
      success: true,
      data: notifications || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || notifications?.length || 0,
        totalPages: Math.ceil((count || notifications?.length || 0) / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Mark notifications as read
 * PUT /api/messaging/notifications/read
 */
router.put('/notifications/read', [
  authenticateToken,
  validateRequest
], async (req, res, next) => {
  try {
    const { notification_ids } = req.body;
    const userId = req.user.id;

    const { error } = await supabase
      .from('message_notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .in('id', notification_ids);

    if (error) {
      console.error('Mark notifications read error:', error);
      throw new Error('Failed to mark notifications as read');
    }

    res.json({
      success: true,
      message: 'Notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get unread message count
 * GET /api/messaging/unread-count
 */
router.get('/unread-count', [
  authenticateToken,
  validateRequest
], async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase.rpc('get_unread_message_count', {
      user_uuid: userId
    });

    if (error) {
      console.error('Get unread count error:', error);
      throw new Error('Failed to get unread count');
    }

    res.json({
      success: true,
      data: { unread_count: data || 0 }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get chat settings
 * GET /api/messaging/settings
 */
router.get('/settings', [
  authenticateToken,
  validateRequest
], async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { data: settings, error } = await supabase
      .from('chat_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Get chat settings error:', error);
      throw new Error('Failed to fetch chat settings');
    }

    res.json({
      success: true,
      data: settings || {
        auto_reply_enabled: false,
        auto_reply_message: null,
        office_hours: { enabled: false, schedule: [] },
        notification_preferences: { email: true, push: true, sms: false }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Update chat settings
 * PUT /api/messaging/settings
 */
router.put('/settings', [
  authenticateToken,
  validateRequest
], async (req, res, next) => {
  try {
    const { auto_reply_enabled, auto_reply_message, office_hours, notification_preferences } = req.body;
    const userId = req.user.id;

    const { data: settings, error } = await supabase
      .from('chat_settings')
      .upsert({
        user_id: userId,
        auto_reply_enabled,
        auto_reply_message,
        office_hours,
        notification_preferences,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Update chat settings error:', error);
      throw new Error('Failed to update chat settings');
    }

    res.json({
      success: true,
      data: settings,
      message: 'Chat settings updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 