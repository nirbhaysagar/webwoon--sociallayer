import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { scale, verticalScale, moderateScale } from '../../lib/scale';
import { supabase } from '../../config/supabase';
import BackButton from '../../components/BackButton';

interface ChatMessage {
  id: string;
  message: string;
  message_type: 'text' | 'reaction' | 'question' | 'system';
  user_id: string;
  created_at: string;
  user?: {
    full_name: string;
    avatar_url: string;
  };
}

interface LiveRoom {
  id: string;
  title: string;
  description: string;
  status: string;
  host_id: string;
  viewer_count: number;
  stream_url?: string;
  host?: {
    full_name: string;
    avatar_url: string;
  };
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function LiveRoomViewerScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { roomId } = route.params as { roomId: string };

  const [liveRoom, setLiveRoom] = useState<LiveRoom | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [viewerCount, setViewerCount] = useState(0);

  const chatListRef = useRef<FlatList>(null);
  const realtimeSubscription = useRef<any>(null);

  useEffect(() => {
    loadLiveRoom();
    joinRoom();
    setupRealtimeSubscription();

    return () => {
      leaveRoom();
      cleanupRealtimeSubscription();
    };
  }, [roomId]);

  const loadLiveRoom = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data: room, error } = await supabase
        .from('live_rooms')
        .select(`
          *,
          host:users(full_name, avatar_url)
        `)
        .eq('id', roomId)
        .single();

      if (error || !room) {
        throw new Error('Live room not found');
      }

      setLiveRoom(room);
      setViewerCount(room.viewer_count);

      // Load chat messages
      const { data: messages, error: messagesError } = await supabase
        .from('live_chat_messages')
        .select(`
          *,
          user:users(full_name, avatar_url)
        `)
        .eq('live_room_id', roomId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .limit(100);

      if (!messagesError) {
        setChatMessages(messages || []);
      }
    } catch (error) {
      console.error('Error loading live room:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to load live room',
        text2: error.message
      });
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  const joinRoom = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('live_room_participants')
        .insert({
          live_room_id: roomId,
          user_id: user.id
        });

      if (!error) {
        setIsJoined(true);
      }
    } catch (error) {
      console.error('Error joining room:', error);
    }
  }, [roomId]);

  const leaveRoom = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('live_room_participants')
        .update({ left_at: new Date().toISOString() })
        .eq('live_room_id', roomId)
        .eq('user_id', user.id);

      if (!error) {
        setIsJoined(false);
      }
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  }, [roomId]);

  const setupRealtimeSubscription = useCallback(() => {
    try {
      // Subscribe to new chat messages
      realtimeSubscription.current = supabase
        .channel(`live_room:${roomId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'live_chat_messages',
          filter: `live_room_id=eq.${roomId}`
        }, (payload) => {
          const newMessage = payload.new as ChatMessage;
          setChatMessages(prev => [...prev, newMessage]);
          
          // Scroll to bottom
          setTimeout(() => {
            chatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'live_rooms',
          filter: `id=eq.${roomId}`
        }, (payload) => {
          const updatedRoom = payload.new as LiveRoom;
          setViewerCount(updatedRoom.viewer_count);
        })
        .subscribe();
    } catch (error) {
      console.error('Error setting up realtime subscription:', error);
    }
  }, [roomId]);

  const cleanupRealtimeSubscription = useCallback(() => {
    if (realtimeSubscription.current) {
      supabase.removeChannel(realtimeSubscription.current);
      realtimeSubscription.current = null;
    }
  }, []);

  const sendMessage = useCallback(async () => {
    if (!newMessage.trim()) return;

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
          message: newMessage.trim(),
          message_type: 'text'
        });

      if (error) {
        throw new Error('Failed to send message');
      }

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to send message',
        text2: error.message
      });
    }
  }, [newMessage, roomId]);

  const sendReaction = useCallback(async (reactionType: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('live_chat_messages')
        .insert({
          live_room_id: roomId,
          user_id: user.id,
          message: reactionType,
          message_type: 'reaction'
        });

      if (error) {
        console.error('Error sending reaction:', error);
      }
    } catch (error) {
      console.error('Error sending reaction:', error);
    }
  }, [roomId]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderChatMessage = ({ item }: { item: ChatMessage }) => (
    <View style={styles.chatMessage}>
      <View style={styles.messageHeader}>
        <Text style={styles.userName}>
          {item.user?.full_name || 'Anonymous'}
        </Text>
        <Text style={styles.messageTime}>
          {formatTime(item.created_at)}
        </Text>
      </View>
      
      {item.message_type === 'reaction' ? (
        <View style={styles.reactionContainer}>
          <Text style={styles.reactionText}>{item.message}</Text>
        </View>
      ) : (
        <Text style={styles.messageText}>{item.message}</Text>
      )}
    </View>
  );

  const renderReactionButton = (reaction: string, icon: string) => (
    <TouchableOpacity
      key={reaction}
      style={styles.reactionButton}
      onPress={() => sendReaction(reaction)}
    >
      <Text style={styles.reactionButtonText}>{icon}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading live room...</Text>
      </View>
    );
  }

  if (!liveRoom) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
        <Text style={styles.errorTitle}>Room Not Found</Text>
        <Text style={styles.errorMessage}>
          This live room could not be found or has ended.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton style={styles.backButton} />
        <View style={styles.headerContent}>
          <Text style={styles.roomTitle} numberOfLines={1}>
            {liveRoom?.title || 'Live Room'}
          </Text>
          <View style={styles.headerStats}>
            <View style={styles.viewerCount}>
              <Ionicons name="eye-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.viewerCountText}>{viewerCount} watching</Text>
            </View>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.chatToggle} 
          onPress={() => setShowChat(!showChat)}
        >
          <Ionicons 
            name={showChat ? "chatbubble-outline" : "chatbubble"} 
            size={24} 
            color={colors.text} 
          />
        </TouchableOpacity>
      </View>

      {/* Video Player Area */}
      <View style={styles.videoContainer}>
        <View style={styles.videoPlaceholder}>
          <Ionicons name="videocam-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.videoPlaceholderText}>Live Stream</Text>
          <Text style={styles.videoPlaceholderSubtext}>
            {liveRoom.title}
          </Text>
        </View>

        {/* Live Indicator */}
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>

        {/* Viewer Count */}
        <View style={styles.viewerCount}>
          <Ionicons name="eye-outline" size={16} color={colors.white} />
          <Text style={styles.viewerCountText}>{viewerCount}</Text>
        </View>

        {/* Close Button */}
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Chat Area */}
      {showChat && (
        <View style={styles.chatContainer}>
          {/* Chat Header */}
          <View style={styles.chatHeader}>
            <Text style={styles.chatTitle}>Live Chat</Text>
            <TouchableOpacity onPress={() => setShowChat(false)}>
              <Ionicons name="chevron-down" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Chat Messages */}
          <FlatList
            ref={chatListRef}
            data={chatMessages}
            renderItem={renderChatMessage}
            keyExtractor={(item) => item.id}
            style={styles.chatList}
            showsVerticalScrollIndicator={false}
          />

          {/* Quick Reactions */}
          <View style={styles.reactionsContainer}>
            {renderReactionButton('❤️', '❤️')}
            {renderReactionButton('🔥', '🔥')}
            {renderReactionButton('👏', '👏')}
            {renderReactionButton('😍', '😍')}
            {renderReactionButton('🎉', '🎉')}
          </View>

          {/* Message Input */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.inputContainer}
          >
            <TextInput
              style={styles.messageInput}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message..."
              placeholderTextColor={colors.textSecondary}
              multiline
              maxLength={200}
            />
            <TouchableOpacity
              style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={!newMessage.trim()}
            >
              <Ionicons name="send" size={20} color={colors.white} />
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      )}

      {/* Chat Toggle Button */}
      {!showChat && (
        <TouchableOpacity
          style={styles.chatToggleButton}
          onPress={() => setShowChat(true)}
        >
          <Ionicons name="chatbubble-outline" size={24} color={colors.white} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: scale(16),
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  errorTitle: {
    fontSize: scale(20),
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.m,
    marginBottom: spacing.s,
  },
  errorMessage: {
    fontSize: scale(14),
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  backButton: {
    marginRight: spacing.s,
  },
  headerContent: {
    flex: 1,
  },
  roomTitle: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewerCount: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.m,
  },
  viewerCountText: {
    fontSize: scale(12),
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.white,
    marginRight: spacing.xs,
  },
  liveText: {
    color: colors.white,
    fontSize: scale(10),
    fontWeight: 'bold',
  },
  chatToggle: {
    width: 40,
    height: 40,
    borderRadius: radii.circle,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoContainer: {
    height: screenHeight * 0.6,
    backgroundColor: colors.surface,
    position: 'relative',
  },
  videoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  videoPlaceholderText: {
    fontSize: scale(18),
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.m,
  },
  videoPlaceholderSubtext: {
    fontSize: scale(14),
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: colors.card,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  chatTitle: {
    fontSize: scale(16),
    fontWeight: '600',
    color: colors.text,
  },
  chatList: {
    flex: 1,
    paddingHorizontal: spacing.l,
  },
  chatMessage: {
    marginBottom: spacing.s,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  userName: {
    fontSize: scale(12),
    fontWeight: '600',
    color: colors.text,
    marginRight: spacing.xs,
  },
  messageTime: {
    fontSize: scale(10),
    color: colors.textSecondary,
  },
  messageText: {
    fontSize: scale(14),
    color: colors.text,
    lineHeight: 20,
  },
  reactionContainer: {
    alignItems: 'center',
  },
  reactionText: {
    fontSize: scale(24),
  },
  reactionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.s,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  reactionButton: {
    padding: spacing.xs,
  },
  reactionButtonText: {
    fontSize: scale(20),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  messageInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.medium,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    fontSize: scale(14),
    color: colors.text,
    marginRight: spacing.s,
    maxHeight: 80,
  },
  sendButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: radii.circle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },
  chatToggleButton: {
    position: 'absolute',
    bottom: spacing.l,
    right: spacing.l,
    width: 56,
    height: 56,
    borderRadius: radii.circle,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
}); 