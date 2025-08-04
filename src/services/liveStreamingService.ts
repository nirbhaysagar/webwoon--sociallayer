import { supabase } from '../config/supabase';

// =============================================
// INTERFACES
// =============================================

export interface LiveRoom {
  id: string;
  host_id: string;
  store_id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  stream_key: string;
  rtmp_url?: string;
  playback_url?: string;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  is_public: boolean;
  is_featured: boolean;
  max_viewers: number;
  current_viewers: number;
  peak_viewers: number;
  total_viewers: number;
  duration_minutes: number;
  scheduled_at?: string;
  started_at?: string;
  ended_at?: string;
  tags?: string[];
  settings?: any;
  created_at: string;
  updated_at: string;
}

export interface LiveChatMessage {
  id: string;
  room_id: string;
  user_id: string;
  message: string;
  message_type: 'text' | 'system' | 'moderator' | 'highlight';
  is_deleted: boolean;
  deleted_by?: string;
  deleted_at?: string;
  created_at: string;
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface LiveRoomParticipant {
  id: string;
  room_id: string;
  user_id: string;
  joined_at: string;
  left_at?: string;
  watch_duration_minutes: number;
  is_active: boolean;
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface LiveSale {
  id: string;
  room_id: string;
  product_id: number;
  featured_at: string;
  featured_by: string;
  is_active: boolean;
  sales_count: number;
  revenue: number;
  created_at: string;
  product?: {
    id: number;
    name: string;
    price: number;
    featured_image_url?: string;
  };
}

export interface LiveRoomAnalytics {
  id: string;
  room_id: string;
  metric_name: string;
  metric_value: number;
  recorded_at: string;
}

export interface LiveRoomStatistics {
  total_viewers: number;
  peak_viewers: number;
  average_watch_time: number;
  total_messages: number;
  total_gifts: number;
  total_sales: number;
}

export interface CreateLiveRoomData {
  title: string;
  description?: string;
  scheduled_at?: string;
  is_public?: boolean;
  max_viewers?: number;
  tags?: string[];
  settings?: any;
}

// =============================================
// LIVE STREAMING SERVICE
// =============================================

class LiveStreamingService {
  private static instance: LiveStreamingService;

  private constructor() {}

  public static getInstance(): LiveStreamingService {
    if (!LiveStreamingService.instance) {
      LiveStreamingService.instance = new LiveStreamingService();
    }
    return LiveStreamingService.instance;
  }

  // =============================================
  // LIVE ROOM MANAGEMENT
  // =============================================

  /**
   * Create a new live room
   */
  async createLiveRoom(storeId: string, data: CreateLiveRoomData): Promise<LiveRoom> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const streamKey = await this.generateStreamKey();

      const { data: liveRoom, error } = await supabase
        .from('live_rooms')
        .insert({
          host_id: user.user.id,
          store_id: storeId,
          stream_key: streamKey,
          ...data,
          status: 'scheduled'
        })
        .select()
        .single();

      if (error) throw error;
      return liveRoom;
    } catch (error) {
      console.error('Error creating live room:', error);
      throw error;
    }
  }

  /**
   * Get live rooms for a store
   */
  async getStoreLiveRooms(storeId: string): Promise<LiveRoom[]> {
    try {
      const { data, error } = await supabase
        .from('live_rooms')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching store live rooms:', error);
      return [];
    }
  }

  /**
   * Get public live rooms
   */
  async getPublicLiveRooms(): Promise<LiveRoom[]> {
    try {
      const { data, error } = await supabase
        .from('live_rooms')
        .select('*')
        .eq('is_public', true)
        .in('status', ['scheduled', 'live'])
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching public live rooms:', error);
      return [];
    }
  }

  /**
   * Get a specific live room
   */
  async getLiveRoom(roomId: string): Promise<LiveRoom | null> {
    try {
      const { data, error } = await supabase
        .from('live_rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching live room:', error);
      return null;
    }
  }

  /**
   * Update live room status
   */
  async updateLiveRoomStatus(roomId: string, status: LiveRoom['status']): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const updateData: any = { status };

      if (status === 'live') {
        updateData.started_at = new Date().toISOString();
      } else if (status === 'ended') {
        updateData.ended_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('live_rooms')
        .update(updateData)
        .eq('id', roomId)
        .eq('host_id', user.user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating live room status:', error);
      throw error;
    }
  }

