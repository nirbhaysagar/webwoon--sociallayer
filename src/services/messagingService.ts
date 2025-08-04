import { supabase } from '../config/supabase';

export interface Conversation {
  id: string;
  user_id: string;
  store_id: string;
  product_id?: number;
  order_id?: string;
  subject: string;
  status: 'active' | 'archived' | 'resolved';
  last_message_at: string;
  created_at: string;
  updated_at: string;
  stores?: {
    name: string;
    logo_url: string;
  };
  products?: {
    name: string;
    price: number;
    product_images: Array<{ image_url: string }>;
  };
  users?: {
    full_name: string;
    avatar_url: string;
  };
  unread_count?: number;
  latest_message?: {
    content: string;
    sender_id: string;
    sender_type: string;
  };
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: 'user' | 'seller' | 'system';
  content: string;
  message_type: 'text' | 'image' | 'file' | 'product' | 'order';
  metadata?: any;
  is_read: boolean;
  read_at?: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  created_at: string;
  updated_at: string;
  users?: {
    full_name: string;
    avatar_url: string;
  };
  stores?: {
    name: string;
    logo_url: string;
  };
  reactions?: Array<{
    reaction_type: string;
    user_id: string;
  }>;
}

export interface MessageNotification {
  id: string;
  user_id: string;
  message_id: string;
  conversation_id: string;
  notification_type: 'new_message' | 'message_reaction' | 'conversation_archived';
  is_read: boolean;
  read_at?: string;
  created_at: string;
  messages?: {
    content: string;
    sender_id: string;
    sender_type: string;
  };
  conversations?: {
    subject: string;
    stores: {
      name: string;
    };
  };
}

export interface ChatSettings {
  id: string;
  user_id: string;
  auto_reply_enabled: boolean;
  auto_reply_message?: string;
  office_hours: {
    enabled: boolean;
    schedule: Array<{
      day: string;
      start: string;
      end: string;
    }>;
  };
  notification_preferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  created_at: string;
  updated_at: string;
}

class MessagingService {
  private realtimeSubscription: any = null;

