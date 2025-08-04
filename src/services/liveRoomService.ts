import { supabase } from '../config/supabase';

export interface LiveRoom {
  id: string;
  title: string;
  description: string;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  host_id: string;
  viewer_count: number;
  max_viewers: number;
  scheduled_at: string;
  started_at?: string;
  ended_at?: string;
  stream_url?: string;
  thumbnail_url?: string;
  is_private: boolean;
  allow_comments: boolean;
  allow_reactions: boolean;
  created_at: string;
  updated_at: string;
  host?: {
    full_name: string;
    avatar_url: string;
  };
}

export interface ChatMessage {
  id: string;
  live_room_id: string;
  user_id: string;
  message: string;
  message_type: 'text' | 'reaction' | 'question' | 'system';
  is_deleted: boolean;
  created_at: string;
  user?: {
    full_name: string;
    avatar_url: string;
  };
}

export interface CreateLiveRoomData {
  title: string;
  description: string;
  scheduled_at?: string;
  is_private?: boolean;
  allow_comments?: boolean;
  allow_reactions?: boolean;
  max_viewers?: number;
}

export interface LiveRoomFilters {
  status?: string;
  host_id?: string;
  is_private?: boolean;
}

class LiveRoomService {
  // Get all live rooms with filters
  async getLiveRooms(filters: LiveRoomFilters = {}, limit: number = 20, page: number = 1): Promise<{ data: LiveRoom[], pagination: any }> {
    try {
      let query = supabase
        .from('live_rooms')
        .select(`
          *,
          host:users(full_name, avatar_url)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.host_id) {
        query = query.eq('host_id', filters.host_id);
      }
      if (filters.is_private !== undefined) {
        query = query.eq('is_private', filters.is_private);
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching live rooms:', error);
      throw error;
    }
  }

  // Get a specific live room
  async getLiveRoom(roomId: string): Promise<LiveRoom> {
    try {
      const { data, error } = await supabase
        .from('live_rooms')
        .select(`
          *,
          host:users(full_name, avatar_url)
        `)
        .eq('id', roomId)
        .single();

      if (error || !data) {
        throw new Error('Live room not found');
      }

      return data;
    } catch (error) {
      console.error('Error fetching live room:', error);
      throw error;
    }
  }

  // Create a new live room
  async createLiveRoom(data: CreateLiveRoomData): Promise<LiveRoom> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const roomData = {
        host_id: user.id,
        title: data.title,
        description: data.description,
        scheduled_at: data.scheduled_at,
        is_private: data.is_private || false,
        allow_comments: data.allow_comments !== false,
        allow_reactions: data.allow_reactions !== false,
        max_viewers: data.max_viewers || 1000,
        status: data.scheduled_at ? 'scheduled' : 'live'
      };

      const { data: room, error } = await supabase
        .from('live_rooms')
        .insert(roomData)
        .select(`
          *,
          host:users(full_name, avatar_url)
        `)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return room;
    } catch (error) {
      console.error('Error creating live room:', error);
      throw error;
    }
  }

  // Start a live room
  async startLiveRoom(roomId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('live_rooms')
        .update({
          status: 'live',
          started_at: new Date().toISOString()
        })
        .eq('id', roomId);

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error starting live room:', error);
      throw error;
    }
  }

  // End a live room
  async endLiveRoom(roomId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('live_rooms')
        .update({
          status: 'ended',
          ended_at: new Date().toISOString()
        })
        .eq('id', roomId);

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error ending live room:', error);
      throw error;
    }
  }

  // Join a live room
  async joinLiveRoom(roomId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('live_room_participants')
        .insert({
          live_room_id: roomId,
          user_id: user.id
        });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error joining live room:', error);
      throw error;
    }
  }

  // Leave a live room
  async leaveLiveRoom(roomId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('live_room_participants')
        .update({
          left_at: new Date().toISOString()
        })
        .eq('live_room_id', roomId)
        .eq('user_id', user.id);

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error leaving live room:', error);
      throw error;
    }
  }

  // Get chat messages for a live room
  async getChatMessages(roomId: string, limit: number = 100): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('live_chat_messages')
        .select(`
          *,
          user:users(full_name, avatar_url)
        `)
        .eq('live_room_id', roomId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      throw error;
    }
  }

  // Send a chat message
  async sendMessage(roomId: string, message: string, messageType: 'text' | 'reaction' = 'text'): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('live_chat_messages')
        .insert({
          live_room_id: roomId,
          user_id: user.id,
          message,
          message_type: messageType
        });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Get live room participants
  async getParticipants(roomId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('live_room_participants')
        .select(`
          *,
          user:users(full_name, avatar_url)
        `)
        .eq('live_room_id', roomId)
        .is('left_at', null)
        .order('joined_at', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching participants:', error);
      throw error;
    }
  }

  // Update live room settings
  async updateLiveRoom(roomId: string, updates: Partial<LiveRoom>): Promise<void> {
    try {
      const { error } = await supabase
        .from('live_rooms')
        .update(updates)
        .eq('id', roomId);

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error updating live room:', error);
      throw error;
    }
  }

  // Delete a live room
  async deleteLiveRoom(roomId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('live_rooms')
        .delete()
        .eq('id', roomId);

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error deleting live room:', error);
      throw error;
    }
  }

  // Get user's live rooms (as host)
  async getUserLiveRooms(userId: string): Promise<LiveRoom[]> {
    try {
      const { data, error } = await supabase
        .from('live_rooms')
        .select('*')
        .eq('host_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user live rooms:', error);
      throw error;
    }
  }

  // Subscribe to real-time updates
  subscribeToLiveRoom(roomId: string, onUpdate: (payload: any) => void) {
    return supabase
      .channel(`live_room:${roomId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'live_rooms',
        filter: `id=eq.${roomId}`
      }, onUpdate)
      .subscribe();
  }

  // Subscribe to chat messages
  subscribeToChat(roomId: string, onMessage: (payload: any) => void) {
    return supabase
      .channel(`live_room_chat:${roomId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'live_chat_messages',
        filter: `live_room_id=eq.${roomId}`
      }, onMessage)
      .subscribe();
  }
}

export const liveRoomService = new LiveRoomService(); 