  /**
   * Delete a live room
   */
  async deleteLiveRoom(roomId: string): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('live_rooms')
        .delete()
        .eq('id', roomId)
        .eq('host_id', user.user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting live room:', error);
      throw error;
    }
  }

  // =============================================
  // PARTICIPANT MANAGEMENT
  // =============================================

  /**
   * Join a live room
   */
  async joinLiveRoom(roomId: string): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Check if user is banned
      const isBanned = await this.isUserBanned(roomId, user.user.id);
      if (isBanned) throw new Error('You are banned from this room');

      const { error } = await supabase
        .from('live_room_participants')
        .upsert({
          room_id: roomId,
          user_id: user.user.id,
          is_active: true
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error joining live room:', error);
      throw error;
    }
  }

  /**
   * Leave a live room
   */
  async leaveLiveRoom(roomId: string): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('live_room_participants')
        .update({
          is_active: false,
          left_at: new Date().toISOString()
        })
        .eq('room_id', roomId)
        .eq('user_id', user.user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error leaving live room:', error);
      throw error;
    }
  }

  /**
   * Get room participants
   */
  async getRoomParticipants(roomId: string): Promise<LiveRoomParticipant[]> {
    try {
      const { data, error } = await supabase
        .from('live_room_participants')
        .select(`
          *,
          user:users(id, full_name, avatar_url)
        `)
        .eq('room_id', roomId)
        .eq('is_active', true)
        .order('joined_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching room participants:', error);
      return [];
    }
  }

  // =============================================
  // CHAT SYSTEM
  // =============================================

  /**
   * Send a chat message
   */
  async sendChatMessage(roomId: string, message: string, messageType: LiveChatMessage['message_type'] = 'text'): Promise<LiveChatMessage> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Check if user is banned
      const isBanned = await this.isUserBanned(roomId, user.user.id);
      if (isBanned) throw new Error('You are banned from this room');

      const { data, error } = await supabase
        .from('live_chat_messages')
        .insert({
          room_id: roomId,
          user_id: user.user.id,
          message,
          message_type: messageType
        })
        .select(`
          *,
          user:users(id, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  }

  /**
   * Get chat messages for a room
   */
  async getChatMessages(roomId: string, limit: number = 50): Promise<LiveChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('live_chat_messages')
        .select(`
          *,
          user:users(id, full_name, avatar_url)
        `)
        .eq('room_id', roomId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []).reverse();
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      return [];
    }
  }

  /**
   * Delete a chat message
   */
  async deleteChatMessage(messageId: string): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('live_chat_messages')
        .update({
          is_deleted: true,
          deleted_by: user.user.id,
          deleted_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('user_id', user.user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting chat message:', error);
      throw error;
    }
  }

  // =============================================
  // LIVE SALES
  // =============================================

  /**
   * Feature a product during live stream
   */
  async featureProduct(roomId: string, productId: number): Promise<LiveSale> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('live_sales')
        .insert({
          room_id: roomId,
          product_id: productId,
          featured_by: user.user.id
        })
        .select(`
          *,
          product:products(id, name, price, featured_image_url)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error featuring product:', error);
      throw error;
    }
  }

  /**
   * Get featured products for a room
   */
  async getFeaturedProducts(roomId: string): Promise<LiveSale[]> {
    try {
      const { data, error } = await supabase
        .from('live_sales')
        .select(`
          *,
          product:products(id, name, price, featured_image_url)
        `)
        .eq('room_id', roomId)
        .eq('is_active', true)
        .order('featured_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching featured products:', error);
      return [];
    }
  }

  // =============================================
  // ANALYTICS
  // =============================================

  /**
   * Get room statistics
   */
  async getRoomStatistics(roomId: string): Promise<LiveRoomStatistics | null> {
    try {
      const { data, error } = await supabase
        .rpc('get_room_statistics', { room_uuid: roomId });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching room statistics:', error);
      return null;
    }
  }

  /**
   * Log analytics event
   */
  async logAnalyticsEvent(roomId: string, metricName: string, metricValue: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('live_room_analytics')
        .insert({
          room_id: roomId,
          metric_name: metricName,
          metric_value: metricValue
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging analytics event:', error);
      throw error;
    }
  }

  // =============================================
  // UTILITY FUNCTIONS
  // =============================================

  /**
   * Generate a unique stream key
   */
  private async generateStreamKey(): Promise<string> {
    try {
      const { data, error } = await supabase
        .rpc('generate_stream_key');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating stream key:', error);
      // Fallback to client-side generation
      return 'live_' + Math.random().toString(36).substring(2, 15);
    }
  }

  /**
   * Check if user is banned from a room
   */
  private async isUserBanned(roomId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('is_user_banned', { room_uuid: roomId, user_uuid: userId });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error checking user ban status:', error);
      return false;
    }
  }

  // =============================================
  // REAL-TIME SUBSCRIPTIONS
  // =============================================

  /**
   * Subscribe to live room updates
   */
  subscribeToLiveRoom(roomId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`live_room:${roomId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'live_rooms',
        filter: `id=eq.${roomId}`
      }, callback)
      .subscribe();
  }

  /**
   * Subscribe to chat messages
   */
  subscribeToChatMessages(roomId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`chat:${roomId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'live_chat_messages',
        filter: `room_id=eq.${roomId}`
      }, callback)
      .subscribe();
  }

  /**
   * Subscribe to participant updates
   */
  subscribeToParticipants(roomId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`participants:${roomId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'live_room_participants',
        filter: `room_id=eq.${roomId}`
      }, callback)
      .subscribe();
  }

  /**
   * Subscribe to live sales updates
   */
  subscribeToLiveSales(roomId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`sales:${roomId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'live_sales',
        filter: `room_id=eq.${roomId}`
      }, callback)
      .subscribe();
  }
}

export const liveStreamingService = LiveStreamingService.getInstance(); 