  // Create new conversation (customer initiates)
  async createConversation(data: {
    store_id: string;
    product_id?: number;
    order_id?: string;
    subject: string;
    initial_message: string;
  }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Create conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          store_id: data.store_id,
          product_id: data.product_id,
          order_id: data.order_id,
          subject: data.subject,
          status: 'active'
        })
        .select()
        .single();

      if (convError) {
        throw new Error('Failed to create conversation');
      }

      // Add initial message
      const { data: message, error: msgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: user.id,
          sender_type: 'user',
          content: data.initial_message,
          message_type: 'text',
          status: 'sent'
        })
        .select()
        .single();

      if (msgError) {
        console.error('Error creating initial message:', msgError);
      }

      return conversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  // Get user conversations (for customers)
  async getUserConversations(status: string = 'active', limit: number = 20, page: number = 1) {
    try {
      const offset = (page - 1) * limit;
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
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
        .eq('user_id', user.id)
        .order('last_message_at', { ascending: false });

      if (status !== 'all') {
        query = query.eq('status', status);
      }

      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw new Error(error.message);
      }

      // Transform data to include unread counts and latest message
      const transformedConversations = data.map((conv: any) => {
        const messages = conv.messages || [];
        const unreadCount = messages.filter((m: any) => 
          m.sender_id !== user.id && !m.is_read
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

      return {
        data: transformedConversations,
        pagination: {
          page,
          limit,
          total: count || data?.length || 0,
          totalPages: Math.ceil((count || data?.length || 0) / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching user conversations:', error);
      throw error;
    }
  }

  // Get seller conversations (for store owners)
  async getSellerConversations(status: string = 'active', limit: number = 20, page: number = 1) {
    try {
      const offset = (page - 1) * limit;
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      let query = supabase
        .from('conversations')
        .select(`
          *,
          users(full_name, avatar_url),
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
        .eq('store_id', `(select id from stores where user_id = '${user.id}')`)
        .order('last_message_at', { ascending: false });

      if (status !== 'all') {
        query = query.eq('status', status);
      }

      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw new Error(error.message);
      }

      // Transform data to include unread counts and latest message
      const transformedConversations = data.map((conv: any) => {
        const messages = conv.messages || [];
        const unreadCount = messages.filter((m: any) => 
          m.sender_id !== user.id && !m.is_read
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

      return {
        data: transformedConversations,
        pagination: {
          page,
          limit,
          total: count || data?.length || 0,
          totalPages: Math.ceil((count || data?.length || 0) / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching seller conversations:', error);
      throw error;
    }
  }

  // Get single conversation with messages
  async getConversation(conversationId: string) {
    try {
      // Get conversation details
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select(`
          *,
          stores(name, logo_url),
          products(name, price, product_images(image_url)),
          users(full_name, avatar_url)
        `)
        .eq('id', conversationId)
        .single();

      if (convError || !conversation) {
        throw new Error('Conversation not found');
      }

      // Get messages
      const { data: messages, error: msgError } = await supabase
        .from('messages')
        .select(`
          *,
          users(id, full_name, avatar_url),
          stores(name, logo_url)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (msgError) {
        throw new Error('Failed to fetch messages');
      }

      // Mark messages as read
      await this.markConversationAsRead(conversationId);

      return {
        conversation,
        messages: messages || []
      };
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }
  }

  // Send message
  async sendMessage(conversationId: string, data: {
    content: string;
    message_type?: string;
    metadata?: any;
  }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Verify user has access to this conversation
      const { data: conversation } = await supabase
        .from('conversations')
        .select('user_id, store_id')
        .eq('id', conversationId)
        .single();

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      // Determine sender type
      const senderType = conversation.user_id === user.id ? 'user' : 'seller';

      // Create message
      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          sender_type: senderType,
          content: data.content,
          message_type: data.message_type || 'text',
          metadata: data.metadata || {},
          status: 'sent'
        })
        .select(`
          *,
          users(id, full_name, avatar_url),
          stores(name, logo_url)
        `)
        .single();

      if (error) {
        throw new Error('Failed to send message');
      }

      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Mark conversation as read
  async markConversationAsRead(conversationId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase.rpc('mark_conversation_as_read', {
        conv_id: conversationId,
        user_uuid: user.id
      });

      if (error) {
        console.error('Error marking conversation as read:', error);
      }
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  }

  // Get unread message count
  async getUnreadCount() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return 0;
      }

      const { data, error } = await supabase.rpc('get_unread_message_count', {
        user_uuid: user.id
      });

      if (error) {
        console.error('Error getting unread count:', error);
        return 0;
      }

      return data || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // Get message notifications
  async getNotifications(limit: number = 20, page: number = 1) {
    try {
      const offset = (page - 1) * limit;
      
      const { data, error, count } = await supabase
        .from('message_notifications')
        .select(`
          *,
          messages(content, sender_id, sender_type),
          conversations(subject, stores(name))
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error('Failed to fetch notifications');
      }

      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || data?.length || 0,
          totalPages: Math.ceil((count || data?.length || 0) / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  // Mark notifications as read
  async markNotificationsAsRead(notificationIds: string[]) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('message_notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .in('id', notificationIds);

      if (error) {
        throw new Error('Failed to mark notifications as read');
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      throw error;
    }
  }

  // Get chat settings
  async getChatSettings() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('chat_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new Error('Failed to fetch chat settings');
      }

      return data || {
        auto_reply_enabled: false,
        auto_reply_message: null,
        office_hours: { enabled: false, schedule: [] },
        notification_preferences: { email: true, push: true, sms: false }
      };
    } catch (error) {
      console.error('Error fetching chat settings:', error);
      throw error;
    }
  }

  // Update chat settings
  async updateChatSettings(settings: Partial<ChatSettings>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('chat_settings')
        .upsert({
          user_id: user.id,
          ...settings,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw new Error('Failed to update chat settings');
      }

      return data;
    } catch (error) {
      console.error('Error updating chat settings:', error);
      throw error;
    }
  }

  // Subscribe to real-time messages
  subscribeToMessages(conversationId: string, callback: (message: Message) => void) {
    try {
      this.realtimeSubscription = supabase
        .channel(`messages:${conversationId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        }, (payload) => {
          console.log('New message received:', payload.new);
          callback(payload.new as Message);
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        }, (payload) => {
          console.log('Message updated:', payload.new);
          callback(payload.new as Message);
        })
        .subscribe();

      return this.realtimeSubscription;
    } catch (error) {
      console.error('Error subscribing to messages:', error);
      throw error;
    }
  }

  // Unsubscribe from real-time messages
  unsubscribeFromMessages() {
    if (this.realtimeSubscription) {
      supabase.removeChannel(this.realtimeSubscription);
      this.realtimeSubscription = null;
    }
  }

  // Subscribe to typing indicators
  subscribeToTyping(conversationId: string, callback: (data: any) => void) {
    try {
      const typingChannel = supabase
        .channel(`typing:${conversationId}`)
        .on('broadcast', { event: 'typing' }, (payload) => {
          console.log('Typing indicator received:', payload);
          callback(payload);
        })
        .subscribe();

      return typingChannel;
    } catch (error) {
      console.error('Error subscribing to typing indicators:', error);
      throw error;
    }
  }

  // Send typing indicator
  async sendTypingIndicator(conversationId: string, isTyping: boolean) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      await supabase.channel(`typing:${conversationId}`).send({
        type: 'broadcast',
        event: 'typing',
        payload: { sender_id: user.id, is_typing: isTyping }
      });
    } catch (error) {
      console.error('Error sending typing indicator:', error);
    }
  }

  // React to message
  async reactToMessage(messageId: string, reactionType: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('message_reactions')
        .insert({
          message_id: messageId,
          user_id: user.id,
          reaction_type: reactionType
        })
        .select()
        .single();

      if (error) {
        throw new Error('Failed to add reaction');
      }

      return data;
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw error;
    }
  }

  // Remove reaction
  async removeReaction(messageId: string, reactionType: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('message_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('reaction_type', reactionType);

      if (error) {
        throw new Error('Failed to remove reaction');
      }
    } catch (error) {
      console.error('Error removing reaction:', error);
      throw error;
    }
  }
}

export const messagingService = new MessagingService(); 