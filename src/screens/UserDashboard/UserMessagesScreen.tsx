import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radii, shadows } from '../../constants/theme';
import HeaderWithMenu from '../SellerDashboard/components/HeaderWithMenu';
import { useApp } from '../../context/AppContext';
import Toast from 'react-native-toast-message';
import { scale, verticalScale, moderateScale } from '../../lib/scale';

export default function UserMessagesScreen() {
  const { state, getUserConversations, getConversation, sendMessage, markMessagesAsRead, deleteConversation } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [input, setInput] = useState('');

  // Load conversations on component mount
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await getUserConversations();
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
      Toast.show({ type: 'error', text1: 'Failed to load conversations' });
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const storeName = conv.stores?.name || 'Unknown Store';
    return storeName.toLowerCase().includes(searchQuery.toLowerCase()) || 
           conv.last_message?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleConversationSelect = async (conversation) => {
    try {
      setLoading(true);
      const fullConversation = await getConversation(conversation.id);
      setSelectedConversation(fullConversation);
      
      // Mark messages as read
      await markMessagesAsRead(conversation.id);
    } catch (error) {
      console.error('Error loading conversation:', error);
      Toast.show({ type: 'error', text1: 'Failed to load conversation' });
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedConversation) return;
    
    setLoading(true);
    try {
      await sendMessage(selectedConversation.id, input.trim());
      setInput('');
      Toast.show({ type: 'success', text1: 'Message sent!' });
      
      // Reload conversation to get updated messages
      const updatedConversation = await getConversation(selectedConversation.id);
      setSelectedConversation(updatedConversation);
    } catch (error) {
      console.error('Error sending message:', error);
      Toast.show({ type: 'error', text1: 'Failed to send message' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    Alert.alert(
      'Delete Conversation',
      'Are you sure you want to delete this conversation? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await deleteConversation(conversationId);
              setSelectedConversation(null);
              loadConversations(); // Reload conversations
              Toast.show({ type: 'success', text1: 'Conversation deleted!' });
            } catch (error) {
              console.error('Error deleting conversation:', error);
              Toast.show({ type: 'error', text1: 'Failed to delete conversation' });
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const minutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${minutes}m`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours}h`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getStoreName = (conversation) => {
    const store = conversation.stores;
    return store?.name || 'Unknown Store';
  };

  const getStoreAvatar = (conversation) => {
    const store = conversation.stores;
    return store?.logo_url || 'https://randomuser.me/api/portraits/lego/1.jpg';
  };

  const renderConversation = ({ item }) => (
    <TouchableOpacity 
      style={styles.conversationCard}
      onPress={() => handleConversationSelect(item)}
    >
      <View style={styles.conversationHeader}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: getStoreAvatar(item) }} style={styles.avatar} />
          {item.unread_count > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unread_count}</Text>
            </View>
          )}
        </View>
        <View style={styles.conversationInfo}>
          <View style={styles.nameTimeRow}>
            <Text style={styles.conversationName}>{getStoreName(item)}</Text>
            <Text style={styles.timeText}>{formatTime(item.last_message_at)}</Text>
          </View>
          <View style={styles.messageRow}>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.last_message || 'No messages yet'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Chat view
  if (selectedConversation) {
    return (
      <View style={styles.container}>
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => setSelectedConversation(null)} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Image source={{ uri: getStoreAvatar(selectedConversation) }} style={styles.chatAvatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.chatName}>{getStoreName(selectedConversation)}</Text>
            <Text style={styles.chatStatus}>
              {selectedConversation.unread_count > 0 ? `${selectedConversation.unread_count} unread` : 'All read'}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => handleDeleteConversation(selectedConversation.id)} 
            style={styles.deleteBtn}
          >
            <Ionicons name="trash-outline" size={20} color={colors.discount} />
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={selectedConversation.messages || []}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View
              style={[styles.bubble, item.sender_type === 'customer' ? styles.bubbleMe : styles.bubbleThem]}
            >
              <Text style={styles.bubbleText}>{item.message}</Text>
              <Text style={styles.messageTime}>{formatTime(item.created_at)}</Text>
            </View>
          )}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        />
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || loading}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={input.trim() ? colors.white : colors.textSecondary} 
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Conversations list view
  return (
    <View style={styles.container}>
      <HeaderWithMenu />
      
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.subtitle}>Chat with sellers and support</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          keyExtractor={item => item.id}
          renderItem={renderConversation}
          contentContainerStyle={styles.conversationsList}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={loadConversations}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.m,
    paddingTop: spacing.m,
    paddingBottom: spacing.s,
  },
  title: {
    fontSize: scale(24),
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: scale(16),
    fontWeight: '400',
    fontFamily: 'monospace',
    color: colors.textSecondary,
  },
  searchContainer: {
    paddingHorizontal: spacing.m,
    marginBottom: spacing.m,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    ...shadows.card,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.s,
    fontSize: scale(16),
    color: colors.text,
  },
  conversationsList: {
    paddingHorizontal: spacing.m,
    paddingBottom: 120,
  },
  conversationCard: {
    backgroundColor: colors.card,
    borderRadius: radii.medium,
    padding: spacing.m,
    marginBottom: spacing.s,
    ...shadows.card,
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.m,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.card,
  },
  conversationInfo: {
    flex: 1,
  },
  nameTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  conversationName: {
    fontSize: scale(16),
    fontWeight: 'bold',
    color: colors.text,
  },
  timeText: {
    fontSize: scale(12),
    color: colors.textSecondary,
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: scale(14),
    color: colors.textSecondary,
    marginRight: spacing.s,
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#fff',
    fontSize: scale(12),
    fontWeight: 'bold',
  },
  messageTitle: {
    fontSize: scale(16),
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: 4,
  },
  messagePreview: {
    fontSize: scale(12),
    fontWeight: '700',
    fontFamily: 'monospace',
    color: colors.textSecondary,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingTop: spacing.s,
    paddingBottom: spacing.s,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: spacing.s,
    marginRight: spacing.s,
  },
  chatAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.s,
  },
  chatName: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  chatStatus: {
    fontSize: scale(14),
    color: colors.textSecondary,
  },
  deleteBtn: {
    padding: spacing.s,
  },
  messagesContent: {
    paddingHorizontal: spacing.m,
    paddingBottom: spacing.m,
  },
  bubble: {
    maxWidth: '80%',
    padding: spacing.s,
    borderRadius: 10,
    marginBottom: spacing.xs,
  },
  bubbleMe: {
    backgroundColor: colors.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 0,
  },
  bubbleThem: {
    backgroundColor: colors.card,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 0,
  },
  bubbleText: {
    fontSize: scale(14),
    color: colors.text,
  },
  messageTime: {
    fontSize: scale(10),
    color: colors.textSecondary,
    marginTop: spacing.xs,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radii.large,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    fontSize: scale(16),
    color: colors.text,
    marginRight: spacing.s,
    maxHeight: 100,
    minHeight: 40,
  },
  sendBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.large,
    padding: spacing.s,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: colors.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.m,
  },
  loadingText: {
    fontSize: scale(18),
    color: colors.textSecondary,
  },
}); 