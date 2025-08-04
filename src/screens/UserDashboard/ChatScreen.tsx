import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  ActivityIndicator,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { scale, verticalScale, moderateScale } from '../../lib/scale';
import { supabase } from '../../config/supabase';
import BackButton from '../../components/BackButton';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_type: 'user' | 'seller' | 'system';
  message_type: 'text' | 'image' | 'file' | 'product' | 'order';
  created_at: string;
  is_read: boolean;
  read_at?: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
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

interface Conversation {
  id: string;
  subject: string;
  status: string;
  stores?: {
    name: string;
    logo_url: string;
  };
  products?: {
    name: string;
    price: number;
    product_images: Array<{ image_url: string }>;
  };
}

export default function ChatScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { conversationId } = route.params as { conversationId: string };
  
  console.log('ChatScreen loaded with conversationId:', conversationId);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState(false);
  const [lastSeen, setLastSeen] = useState<string>('');
  
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const realtimeSubscription = useRef<any>(null);
  const typingAnimation = useRef(new Animated.Value(0)).current;

  // Mock data for testing
  const mockConversation: Conversation = {
    id: conversationId,
    subject: 'Question about wireless headphones',
    status: 'active',
    stores: {
      name: 'TechStore',
      logo_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=100&q=80'
    },
    products: {
      name: 'Premium Wireless Headphones',
      price: 199.99,
      product_images: [{ image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=100&q=80' }]
    }
  };

  const mockMessages: Message[] = [
    {
      id: 'msg1',
      content: 'Hi! I have a question about the wireless headphones.',
      sender_id: 'user1',
      sender_type: 'user',
      message_type: 'text',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      is_read: true,
      status: 'read',
      users: {
        full_name: 'John Doe',
        avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80'
      }
    },
    {
      id: 'msg2',
      content: 'Hello! I\'d be happy to help you with any questions about our wireless headphones. What would you like to know?',
      sender_id: 'store1',
      sender_type: 'seller',
      message_type: 'text',
      created_at: new Date(Date.now() - 3000000).toISOString(),
      is_read: true,
      status: 'read',
      stores: {
        name: 'TechStore',
        logo_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=100&q=80'
      }
    },
    {
      id: 'msg3',
      content: 'What\'s the battery life like?',
      sender_id: 'user1',
      sender_type: 'user',
      message_type: 'text',
      created_at: new Date(Date.now() - 2400000).toISOString(),
      is_read: true,
      status: 'read',
      users: {
        full_name: 'John Doe',
        avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80'
      }
    },
    {
      id: 'msg4',
      content: 'The battery life is excellent! You get up to 30 hours of playback time with ANC off, and about 20 hours with ANC on. Plus, you get 5 hours of playback with just 10 minutes of charging.',
      sender_id: 'store1',
      sender_type: 'seller',
      message_type: 'text',
      created_at: new Date(Date.now() - 1800000).toISOString(),
      is_read: true,
      status: 'read',
      stores: {
        name: 'TechStore',
        logo_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=100&q=80'
      }
    },
    {
      id: 'msg5',
      content: 'That sounds great! Thanks for the quick response!',
      sender_id: 'user1',
      sender_type: 'user',
      message_type: 'text',
      created_at: new Date(Date.now() - 1200000).toISOString(),
      is_read: false,
      status: 'delivered',
      users: {
        full_name: 'John Doe',
        avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80'
      }
    }
  ];

  useEffect(() => {
    loadConversation();
    loadMessages();
    setupRealtimeSubscription();
    startTypingAnimation();

    return () => {
      cleanupRealtimeSubscription();
    };
  }, [conversationId]);

  const setupRealtimeSubscription = useCallback(() => {
    try {
      // Subscribe to new messages
      realtimeSubscription.current = supabase
        .channel(`messages:${conversationId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        }, async (payload) => {
          console.log('New message received:', payload.new);
          const newMessage = payload.new as Message;
          
          // Get current user
          const { data: { user } } = await supabase.auth.getUser();
          
          // Add sender info
          if (newMessage.sender_type === 'seller') {
            newMessage.stores = mockConversation.stores;
          } else {
            newMessage.users = {
              full_name: 'John Doe',
              avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80'
            };
          }
          
          setMessages(prev => [...prev, newMessage]);
          
          // Mark as read if it's from the other person
          if (newMessage.sender_type !== 'user' && user) {
            markMessageAsRead(newMessage.id);
          }
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        }, (payload) => {
          console.log('Message updated:', payload.new);
          const updatedMessage = payload.new as Message;
          setMessages(prev => 
            prev.map(msg => 
              msg.id === updatedMessage.id ? { ...msg, ...updatedMessage } : msg
            )
          );
        })
        .subscribe();

      // Subscribe to typing indicators
      const typingChannel = supabase
        .channel(`typing:${conversationId}`)
        .on('broadcast', { event: 'typing' }, async (payload) => {
          console.log('Typing indicator received:', payload);
          const { data: { user } } = await supabase.auth.getUser();
          if (payload.sender_id !== user?.id) {
            setIsOtherTyping(true);
            setTimeout(() => setIsOtherTyping(false), 3000);
          }
        })
        .subscribe();

    } catch (error) {
      console.error('Error setting up realtime subscription:', error);
    }
  }, [conversationId]);

  const cleanupRealtimeSubscription = useCallback(() => {
    if (realtimeSubscription.current) {
      supabase.removeChannel(realtimeSubscription.current);
      realtimeSubscription.current = null;
    }
  }, []);

  const startTypingAnimation = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(typingAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(typingAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [typingAnimation]);

  const loadConversation = useCallback(async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/messaging/conversations/${conversationId}`);
      // const data = await response.json();
      // setConversation(data.data.conversation);
      
      // Using mock data for now
      setConversation(mockConversation);
      setOnlineStatus(true); // Mock online status
      setLastSeen('2 minutes ago');
    } catch (error) {
      console.error('Error loading conversation:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to load conversation',
        text2: error.message
      });
    }
  }, [conversationId]);

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/messaging/conversations/${conversationId}`);
      // const data = await response.json();
      // setMessages(data.data.messages);
      
      // Using mock data for now
      setMessages(mockMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to load messages',
        text2: error.message
      });
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  const markMessageAsRead = useCallback(async (messageId: string) => {
    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/messaging/messages/${messageId}/read`, { method: 'PUT' });
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, is_read: true, status: 'read' } : msg
        )
      );
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }, []);

  const sendMessage = useCallback(async () => {
    if (!newMessage.trim()) return;

    try {
      setSending(true);
      const messageData = {
        content: newMessage.trim(),
        message_type: 'text',
        metadata: {}
      };

      // Create temporary message for immediate feedback
      const tempMessage: Message = {
        id: `temp_${Date.now()}`,
        content: newMessage.trim(),
        sender_id: 'user1',
        sender_type: 'user',
        message_type: 'text',
        created_at: new Date().toISOString(),
        is_read: false,
        status: 'sending',
        users: {
          full_name: 'John Doe',
          avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80'
        }
      };

      // Add message to local state immediately
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // TODO: Replace with actual API call
      // const response = await fetch(`/api/messaging/conversations/${conversationId}/messages`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(messageData)
      // });
      // const data = await response.json();

      // Simulate API delay
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempMessage.id 
              ? { ...msg, id: `msg_${Date.now()}`, status: 'sent' }
              : msg
          )
        );
      }, 1000);

      // Simulate delivery
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempMessage.id 
              ? { ...msg, status: 'delivered' }
              : msg
          )
        );
      }, 2000);

      // Send typing indicator
      try {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.channel(`typing:${conversationId}`).send({
          type: 'broadcast',
          event: 'typing',
          payload: { sender_id: user?.id || 'user1', is_typing: false }
        });
      } catch (error) {
        console.error('Error sending typing indicator:', error);
      }

      Toast.show({
        type: 'success',
        text1: 'Message sent',
        text2: 'Your message has been sent successfully'
      });
    } catch (error) {
      console.error('Error sending message:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to send message',
        text2: error.message
      });
    } finally {
      setSending(false);
    }
  }, [newMessage, conversationId]);

  const handleTyping = useCallback(async (text: string) => {
    setNewMessage(text);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set typing indicator
    setIsTyping(true);
    
    // Send typing indicator
    try {
      const { data: { user } } = await supabase.auth.getUser();
      supabase.channel(`typing:${conversationId}`).send({
        type: 'broadcast',
        event: 'typing',
        payload: { sender_id: user?.id || 'user1', is_typing: true }
      });
    } catch (error) {
      console.error('Error sending typing indicator:', error);
    }
    
    // Clear typing indicator after 2 seconds of no typing
    typingTimeoutRef.current = setTimeout(async () => {
      setIsTyping(false);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        supabase.channel(`typing:${conversationId}`).send({
          type: 'broadcast',
          event: 'typing',
          payload: { sender_id: user?.id || 'user1', is_typing: false }
        });
      } catch (error) {
        console.error('Error sending typing indicator:', error);
      }
    }, 2000);
  }, [conversationId]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isOwnMessage = (message: Message) => {
    return message.sender_type === 'user';
  };

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case 'sending':
        return <ActivityIndicator size={12} color={colors.textSecondary} />;
      case 'sent':
        return <Ionicons name="checkmark" size={12} color={colors.textSecondary} />;
      case 'delivered':
        return <Ionicons name="checkmark-done" size={12} color={colors.textSecondary} />;
      case 'read':
        return <Ionicons name="checkmark-done" size={12} color={colors.success} />;
      case 'failed':
        return <Ionicons name="close-circle" size={12} color={colors.error} />;
      default:
        return null;
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isOwn = isOwnMessage(item);
    const showAvatar = index === 0 || messages[index - 1]?.sender_id !== item.sender_id;
    const showTime = index === messages.length - 1 || 
      messages[index + 1]?.sender_id !== item.sender_id ||
      new Date(messages[index + 1]?.created_at).getTime() - new Date(item.created_at).getTime() > 300000; // 5 minutes

    return (
      <View style={[styles.messageContainer, isOwn ? styles.ownMessage : styles.otherMessage]}>
        {!isOwn && showAvatar && (
          <Image
            source={{ uri: item.stores?.logo_url || item.users?.avatar_url }}
            style={styles.avatar}
          />
        )}
        
        <View style={[styles.messageBubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
          <Text style={[styles.messageText, isOwn ? styles.ownMessageText : styles.otherMessageText]}>
            {item.content}
          </Text>
          
          {showTime && (
            <View style={styles.messageFooter}>
              <Text style={[styles.messageTime, isOwn ? styles.ownMessageTime : styles.otherMessageTime]}>
                {formatTime(item.created_at)}
              </Text>
              {isOwn && (
                <View style={styles.messageStatus}>
                  {getMessageStatusIcon(item.status)}
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isOtherTyping) return null;
    
    return (
      <View style={styles.typingContainer}>
        <Image
          source={{ uri: conversation?.stores?.logo_url }}
          style={styles.typingAvatar}
        />
        <View style={styles.typingBubble}>
          <View style={styles.typingDots}>
            <Animated.View style={[styles.typingDot, { opacity: typingAnimation }]} />
            <Animated.View style={[styles.typingDot, { opacity: typingAnimation }]} />
            <Animated.View style={[styles.typingDot, { opacity: typingAnimation }]} />
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading conversation...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <BackButton style={styles.backButton} />
        
        <View style={styles.headerInfo}>
          <Image
            source={{ uri: conversation?.stores?.logo_url }}
            style={styles.headerAvatar}
          />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{conversation?.stores?.name}</Text>
            <View style={styles.headerSubtitle}>
              {onlineStatus ? (
                <View style={styles.onlineStatus}>
                  <View style={styles.onlineIndicator} />
                  <Text style={styles.onlineText}>Online</Text>
                </View>
              ) : (
                <Text style={styles.lastSeenText}>Last seen {lastSeen}</Text>
              )}
            </View>
          </View>
        </View>
        
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={renderTypingIndicator}
      />

      {/* Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={newMessage}
            onChangeText={handleTyping}
            placeholder="Type a message..."
            placeholderTextColor={colors.textSecondary}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity 
            style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!newMessage.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Ionicons name="send" size={20} color={colors.white} />
            )}
          </TouchableOpacity>
        </View>
        
        {/* Test button to simulate seller response */}
        <TouchableOpacity 
          style={styles.testButton}
          onPress={() => {
            const testMessage: Message = {
              id: `test_${Date.now()}`,
              content: 'Thanks for your message! I\'ll get back to you shortly.',
              sender_id: 'store1',
              sender_type: 'seller',
              message_type: 'text',
              created_at: new Date().toISOString(),
              is_read: false,
              status: 'sent',
              stores: {
                name: 'TechStore',
                logo_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=100&q=80'
              }
            };
            setMessages(prev => [...prev, testMessage]);
            Toast.show({
              type: 'success',
              text1: 'Test Message',
              text2: 'Simulated seller response added!'
            });
          }}
        >
          <Text style={styles.testButtonText}>Simulate Seller Response</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    marginTop: spacing.m,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.s,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: radii.circle,
    marginRight: spacing.s,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: scale(16),
    fontWeight: '600',
    color: colors.text,
  },
  headerSubtitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: radii.circle,
    backgroundColor: colors.success,
    marginRight: spacing.xxs,
  },
  onlineText: {
    fontSize: scale(12),
    color: colors.textSecondary,
  },
  lastSeenText: {
    fontSize: scale(12),
    color: colors.textSecondary,
  },
  moreButton: {
    padding: spacing.xs,
  },
  messagesList: {
    padding: spacing.m,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: spacing.s,
  },
  ownMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: radii.circle,
    marginRight: spacing.xs,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: radii.medium,
  },
  ownBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: radii.xs,
  },
  otherBubble: {
    backgroundColor: colors.card,
    borderBottomLeftRadius: radii.xs,
  },
  messageText: {
    fontSize: scale(14),
    lineHeight: 20,
  },
  ownMessageText: {
    color: colors.white,
  },
  otherMessageText: {
    color: colors.text,
  },
  messageTime: {
    fontSize: scale(10),
    marginTop: spacing.xxs,
  },
  ownMessageTime: {
    color: colors.white,
    opacity: 0.8,
  },
  otherMessageTime: {
    color: colors.textSecondary,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xxs,
  },
  messageStatus: {
    marginLeft: spacing.xs,
  },
  typingContainer: {
    flexDirection: 'row',
    marginBottom: spacing.s,
  },
  typingAvatar: {
    width: 32,
    height: 32,
    borderRadius: radii.circle,
    marginRight: spacing.xs,
  },
  typingBubble: {
    backgroundColor: colors.card,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: radii.medium,
    borderBottomLeftRadius: radii.xs,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: radii.circle,
    backgroundColor: colors.textSecondary,
    marginHorizontal: 1,
  },
  typingDot1: {
    opacity: 0.4,
  },
  typingDot2: {
    opacity: 0.7,
  },
  typingDot3: {
    opacity: 1,
  },
  inputContainer: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radii.medium,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    fontSize: scale(14),
    color: colors.text,
    maxHeight: 100,
    marginRight: spacing.s,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.circle,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },
  testButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.medium,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    alignItems: 'center',
    marginTop: spacing.s,
  },
  testButtonText: {
    color: colors.white,
    fontSize: scale(14),
    fontWeight: '600',
  },
}); 